import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// MongoDB connection URI
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kick-haven-local";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
  }
  return cachedClient;
}

/**
 * Handles GET and POST requests for comments related to a specific post.
 */
export async function GET(
  request: Request,
  { params }: { params: { parentPostId: string } }
) {
  const { parentPostId } = params;

  // Validate presence and type of parentPostId
  if (!parentPostId || typeof parentPostId !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing parent post ID" },
      { status: 400 }
    );
  }

  // Validate parentPostId
  if (!ObjectId.isValid(parentPostId)) {
    return NextResponse.json(
      { error: "Invalid parent post ID format" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const posts = db.collection("posts");

    // Fetch comments where parentPost is false and parentPostId matches
    const comments = await posts
      .find({
        parentPost: false,
        parentPostId: new ObjectId(parentPostId),
      })
      .sort({ date: -1 }) // Sort comments by latest first
      .toArray();

    // Convert ObjectId fields to strings
    const commentsWithStringIds = comments.map((comment) => ({
      ...comment,
      _id: comment._id.toString(),
      parentPostId: comment.parentPostId.toString(),
      userId: comment.userId.toString(),
    }));

    return NextResponse.json(commentsWithStringIds, { status: 200 });
  } catch (err: unknown) {
    console.error("Error fetching comments:", err);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { parentPostId: string } }
) {
  const { parentPostId } = params;

  // Validate presence and type of parentPostId
  if (!parentPostId || typeof parentPostId !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing parent post ID" },
      { status: 400 }
    );
  }

  // Validate parentPostId format
  if (!ObjectId.isValid(parentPostId)) {
    return NextResponse.json(
      { error: "Invalid parent post ID format" },
      { status: 400 }
    );
  }

  // Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.name) {
    return NextResponse.json(
      { error: "Unauthorized or username missing in session" },
      { status: 401 }
    );
  }

  try {
    const { text } = await request.json();

    // Validate comment text
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Comment text is required and cannot be empty." },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const posts = db.collection("posts");

    // Find the user by their username from the session
    const username = session.user.name;
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userId = user._id.toString();

    // Create the new comment document
    const newComment = {
      title: "", // Comments don't have a title
      text: text.trim(),
      categoryId: "", // Comments don't belong to a category directly
      userId: new ObjectId(userId),
      username,
      parentPost: false, // Indicates this is a comment
      parentPostId: new ObjectId(parentPostId), // References the parent post
      date: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      sticky: false,
      locked: false,
    };

    // Insert the new comment into the posts collection
    const result = await posts.insertOne(newComment);

    // Get the inserted comment
    const insertedComment = await posts.findOne({ _id: result.insertedId });
    if (!insertedComment) {
      throw new Error("Failed to retrieve the newly created comment.");
    }

    // Convert ObjectId fields to strings
    const serializedComment = {
      ...insertedComment,
      _id: insertedComment._id.toString(),
      parentPostId: insertedComment.parentPostId.toString(),
      userId: insertedComment.userId.toString(),
    };

    // Add +1 to commentCount in the parent post
    await posts.updateOne(
      { _id: new ObjectId(parentPostId) },
      { $inc: { commentCount: 1 } }
    );

    return NextResponse.json(serializedComment, { status: 201 });
  } catch (err: unknown) {
    console.error("Failed to create comment:", err);
    return NextResponse.json(
      { error: "Failed to create comment." },
      { status: 500 }
    );
  }
}

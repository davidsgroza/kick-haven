// src/app/api/comments/[parentPostId]/route.ts

import { MongoClient, ObjectId, Sort } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// MongoDB connection URI
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kick-haven-local";

let cachedClient: MongoClient | null = null;

// Connect to MongoDB
async function connectToDatabase() {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
  }
  return cachedClient;
}

// Helper function to get the sort order
function getSortOrder(sortType: string): Sort {
  switch (sortType) {
    case "newest":
      return { date: -1, netScore: -1 }; // descending order for newest, tie-break by netScore
    case "oldest":
      return { date: 1, netScore: -1 }; // ascending order for oldest, tie-break by netScore
    case "upvotes-desc":
      return { netScore: -1, date: -1 }; // descending order for net score, tie-breaking by date
    case "upvotes-asc":
      return { netScore: 1, date: -1 }; // ascending order for net score, tie-breaking by date
    default:
      return { date: -1, netScore: -1 }; // Default to newest if sortType is unknown
  }
}

// TypeScript Interfaces
interface User {
  _id: ObjectId;
  username: string;
}

interface ParentPost {
  _id: ObjectId;
  userId: ObjectId;
  categoryId: string;
  username: string;
  title: string;
  text: string;
  parentPost: true;
  parentPostId: null;
  date: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  sticky: boolean;
  locked: boolean;
}

interface Comment {
  _id: ObjectId;
  userId: ObjectId;
  categoryId: string;
  username: string;
  title: string;
  text: string;
  parentPost: false;
  parentPostId: ObjectId;
  date: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  sticky: boolean;
  locked: boolean;
}

type Post = ParentPost | Comment;

// GET: Fetch comments with pagination and sorting
export async function GET(
  request: Request,
  { params }: { params: { parentPostId: string } }
) {
  const { parentPostId } = params;

  if (!ObjectId.isValid(parentPostId)) {
    return NextResponse.json(
      { error: "Invalid parent post ID format" },
      { status: 400 }
    );
  }

  // Parse query parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "5", 10);
  const sortType = url.searchParams.get("sort") || "newest"; // default to "newest"

  // Define sorting logic based on sortType
  const sortOrder: Sort = getSortOrder(sortType);

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Comments collection
    const postsCollection = db.collection<Post>("posts");

    // Fetch comments with dynamic sorting, including net score calculation
    const comments = await postsCollection
      .aggregate([
        {
          $match: {
            parentPost: false,
            parentPostId: new ObjectId(parentPostId),
          },
        },
        {
          $addFields: {
            netScore: { $subtract: ["$upvotes", "$downvotes"] }, // Calculate netScore
          },
        },
        {
          $sort: sortOrder, // Apply dynamic sorting (netScore and date)
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    // Serialize comments
    const serializedComments = comments.map((comment) => ({
      ...comment,
      _id: comment._id.toString(),
      parentPostId: comment.parentPostId.toString(),
      userId: comment.userId.toString(),
    }));

    return NextResponse.json(serializedComments, { status: 200 });
  } catch (err: unknown) {
    console.error("Error fetching comments:", err);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST: Create a new comment with title set to Re: [Parent Post Title] and inherit categoryId
export async function POST(
  request: Request,
  { params }: { params: { parentPostId: string } }
) {
  const { parentPostId } = params;

  if (!ObjectId.isValid(parentPostId)) {
    return NextResponse.json(
      { error: "Invalid parent post ID format" },
      { status: 400 }
    );
  }

  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Comment text is required." },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const posts = db.collection<Post>("posts");
    const users = db.collection<User>("users");

    // Find user
    const user = await users.findOne({ username: session.user.name });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Find parent post
    const parentPost = await posts.findOne({ _id: new ObjectId(parentPostId) });
    if (!parentPost) {
      return NextResponse.json(
        { error: "Parent post not found." },
        { status: 404 }
      );
    }

    // Determine the categoryId for the comment
    const commentCategoryId = parentPost.categoryId || "";

    // Create new comment
    const newComment: Comment = {
      _id: new ObjectId(),
      userId: user._id,
      username: user.username,
      categoryId: commentCategoryId, // Inherit categoryId from parent post
      title: `Re: ${parentPost.title || "Original Post"}`,
      text: text.trim(),
      parentPost: false,
      parentPostId: new ObjectId(parentPostId),
      date: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      sticky: false,
      locked: false,
    };

    await posts.insertOne(newComment);

    // Increment commentCount in parent post
    await posts.updateOne(
      { _id: new ObjectId(parentPostId) },
      { $inc: { commentCount: 1 } }
    );

    // Serialize the new comment for the response
    const serializedComment = {
      ...newComment,
      _id: newComment._id.toString(),
      parentPostId: newComment.parentPostId.toString(),
      userId: newComment.userId.toString(),
    };

    return NextResponse.json(serializedComment, { status: 201 });
  } catch (err: unknown) {
    console.error("Failed to create comment:", err);
    return NextResponse.json(
      { error: "Failed to create comment." },
      { status: 500 }
    );
  }
}

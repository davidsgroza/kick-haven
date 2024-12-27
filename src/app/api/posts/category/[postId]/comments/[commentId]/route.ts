//API for editing and deleting comments
// app/api/posts/[postId]/comments/[commentId]/route.ts

import { MongoClient, ObjectId } from "mongodb";
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

interface Post {
  _id: ObjectId;
  userId: ObjectId;
  categoryId: string;
  username: string;
  title: string;
  text: string;
  parentPost: boolean;
  parentPostId?: ObjectId;
  date: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  sticky: boolean;
  locked: boolean;
}

// DELETE: Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  const { postId, commentId } = params;

  if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) {
    return NextResponse.json(
      { error: "Invalid post ID or comment ID format" },
      { status: 400 }
    );
  }

  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const posts = db.collection<Post>("posts");

    // Find comment
    const comment = await posts.findOne({
      _id: new ObjectId(commentId),
      parentPostId: new ObjectId(postId),
    });
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    // Check if the user is the author
    if (comment.username !== session.user.name) {
      return NextResponse.json(
        { error: "You can only delete your own comments." },
        { status: 403 }
      );
    }

    // Delete comment
    await posts.deleteOne({ _id: new ObjectId(commentId) });

    // Decrement commentCount in parent post
    await posts.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { commentCount: -1 } }
    );

    return NextResponse.json(
      { message: "Comment deleted successfully." },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Failed to delete comment:", err);
    return NextResponse.json(
      { error: "Failed to delete comment." },
      { status: 500 }
    );
  }
}

// PUT: Edit a comment
export async function PUT(
  request: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  const { postId, commentId } = params;

  if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) {
    return NextResponse.json(
      { error: "Invalid post ID or comment ID format" },
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

    // Find comment
    const comment = await posts.findOne({
      _id: new ObjectId(commentId),
      parentPostId: new ObjectId(postId),
    });
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    // Check if the user is the author
    if (comment.username !== session.user.name) {
      return NextResponse.json(
        { error: "You can only edit your own comments." },
        { status: 403 }
      );
    }

    // Update comment
    await posts.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { text: text.trim() } }
    );

    // Fetch updated comment
    const updatedComment = await posts.findOne({
      _id: new ObjectId(commentId),
    });

    if (!updatedComment) {
      throw new Error("Failed to retrieve updated comment.");
    }

    const serializedComment = {
      ...updatedComment,
      _id: updatedComment._id.toString(),
      parentPostId: updatedComment.parentPostId!.toString(),
      userId: updatedComment.userId.toString(),
    };

    return NextResponse.json(serializedComment, { status: 200 });
  } catch (err: unknown) {
    console.error("Failed to edit comment:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to edit comment." },
      { status: 500 }
    );
  }
}

// API for displaying parent post data

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

// TypeScript interfaces
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface User {
  _id: ObjectId;
  username: string;
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

// GET: Fetch a specific post by ID
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  if (!ObjectId.isValid(postId)) {
    return NextResponse.json(
      { error: "Invalid post ID format" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const posts = db.collection<Post>("posts");

    const post = await posts.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const serializedPost = {
      ...post,
      _id: post._id.toString(),
      userId: post.userId.toString(),
      parentPostId: post.parentPostId?.toString() || null,
    };

    return NextResponse.json(serializedPost, { status: 200 });
  } catch (err: unknown) {
    console.error("Error fetching post:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a post
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  if (!ObjectId.isValid(postId)) {
    return NextResponse.json(
      { error: "Invalid post ID format" },
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

    // Find post
    const post = await posts.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Check if the user is the author
    if (post.username !== session.user.name) {
      return NextResponse.json(
        { error: "You can only delete your own posts." },
        { status: 403 }
      );
    }

    // Delete post
    await posts.deleteOne({ _id: new ObjectId(postId) });

    // delete all comments related to this post
    await posts.deleteMany({ parentPostId: new ObjectId(postId) });

    return NextResponse.json(
      { message: "Post deleted successfully." },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Failed to delete post:", err);
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 }
    );
  }
}

// PUT: Edit a post
export async function PUT(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  if (!ObjectId.isValid(postId)) {
    return NextResponse.json(
      { error: "Invalid post ID format" },
      { status: 400 }
    );
  }

  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, text } = await request.json();

    if (!title || !text) {
      return NextResponse.json(
        { error: "Title and text are required." },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const posts = db.collection<Post>("posts");

    // Find post
    const post = await posts.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Check if the user is the author
    if (post.username !== session.user.name) {
      return NextResponse.json(
        { error: "You can only edit your own posts." },
        { status: 403 }
      );
    }

    // Update post without changing category
    await posts.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          title: title.trim(),
          text: text.trim(),
        },
      }
    );

    // Fetch updated post
    const updatedPost = await posts.findOne({ _id: new ObjectId(postId) });

    if (!updatedPost) {
      throw new Error("Failed to retrieve updated post.");
    }

    const serializedPost = {
      ...updatedPost,
      _id: updatedPost._id.toString(),
      userId: updatedPost.userId.toString(),
      parentPostId: updatedPost.parentPostId?.toString() || null,
    };

    return NextResponse.json(serializedPost, { status: 200 });
  } catch (err: unknown) {
    console.error("Failed to edit post:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to edit post." },
      { status: 500 }
    );
  }
}

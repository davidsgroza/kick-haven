// API for creating a post from Create Post section
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

export async function POST(request: Request) {
  // Get the session to confirm if the user is authenticated
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.name) {
    return NextResponse.json(
      { error: "Unauthorized or username missing in session" },
      { status: 401 }
    );
  }

  try {
    const { title, text, categoryId } = await request.json();

    if (!title || !text || !categoryId) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Find the user by their username from the session
    const username = session.user.name;
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userId = user._id.toString();

    // Create the new post with locked set to false by default
    const newPost = {
      title,
      text,
      categoryId, // Store as string
      userId,
      username,
      parentPost: true,
      date: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      sticky: false,
      locked: false,
    };

    const posts = db.collection("posts");
    const result = await posts.insertOne(newPost);

    return NextResponse.json({ postId: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("Failed to create post:", err);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}

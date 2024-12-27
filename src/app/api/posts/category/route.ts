// API for getting all the posts in the cateogry
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json(
      { error: "Category ID is required" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Fetch all posts for the given categoryId
    const posts = await db.collection("posts").find({ categoryId }).toArray();

    return NextResponse.json(posts, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error fetching posts:", err.message);
    } else {
      console.error("Unknown error fetching posts:", err);
    }

    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

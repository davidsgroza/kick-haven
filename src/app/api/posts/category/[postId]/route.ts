import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kick-haven-local";

let cachedClient: MongoClient | null = null;

const connectToDatabase = async () => {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
  }
  return cachedClient;
};

// API handler for getting a specific post by ID
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = params; // Extract postId from the route

  if (!postId || typeof postId !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing post ID" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const posts = db.collection("posts");

    const post = await posts.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post); // Return the post data
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = "mongodb://127.0.0.1:27017"; // Replace with your MongoDB URI
const client = new MongoClient(uri);

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
    await client.connect();
    const db = client.db("kick-haven-local");
    const posts = await db.collection("posts").find({ categoryId }).toArray();

    return NextResponse.json(posts);
  } catch (err: unknown) {
    // Type guard to check if error is an instance of Error
    if (err instanceof Error) {
      console.error("Error fetching posts:", err.message);
    } else {
      console.error("Unknown error fetching posts:", err);
    }

    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

// MongoDB URI and database name
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kick-haven-local";
const dbName = process.env.MONGODB_DB || "kick-haven-local";

// Cached MongoClient
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
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const postsCollection = db.collection("posts");

    // Create text index on title/content:
    // db.posts.createIndex({ title: "text", content: "text" });

    const posts = await postsCollection
      .aggregate([
        // Match documents using text search
        { $match: { $text: { $search: query } } },
        // Add a textScore field
        { $addFields: { score: { $meta: "textScore" } } },
        // Join with categories collection to get category info
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        // Extract category name
        {
          $addFields: {
            categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
          },
        },
        // Remove the categoryInfo array
        {
          $project: {
            categoryInfo: 0,
          },
        },
        // Sort by text relevance
        { $sort: { score: { $meta: "textScore" } } },
        // Limit results
        { $limit: 20 },
      ])
      .toArray();

    return NextResponse.json(posts, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error searching posts:", error.message);
    } else {
      console.error("Unknown error searching posts:", error);
    }

    return NextResponse.json(
      { error: "Failed to search posts" },
      { status: 500 }
    );
  }
}

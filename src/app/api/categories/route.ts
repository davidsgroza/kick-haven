import { MongoClient } from "mongodb";
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

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const categories = db.collection("categories");

    const allCategories = await categories.find({}).toArray();

    return NextResponse.json(allCategories);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

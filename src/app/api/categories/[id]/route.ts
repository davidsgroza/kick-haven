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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Extract categoryId from the route params (not from searchParams)

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing category ID" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const categories = db.collection("categories");

    const category = await categories.findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

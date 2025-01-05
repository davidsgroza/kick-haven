import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { ObjectId } from "mongodb";

// GET method to retrieve user forum signature
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!ObjectId.isValid(userId)) {
    return NextResponse.json(
      { message: "Invalid user ID format" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Fetch the user's signature by userId
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the user's forum signature
    const forumSignature = user.forumSignature || "";
    return NextResponse.json({ forumSignature });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

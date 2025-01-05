import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { z } from "zod";
import { NextRequest } from "next/server";

// Forum signature validation schema
const signatureSchema = z.object({
  signature: z.string().max(500), // Limit signature to 500 characters
  currentUsername: z.string().min(5).max(20), // Include the current username for identifying the user
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const requestBody = await request.json();
    const { signature, currentUsername } = signatureSchema.parse(requestBody);

    // Connect to the database
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Find the user by currentUsername
    const user = await db
      .collection("users")
      .findOne({ username: currentUsername });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if the signature is different before updating
    if (user.forumSignature === signature) {
      return NextResponse.json(
        { message: "No changes made to signature" },
        { status: 200 }
      );
    }

    // Update the user's signature in the database
    const result = await db
      .collection("users")
      .updateOne(
        { username: currentUsername },
        { $set: { forumSignature: signature, updatedAt: new Date() } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update signature" },
        { status: 500 }
      );
    }

    // Return the updated signature in response
    return NextResponse.json({
      message: "Signature updated successfully",
      signature,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const headers = Object.fromEntries(request.headers.entries());
    const authorizationHeader = headers["authorization"];

    // Ensure Authorization header exists
    if (!authorizationHeader) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const [bearer, userName] = authorizationHeader.split(" "); // 'Bearer username'
    if (bearer !== "Bearer" || !userName) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid Authorization header." },
        { status: 401 }
      );
    }

    // Connect to the database
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Fetch the user by username
    const user = await db.collection("users").findOne({ username: userName });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the user's forum signature
    const signature = user.forumSignature || ""; // Default to an empty string if not found
    return NextResponse.json({ signature });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

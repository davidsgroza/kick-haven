import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { ObjectId } from "mongodb";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!ObjectId.isValid(userId)) {
    return NextResponse.json(
      { error: "Invalid user ID format" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    // Retrieve the user's document based on userId
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user || !user.profileImage) {
      // If no profile image, serve a default image
      return NextResponse.redirect(new URL("/icon.jpg", req.url));
    }

    const { data, contentType } = user.profileImage;

    // Serve the image data as binary with correct content type
    return new NextResponse(data.buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, must-revalidate", // Disable caching
      },
    });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/utils/mongo";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // Retrieve the user's session
    const session = await getServerSession(authOptions);

    // Ensure the user is authenticated
    if (!session || !session.user?.email) {
      // serve a default image for unauthenticated users
      return NextResponse.redirect(new URL("/icon.jpg", req.url));
    }

    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db();

    // Retrieve the user's document
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user || !user.profileImage || !user.profileImage.data) {
      // If no profile image, serve a default image
      return NextResponse.redirect(new URL("/icon.jpg", req.url));
    }

    const { data, contentType } = user.profileImage;

    // Serve the image
    return new NextResponse(data.buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error retrieving profile image:", error);
    // Serve a default image in case of error
    return NextResponse.redirect(new URL("/icon.jpg", req.url));
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();

    const result = await db
      .collection("users")
      .updateOne(
        { email: session.user.email },
        { $unset: { profileImage: "" } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Image not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    // Parse the JSON body
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { success: false, message: "Invalid user IDs" },
        { status: 400 }
      );
    }

    // Fetch user profile images
    const users = await usersCollection
      .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
      .toArray();

    const profilePictures = userIds.reduce((result, userId) => {
      const user = users.find((u) => u._id.toString() === userId);
      if (user && user.profileImage?.data) {
        // Include the user's profile picture data
        result[userId] = {
          data: `data:${
            user.profileImage.contentType
          };base64,${user.profileImage.data.toString("base64")}`,
        };
      } else {
        // Use a default profile picture
        result[userId] = { data: "/icon.jpg" };
      }
      return result;
    }, {});

    return NextResponse.json({ success: true, profilePictures });
  } catch (error) {
    console.error("Error fetching profile images:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

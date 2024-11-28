import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { z } from "zod";
import { NextRequest } from "next/server"; // Import NextRequest for compatibility

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  birthdate: z.string().optional(),
  email: z.string().email(),
  username: z.string().min(5).max(20),
  currentUsername: z.string().min(5).max(20), // Include the current username
});

// GET method to retrieve user profile
export async function GET(request: NextRequest) {
  console.log("GET request reached");
  try {
    // Convert the NextRequest headers to a plain object
    const headers = Object.fromEntries(request.headers.entries());
    const authorizationHeader = headers["authorization"];

    // Ensure Authorization header exists
    if (!authorizationHeader) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Extract the token (username) from the Authorization header
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
    console.log(userName);
    // Fetch the user profile data by the username
    const user = await db.collection("users").findOne({ username: userName });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the user's profile data (excluding password)
    const { username, email, bio, birthdate, location } = user;
    const userProfile = { username, email, bio, birthdate, location };
    console.log(userProfile);
    return NextResponse.json(userProfile);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const parsedData = profileSchema.parse(requestBody);

    // Connect to the database
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Find the user by currentUsername
    const user = await db.collection("users").findOne({
      username: parsedData.currentUsername,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if the new username is already taken
    const existingUser = await db.collection("users").findOne({
      username: parsedData.username,
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update the user's profile
    const result = await db.collection("users").updateOne(
      { username: parsedData.currentUsername },
      {
        $set: {
          bio: parsedData.bio,
          location: parsedData.location,
          birthdate: parsedData.birthdate,
          email: parsedData.email,
          username: parsedData.username, // Update username
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

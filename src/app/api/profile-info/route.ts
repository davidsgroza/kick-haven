import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import { z } from "zod";
import { NextRequest } from "next/server"; // Import NextRequest for compatibility

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  birthdate: z.string().optional(),
  email: z.string().email().optional(), // email is optional but needs to be validated
  currentUsername: z.string().min(5).max(20), // currentUsername cannot be changed
});

// GET method to retrieve user profile
export async function GET(request: NextRequest) {
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

    // Fetch the user profile data by the username
    const user = await db.collection("users").findOne({ username: userName });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the user's profile data (excluding username, as it cannot be changed)
    const { email, bio, birthdate, location } = user;
    const userProfile = { email, bio, birthdate, location };

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
    const parsedData = profileSchema.parse(requestBody); // Parse incoming data

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

    // Prepare the updated fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedFields: any = {};

    // Only update the fields if they are provided
    if (parsedData.email) {
      updatedFields.email = parsedData.email;
    }
    if (parsedData.bio) {
      updatedFields.bio = parsedData.bio;
    }
    if (parsedData.location) {
      updatedFields.location = parsedData.location;
    }
    if (parsedData.birthdate) {
      updatedFields.birthdate = parsedData.birthdate;
    }

    // Perform the update if there are any fields to update
    if (Object.keys(updatedFields).length > 0) {
      const result = await db.collection("users").updateOne(
        { username: parsedData.currentUsername },
        {
          $set: {
            ...updatedFields,
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
    } else {
      return NextResponse.json(
        { message: "No changes to update" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

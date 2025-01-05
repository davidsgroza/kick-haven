import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongo";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextRequest } from "next/server";

// Password validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const requestBody = await request.json();
    const { currentPassword, newPassword } = passwordSchema.parse(requestBody);

    // Extract username from the Authorization header
    const headers = Object.fromEntries(request.headers.entries());
    const authorizationHeader = headers["authorization"];
    const [bearer, username] = authorizationHeader?.split(" ") || [];

    if (bearer !== "Bearer" || !username) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid Authorization header." },
        { status: 401 }
      );
    }

    // Connect to the database
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Fetch user from the database by username
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Compare the current password with the stored password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid current password" },
        { status: 401 }
      );
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    const result = await db
      .collection("users")
      .updateOne(
        { username },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error during password change:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

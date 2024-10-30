import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/utils/mongo"; // Ensure this path is correct

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    const client = await connectToDatabase();
    const db = client.db("kick-haven");

    // Check if the user already exists
    const user = await db.collection("users").findOne({ email });
    if (user) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await db
      .collection("users")
      .insertOne({ username, email, password: hashedPassword });

    // Return success response
    return NextResponse.json({ message: "User registered successfully" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Return a JSON error response
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/utils/mongo";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(5).max(20),
  email: z.string().email(),
  emailConfirm: z.string().email(),
  password: z.string().min(8).max(64),
  passwordConfirm: z.string().min(8).max(64),
  termsAndConditions: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const parsedData = registerSchema.parse(requestBody);

    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Check if the username or email already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ username: parsedData.username }, { email: parsedData.email }],
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username or email is already taken" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    // Insert the new user
    await db.collection("users").insertOne({
      username: parsedData.username,
      email: parsedData.email,
      password: hashedPassword,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}

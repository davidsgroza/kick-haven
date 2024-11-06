import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/utils/mongo";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  emailConfirm: z.string().email(),
  password: z.string().min(8).max(128),
  passwordConfirm: z.string().min(8).max(128),
  termsAndConditions: z
    .boolean()
    .refine((val) => val === true, "Terms and conditions must be accepted"),
});

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const parsedData = registerSchema.parse(requestBody);

    if (parsedData.email !== parsedData.emailConfirm) {
      return NextResponse.json(
        { message: "Email and email confirm do not match" },
        { status: 400 }
      );
    }

    if (parsedData.password !== parsedData.passwordConfirm) {
      return NextResponse.json(
        { message: " Warning: E-Mail Address is already registered!" },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Check if the user with this email address already exists
    const user = await db
      .collection("users")
      .findOne({ email: parsedData.email });
    if (user) {
      return NextResponse.json(
        { message: " Warning: E-Mail is already registered!" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    // Insert the new user into the database
    await db.collection("users").insertOne({
      username: parsedData.username,
      email: parsedData.email,
      password: hashedPassword,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { message: "An error occurred during registration" },
        { status: 500 }
      );
    }
  }
}

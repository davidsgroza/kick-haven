import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/utils/mongo";
//import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import cookie from "cookie";
import { authenticateRequest } from "./middleware"; // Import the middleware

//const registerSchema = z.object({
//  username: z.string().min(5).max(20),
//  email: z.string().email(),
//  emailConfirm: z.string().email(),
//  password: z.string().min(8).max(64),
//  passwordConfirm: z.string().min(8).max(64),
//  termsAndConditions: z
//    .boolean()
//    .refine((val) => val === true, "Terms and conditions must be accepted"),
//});

export async function POST(request: Request) {
  try {
    await authenticateRequest(request); // Use the middleware function

    const { email, password } = await request.json();
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");

    // Find the user by email
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    // Compare the hashed password with the provided password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }

    // Generate a unique session ID
    const sessionId = await generateSessionId();

    // Store the session ID in the database
    await db.collection("sessions").insertOne({ sessionId, userId: user._id });

    // Set a cookie with the session ID
    const cookie = await setCookie(sessionId);

    // Return success response
    return NextResponse.json(
      { message: "Login successful" },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

async function generateSessionId() {
  // Generate a unique session ID using a library like uuid
  return uuidv4();
}

async function setCookie(sessionId: string) {
  // Set a cookie with the session ID using a library like cookie
  return cookie.serialize("session_id", sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 7200000, // 2 hours
  });
}

export async function GET(request: Request) {
  console.log("GET endpoint called");

  const cookieHeader = request.headers.get("cookie");
  console.log("Cookie header:", cookieHeader);

  if (!cookieHeader) {
    console.log("No cookie header found");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cookies = cookie.parse(cookieHeader);
  const sessionId = cookies.session_id;
  console.log("Session ID:", sessionId);

  if (!sessionId) {
    console.log("No session ID found");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const client = await connectToDatabase();
  console.log("Connected to database");

  const db = client.db("kick-haven-local");
  console.log("Database:", db);

  const session = await db.collection("sessions").findOne({ sessionId });
  console.log("Session:", session);

  if (!session) {
    console.log("No session found");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Return the logged in status
  console.log("Authenticated");
  return NextResponse.json({ authenticated: true });
}

import { NextResponse } from "next/server";
import cookie from "cookie";
import { connectToDatabase } from "@/utils/mongo";

export async function authenticateRequest(request: Request) {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const sessionId = cookies.session_id;

  if (!sessionId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const client = await connectToDatabase();
  const db = client.db("kick-haven-local");
  const session = await db.collection("sessions").findOne({ sessionId });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export async function isAuthenticated(request: Request) {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const sessionId = cookies.session_id;

  if (!sessionId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const client = await connectToDatabase();
  const db = client.db("kick-haven-local");
  const session = await db.collection("sessions").findOne({ sessionId });

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

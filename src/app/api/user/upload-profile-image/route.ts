import { NextResponse } from "next/server";
import formidable, { Fields, Files } from "formidable";
import { Readable } from "stream";
import { IncomingMessage } from "http";
import fs from "fs";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/utils/mongo";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's body parser
  },
};

// Convert Fetch API Request body to a Node.js-style IncomingMessage
const requestToReadableStream = async (
  request: Request
): Promise<IncomingMessage> => {
  const readableStream = request.body;

  if (!readableStream) {
    throw new Error("Request body is not readable");
  }

  // Convert ReadableStream to AsyncIterable
  const asyncIterable = {
    [Symbol.asyncIterator]() {
      const reader = readableStream.getReader();
      return {
        async next() {
          const { done, value } = await reader.read();
          if (done) return { done: true, value: null };
          return { done: false, value };
        },
      };
    },
  };

  // Convert AsyncIterable to Node.js Readable stream
  const readable = Readable.from(asyncIterable);

  // Add IncomingMessage-specific properties to the Readable stream
  const headers = Object.fromEntries(request.headers.entries());
  const incomingMessage = Object.assign(readable, {
    headers,
    method: request.method,
    url: request.url,
  }) as IncomingMessage;

  return incomingMessage;
};

// Helper to parse form data using formidable
const parseForm = async (
  req: IncomingMessage
): Promise<{ fields: Fields; files: Files }> => {
  const form = formidable({
    multiples: false, // Single file upload
    maxFileSize: 2 * 1024 * 1024, // 2MB
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// API route handler
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const incomingMessage = await requestToReadableStream(req);
    const { files } = await parseForm(incomingMessage);

    const profileImage = files.profileImage;
    const file = Array.isArray(profileImage) ? profileImage[0] : profileImage;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type" },
        { status: 400 }
      );
    }

    const fileBuffer = await fs.promises.readFile(file.filepath);

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    // Update the existing profile image or create it if not present
    const result = await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          profileImage: {
            data: fileBuffer,
            contentType: file.mimetype,
            updatedAt: new Date(),
          },
        },
      },
      { upsert: true } // Use upsert to handle create and update
    );

    if (result.modifiedCount === 0 && !result.upsertedId) {
      return NextResponse.json(
        { success: false, message: "Failed to upload image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

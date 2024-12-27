// app/api/user/posts/route.ts

import { MongoClient } from "mongodb";
import type { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// MongoDB connection URI
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kick-haven-local";

// Cached MongoDB client to reuse across requests
let cachedClient: MongoClient | null = null;

/**
 * Connects to the MongoDB database.
 */
async function connectToDatabase() {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
  }
  return cachedClient;
}

// Define TypeScript interfaces
interface User {
  _id: ObjectId;
  username: string;
}

interface Post {
  _id: ObjectId;
  userId: ObjectId;
  categoryId: string;
  title: string;
  text: string;
  parentPost: boolean;
  parentPostId?: ObjectId;
  date: string;
}

interface AggregatedPost extends Post {
  parentPostDetails?: {
    title: string;
  };
}

interface ProcessedPost {
  _id: string;
  categoryId: string;
  title: string;
  snippet: string;
  date: string;
}

/**
 * Handles GET requests to fetch the authenticated user's main posts and comments.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const postsCollection = db.collection<Post>("posts");
    const usersCollection = db.collection<User>("users");

    const user = await usersCollection.findOne({ username: session.user.name });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userId = user._id;

    const userPosts = await postsCollection
      .aggregate<AggregatedPost>([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: "posts",
            localField: "parentPostId",
            foreignField: "_id",
            as: "parentPostDetails",
          },
        },
        {
          $unwind: {
            path: "$parentPostDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            categoryId: 1,
            title: 1,
            text: 1,
            parentPost: 1,
            parentPostDetails: 1,
            date: 1,
          },
        },
      ])
      .toArray();

    const processedPosts: ProcessedPost[] = userPosts.map((post) => {
      const displayTitle = post.parentPost
        ? post.title || "Untitled Post"
        : `Re: ${post.parentPostDetails?.title || "Original Post"}`;

      const snippet =
        post.text.length > 100 ? `${post.text.slice(0, 100)}...` : post.text;

      return {
        _id: post._id.toString(),
        categoryId: post.categoryId || "General",
        title: displayTitle,
        snippet,
        date: post.date,
      };
    });

    return NextResponse.json(processedPosts, { status: 200 });
  } catch (err: unknown) {
    console.error("Error fetching user posts:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to fetch user posts." },
      { status: 500 }
    );
  }
}

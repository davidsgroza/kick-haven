// src/app/api/posts/category/[postId]/votes/route.ts

import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// MongoDB connection URI
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kick-haven-local";

let cachedClient: MongoClient | null = null;

// Connect to MongoDB
async function connectToDatabase(): Promise<MongoClient> {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
  }
  return cachedClient;
}

// TypeScript Interfaces
interface User {
  _id: ObjectId;
  username: string;
}

interface ParentPost {
  _id: ObjectId;
  userId: ObjectId;
  categoryId: string;
  username: string;
  title: string;
  text: string;
  parentPost: true;
  parentPostId: null;
  date: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  sticky: boolean;
  locked: boolean;
}

interface Vote {
  _id: ObjectId;
  userId: string; // Stored as string for consistency
  postId: string;
  voteType: "upvote" | "downvote";
  createdAt: Date;
  updatedAt: Date;
}

interface VoteResponse {
  success: boolean;
  message: string;
  upvotes: number;
  downvotes: number;
  userVote: "upvote" | "downvote" | null;
}

// POST: Handle voting
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  // Validate postId
  if (!ObjectId.isValid(postId)) {
    return NextResponse.json(
      { success: false, message: "Invalid post ID format" },
      { status: 400 }
    );
  }

  // Parse request body
  let body: { voteType: "upvote" | "downvote" };
  try {
    body = await req.json();
  } catch (error) {
    console.error("Invalid JSON body:", error);
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { voteType } = body;

  if (!["upvote", "downvote"].includes(voteType)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid voteType. Must be 'upvote' or 'downvote'.",
      },
      { status: 400 }
    );
  }

  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in to vote." },
      { status: 401 }
    );
  }

  const username = session.user.name;

  try {
    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const postsCollection = db.collection<ParentPost>("posts");
    const votesCollection = db.collection<Vote>("votes"); // 'votes' is a separate collection
    const usersCollection = db.collection<User>("users");

    // Find user by username to get their _id
    const user = await usersCollection.findOne({ username: username });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const postObjectId = new ObjectId(postId);

    // Check if the post exists and is a parent post
    const post = await postsCollection.findOne({ _id: postObjectId });
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found." },
        { status: 404 }
      );
    }

    // Ensure it's a parent post
    if (!post.parentPost) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot vote on a comment using this endpoint.",
        },
        { status: 400 }
      );
    }

    // Check if post is locked
    if (post.locked) {
      return NextResponse.json(
        { success: false, message: "Cannot vote on a locked post." },
        { status: 403 }
      );
    }

    // Check if the user has already voted on this post
    const existingVote = await votesCollection.findOne({
      userId: user._id.toString(),
      postId: postId,
    });

    // ────────────────────────────────────────────────────────────────────
    // Start of the main logic for inserting/updating/removing votes
    // ────────────────────────────────────────────────────────────────────

    if (!existingVote) {
      // New vote scenario
      const newVote: Vote = {
        _id: new ObjectId(),
        userId: user._id.toString(),
        postId: postId,
        voteType: voteType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await votesCollection.insertOne(newVote);
      } catch (insertError: unknown) {
        if (typeof insertError === "object" && insertError !== null) {
          const mongoError = insertError as { code?: number; message?: string };
          if (mongoError.code === 11000) {
            return NextResponse.json(
              {
                success: false,
                message: "You have already voted on this post.",
              },
              { status: 400 }
            );
          }
        }

        // If it isn't a duplicate key error or doesn't match the expected structure,
        // either rethrow it or handle it as a generic error:
        throw insertError;
      }

      // Increment the appropriate vote count
      const incrementUpdate: {
        $inc: { upvotes?: number; downvotes?: number };
      } = { $inc: {} };

      if (voteType === "upvote") {
        incrementUpdate.$inc.upvotes = 1;
      } else {
        incrementUpdate.$inc.downvotes = 1;
      }

      await postsCollection.updateOne({ _id: postObjectId }, incrementUpdate);

      // Fetch the updated post
      const updatedPost = await postsCollection.findOne({ _id: postObjectId });
      if (!updatedPost) {
        return NextResponse.json(
          { success: false, message: "Post not found after update." },
          { status: 404 }
        );
      }

      const voteResponse: VoteResponse = {
        success: true,
        message: `Post ${voteType}d successfully.`,
        upvotes: updatedPost.upvotes,
        downvotes: updatedPost.downvotes,
        userVote: voteType,
      };

      return NextResponse.json(voteResponse, { status: 200 });
    } else {
      // Existing vote scenario
      if (existingVote.voteType === voteType) {
        // Same vote removal
        await votesCollection.deleteOne({ _id: existingVote._id });

        // Decrement the appropriate vote count
        const decrementUpdate: {
          $inc: { upvotes?: number; downvotes?: number };
        } = { $inc: {} };

        if (voteType === "upvote") {
          decrementUpdate.$inc.upvotes = -1;
        } else {
          decrementUpdate.$inc.downvotes = -1;
        }

        await postsCollection.updateOne({ _id: postObjectId }, decrementUpdate);

        // Fetch the updated post
        const updatedPost = await postsCollection.findOne({
          _id: postObjectId,
        });
        if (!updatedPost) {
          return NextResponse.json(
            { success: false, message: "Post not found after update." },
            { status: 404 }
          );
        }

        const voteResponse: VoteResponse = {
          success: true,
          message: `Post ${voteType} removed successfully.`,
          upvotes: updatedPost.upvotes,
          downvotes: updatedPost.downvotes,
          userVote: null,
        };

        return NextResponse.json(voteResponse, { status: 200 });
      } else {
        // Changing vote type
        await votesCollection.updateOne(
          { _id: existingVote._id },
          { $set: { voteType: voteType, updatedAt: new Date() } }
        );

        // Adjust the vote counts accordingly
        const changeUpdate: { $inc: { upvotes?: number; downvotes?: number } } =
          { $inc: {} };

        if (voteType === "upvote") {
          changeUpdate.$inc.upvotes = 1;
          changeUpdate.$inc.downvotes = -1;
        } else {
          changeUpdate.$inc.downvotes = 1;
          changeUpdate.$inc.upvotes = -1;
        }

        await postsCollection.updateOne({ _id: postObjectId }, changeUpdate);

        // Fetch the updated post
        const updatedPost = await postsCollection.findOne({
          _id: postObjectId,
        });
        if (!updatedPost) {
          return NextResponse.json(
            { success: false, message: "Post not found after update." },
            { status: 404 }
          );
        }

        const voteResponse: VoteResponse = {
          success: true,
          message: `Post vote changed to ${voteType}.`,
          upvotes: updatedPost.upvotes,
          downvotes: updatedPost.downvotes,
          userVote: voteType,
        };

        return NextResponse.json(voteResponse, { status: 200 });
      }
    }
    // ────────────────────────────────────────────────────────────────────
  } catch (error) {
    console.error("Error processing vote:", error);

    // Define a specific error type
    type MongoError = {
      code?: number;
      message?: string;
    };

    const mongoError = error as MongoError;

    // If the error is a duplicate key error (user trying to vote multiple times)
    if (mongoError.code === 11000) {
      return NextResponse.json(
        { success: false, message: "You have already voted on this post." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}

import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// MongoDB connection URI
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kick-haven-local";
let cachedClient: MongoClient | null = null;

async function connectToDatabase(): Promise<MongoClient> {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
  }
  return cachedClient;
}

// Interfaces
interface PostDocument {
  _id: ObjectId;
  userId: ObjectId;
  parentPost?: boolean;
  parentPostId?: string | null;
  locked?: boolean;
  upvotes: number;
  downvotes: number;
}

interface User {
  _id: ObjectId;
  username: string;
}

interface Vote {
  _id: ObjectId;
  userId: string; // For simplicity
  targetId: string; // The post or comment ID in the `posts` collection
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

export async function POST(req: Request) {
  // Parse the body
  let body: {
    targetId: string; // ID of the post or comment
    voteType: "upvote" | "downvote";
  };
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
    console.error(err);
  }
  const { targetId, voteType } = body;

  // Validate targetId
  if (!ObjectId.isValid(targetId)) {
    return NextResponse.json(
      { success: false, message: "Invalid targetId format" },
      { status: 400 }
    );
  }

  // Validate voteType
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

    // "posts" includes parent posts and comments
    const postsCollection = db.collection<PostDocument>("posts");
    const votesCollection = db.collection<Vote>("votes");
    const usersCollection = db.collection<User>("users");

    // Find the user
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // Check the target doc in `posts` collection
    const targetObjectId = new ObjectId(targetId);
    const postOrComment = await postsCollection.findOne({
      _id: targetObjectId,
    });
    if (!postOrComment) {
      return NextResponse.json(
        { success: false, message: "Target not found." },
        { status: 404 }
      );
    }

    // If you have a locked field for both posts and comments
    // (or only for parent posts), you can check it here:
    if (postOrComment.locked) {
      return NextResponse.json(
        { success: false, message: "Cannot vote on a locked post/comment." },
        { status: 403 }
      );
    }

    // Check existing vote
    const existingVote = await votesCollection.findOne({
      userId: user._id.toString(),
      targetId: targetId,
    });

    if (!existingVote) {
      // New vote
      const newVote: Vote = {
        _id: new ObjectId(),
        userId: user._id.toString(),
        targetId,
        voteType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await votesCollection.insertOne(newVote);

      const incrementUpdate: {
        $inc: { upvotes?: number; downvotes?: number };
      } = { $inc: {} };
      if (voteType === "upvote") {
        incrementUpdate.$inc.upvotes = 1;
      } else {
        incrementUpdate.$inc.downvotes = 1;
      }
      await postsCollection.updateOne({ _id: targetObjectId }, incrementUpdate);

      const updatedDoc = await postsCollection.findOne({ _id: targetObjectId });
      if (!updatedDoc) {
        return NextResponse.json(
          { success: false, message: "Target not found after update." },
          { status: 404 }
        );
      }

      const voteResponse: VoteResponse = {
        success: true,
        message: `${voteType} registered successfully.`,
        upvotes: updatedDoc.upvotes,
        downvotes: updatedDoc.downvotes,
        userVote: voteType,
      };
      return NextResponse.json(voteResponse, { status: 200 });
    } else {
      // Already voted
      if (existingVote.voteType === voteType) {
        // Remove the same vote
        await votesCollection.deleteOne({ _id: existingVote._id });
        const decrementUpdate: {
          $inc: { upvotes?: number; downvotes?: number };
        } = { $inc: {} };
        if (voteType === "upvote") {
          decrementUpdate.$inc.upvotes = -1;
        } else {
          decrementUpdate.$inc.downvotes = -1;
        }
        await postsCollection.updateOne(
          { _id: targetObjectId },
          decrementUpdate
        );

        const updatedDoc = await postsCollection.findOne({
          _id: targetObjectId,
        });
        if (!updatedDoc) {
          return NextResponse.json(
            { success: false, message: "Target not found after update." },
            { status: 404 }
          );
        }
        const voteResponse: VoteResponse = {
          success: true,
          message: `Removed your ${voteType}.`,
          upvotes: updatedDoc.upvotes,
          downvotes: updatedDoc.downvotes,
          userVote: null,
        };
        return NextResponse.json(voteResponse, { status: 200 });
      } else {
        // Changing vote
        await votesCollection.updateOne(
          { _id: existingVote._id },
          { $set: { voteType, updatedAt: new Date() } }
        );

        const changeUpdate: { $inc: { upvotes?: number; downvotes?: number } } =
          { $inc: {} };
        if (voteType === "upvote") {
          changeUpdate.$inc.upvotes = 1;
          changeUpdate.$inc.downvotes = -1;
        } else {
          changeUpdate.$inc.downvotes = 1;
          changeUpdate.$inc.upvotes = -1;
        }
        await postsCollection.updateOne({ _id: targetObjectId }, changeUpdate);

        const updatedDoc = await postsCollection.findOne({
          _id: targetObjectId,
        });
        if (!updatedDoc) {
          return NextResponse.json(
            { success: false, message: "Target not found after update." },
            { status: 404 }
          );
        }
        const voteResponse: VoteResponse = {
          success: true,
          message: `Changed vote to ${voteType}.`,
          upvotes: updatedDoc.upvotes,
          downvotes: updatedDoc.downvotes,
          userVote: voteType,
        };
        return NextResponse.json(voteResponse, { status: 200 });
      }
    }
  } catch (error) {
    console.error("Error processing vote:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}

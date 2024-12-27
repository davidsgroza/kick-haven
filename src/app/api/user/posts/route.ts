// src/app/api/user/posts/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MongoClient, ObjectId } from "mongodb";

// TypeScript Interfaces
interface Post {
  _id: ObjectId;
  userId: string;
  username: string;
  categoryId: string | null;
  title: string;
  text: string;
  parentPost: boolean;
  parentPostId: string | null;
  date: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  sticky: boolean;
  locked: boolean;
  categoryName?: string; // field to hold category name
}

// MongoDB Connection URI
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kick-haven-local";

// Cached MongoDB Client
let cachedClient: MongoClient | null = null;

// Function to Connect to MongoDB
async function connectToDatabase() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
    console.log("Connected to MongoDB"); // Log successful connection
  }
  return cachedClient.db(); // Returns the default database
}

// GET Handler: Fetch user posts with sorting and pagination, including category name
export async function GET(request: Request) {
  try {
    // Retrieve the session
    const session = await getServerSession(authOptions);
    // If the user is not authenticated, return 401 Unauthorized
    if (!session?.user?.name) {
      console.warn("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const sortParam = url.searchParams.get("sort") || "newer"; // 'newer' or 'older'
    const pageParam = parseInt(url.searchParams.get("page") || "1", 10);
    const limitParam = parseInt(url.searchParams.get("limit") || "10", 10);

    // Validate sort parameter
    let sortOrder: number;
    if (sortParam === "older") {
      sortOrder = 1; // Ascending
    } else {
      sortOrder = -1; // Descending (default)
    }

    // Validate pagination parameters
    const page = pageParam > 0 ? pageParam : 1;
    const limit = limitParam > 0 && limitParam <= 100 ? limitParam : 10;

    const db = await connectToDatabase();
    const postsCollection = db.collection<Post>("posts");

    // Aggregation Pipeline to Join Posts with Categories
    const pipeline = [
      // Match posts by the authenticated user
      { $match: { username: session.user.name } },
      // Sort posts based on the sortOrder
      { $sort: { date: sortOrder } },
      // Implement pagination
      { $skip: (page - 1) * limit },
      { $limit: limit },
      // Convert categoryId from string to ObjectId
      {
        $addFields: {
          categoryObjectId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$categoryId", null] },
                  { $ne: ["$categoryId", ""] },
                ],
              },
              then: { $toObjectId: "$categoryId" },
              else: null,
            },
          },
        },
      },
      // Perform the lookup using the converted categoryObjectId
      {
        $lookup: {
          from: "categories",
          localField: "categoryObjectId",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      // Unwind the categoryInfo array
      {
        $unwind: {
          path: "$categoryInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Add the categoryName field, defaulting to "General" if no category is found
      {
        $addFields: {
          categoryName: {
            $ifNull: ["$categoryInfo.name", "General"],
          },
        },
      },
      // Optionally remove the temporary categoryObjectId and categoryInfo fields
      {
        $project: {
          categoryInfo: 0, // Exclude the categoryInfo field
          categoryObjectId: 0, // Exclude the temporary categoryObjectId field
        },
      },
    ];

    // Execute the aggregation pipeline
    const aggregatedPosts = await postsCollection.aggregate(pipeline).toArray();

    // Serialize posts, converting ObjectIds to strings
    const serializedPosts = aggregatedPosts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      userId: post.userId.toString(),
      categoryId: post.categoryId ? post.categoryId.toString() : null,
      parentPostId: post.parentPostId ? post.parentPostId.toString() : null,
      categoryName: post.categoryName,
    }));

    return NextResponse.json(serializedPosts, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user posts." },
      { status: 500 }
    );
  }
}

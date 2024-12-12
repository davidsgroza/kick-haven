import { MongoClient } from "mongodb";
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

/**
 * Handles GET requests to fetch the authenticated user's posts and comments.
 */
export async function GET(_request: Request) {
  try {
    // Retrieve the session to identify the authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.name) {
      // If the user is not authenticated, return a 401 Unauthorized response
      return NextResponse.json(
        { error: "Unauthorized or username missing in session" },
        { status: 401 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db("kick-haven-local");
    const postsCollection = db.collection("posts");
    const usersCollection = db.collection("users");

    // Find the user document based on the username from the session
    const username = session.user.name;
    const user = await usersCollection.findOne({ username });

    if (!user) {
      // If the user is not found in the database, return a 404 Not Found response
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userId = user._id;

    // Perform an aggregation to fetch all posts by the user
    const userPosts = await postsCollection
      .aggregate([
        {
          $match: {
            userId: userId,
          },
        },
        {
          $lookup: {
            from: "posts", // Lookup in the same collection to find parent posts
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
            subcategory: 1,
            title: 1,
            text: 1,
            parentPost: 1,
            parentPostTitle: "$parentPostDetails.title", // Include parent post title
            date: 1,
          },
        },
      ])
      .toArray();

    // Format titles
    const processedPosts = userPosts.map((post) => {
      let displayTitle = post.title;

      if (!post.parentPost) {
        // If the post is a comment, prefix the title with "Re: " and include the parent post's title
        displayTitle = `Re: ${post.parentPostTitle || "Original Post"}`;
      }

      // Create a snippet from the post's text
      const snippet =
        post.text.length > 100 ? post.text.slice(0, 100) + "..." : post.text;

      return {
        _id: post._id.toString(),
        subcategory: post.subcategory,
        title: displayTitle,
        snippet: snippet,
        date: post.date,
      };
    });

    // Return the processed posts as a JSON response
    return NextResponse.json(processedPosts, { status: 200 });
  } catch (err: unknown) {
    console.error("Error fetching user posts:", err);
    // If an error occurs, return a 500 Internal Server Error response
    return NextResponse.json(
      { error: "Failed to fetch user posts." },
      { status: 500 }
    );
  }
}

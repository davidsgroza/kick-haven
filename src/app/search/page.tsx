"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";

type Post = {
  _id: string;
  categoryId: string;
  userId: string;
  parentPost: boolean;
  title: string;
  text: string;
  date: string;
  username: string;
  commentCount: number;
  upvotes: number;
  downvotes: number;
  parentPostId: string | null;
  parentPostTitle?: string;
  sticky: boolean;
  locked: boolean;
  categoryName?: string;
};

function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `/api/posts/search?query=${encodeURIComponent(query)}`
          );
          if (!response.ok) {
            throw new Error(`Search fetch failed: ${response.statusText}`);
          }
          const data: Post[] = await response.json();
          setPosts(data);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [query]);

  if (loading)
    return <p className="text-white p-8">Loading search results...</p>;
  if (error) return <p className="text-red-500 p-8">Error: {error}</p>;

  const goToPost = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleUpvote = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
      )
    );
  };

  const handleDownvote = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, downvotes: post.downvotes + 1 } : post
      )
    );
  };

  const handleCommentClick = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    router.push(`/post/${postId}`);
  };

  const getDisplayedTitle = (post: Post) => {
    if (!post.parentPost && post.parentPostTitle) {
      return `Re: ${post.parentPostTitle}`;
    }
    return post.title;
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold">Search Results for "{query}"</h1>
          <p className="text-lg mt-4">Showing posts related to your search.</p>
        </section>

        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer"
                onClick={() => goToPost(post._id)}
              >
                {/* Category Name */}
                <p className="text-blue-500 text-sm font-semibold hover:underline">
                  {post.categoryName || "Category"}
                </p>

                {/* Post Metadata */}
                <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
                  <div className="flex items-center">
                    <Image
                      src="/icon.jpg"
                      alt={`${post.username}'s profile`}
                      width={24}
                      height={24}
                      className="rounded-full mr-2"
                    />
                    <span className="text-gray-300">
                      By {post.username || "Unknown"}
                    </span>
                  </div>
                  <span className="text-gray-300">
                    {new Date(post.date).toLocaleString()}
                  </span>
                </div>

                {/* Post Title and Contents */}
                <h3 className="text-xl font-semibold mt-4">
                  {getDisplayedTitle(post)}
                </h3>
                <p className="mt-2 text-gray-300">
                  {post.text ? post.text.substring(0, 150) + "..." : ""}
                </p>

                {/* Post Actions: Comments and Voting */}
                <div className="flex items-center space-x-4 mt-6 text-sm text-gray-400">
                  <button
                    onClick={(e) => handleCommentClick(e, post._id)}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {post.commentCount || 0} Comments
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleUpvote(e, post._id)}
                      className="bg-green-600 px-2 py-1 rounded text-white hover:bg-green-500"
                    >
                      ▲
                    </button>
                    <span className="text-white">
                      {post.upvotes - post.downvotes}
                    </span>
                    <button
                      onClick={(e) => handleDownvote(e, post._id)}
                      className="bg-red-600 px-2 py-1 rounded text-white hover:bg-red-500"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* Display Locked Status */}
                {post.locked && (
                  <span className="mt-2 inline-block bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 mt-4">
            No posts match your search query.
          </p>
        )}
      </div>
    </main>
  );
}

export default SearchPage;

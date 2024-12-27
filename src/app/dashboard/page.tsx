// src/app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

// Define the structure of a Post
type Post = {
  _id: string;
  categoryId: string | null;
  categoryName: string;
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
};

const DashboardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<string>("newer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const LIMIT = 10; // Number of posts per page

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) {
      router.push("/login"); // Redirect if not authenticated
    } else {
      // Reset state when sortOrder changes
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchPosts(1, sortOrder, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, sortOrder]);

  const fetchPosts = async (
    currentPage: number,
    currentSort: string,
    reset: boolean = false
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/posts?sort=${currentSort}&page=${currentPage}&limit=${LIMIT}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch posts.");
      }
      const data: Post[] = await response.json();

      console.log("Fetched Posts:", data); // Debugging Line

      if (reset) {
        setPosts(data);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }

      // If fewer posts than LIMIT are returned, no more posts are available
      if (data.length < LIMIT) {
        setHasMore(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchPosts(nextPage, sortOrder);
    setPage(nextPage);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  // Function to generate snippet from text without breaking words
  const generateSnippet = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    return truncated.slice(0, truncated.lastIndexOf(" ")) + "...";
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Main Content */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold">Dashboard</h1>

          {/* Sort Dropdown */}
          <div className="flex justify-end mb-4">
            <label htmlFor="sort" className="mr-2">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortOrder}
              onChange={handleSortChange}
              className="bg-gray-700 text-white rounded px-3 py-1"
            >
              <option value="newer">Newest First</option>
              <option value="older">Oldest First</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded mb-4">
              <p>Error: {error}</p>
              <button
                onClick={() => fetchPosts(page, sortOrder)}
                className="mt-2 bg-red-800 hover:bg-red-900 text-white py-1 px-3 rounded"
              >
                Retry
              </button>
            </div>
          )}

          {/* My Posts Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">My Posts</h2>

            {loading && posts.length === 0 ? (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              </div>
            ) : posts.length === 0 ? (
              <p className="text-gray-400">
                You have not created any posts yet.
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className={`p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition ${
                      post.title.startsWith("Re: ")
                        ? "border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    {/* Category Link */}
                    <div className="mb-2">
                      {post.categoryId ? (
                        <Link
                          href={`/category/${post.categoryId}`}
                          className="text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {post.categoryName}
                        </Link>
                      ) : (
                        <span className="text-gray-400">
                          {post.categoryName}
                        </span>
                      )}
                    </div>

                    {/* Post Title Link */}
                    <h3 className="text-xl font-medium mt-2">
                      <Link
                        href={`/post/${
                          post.parentPost ? post._id : post.parentPostId
                        }`}
                        className="text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    {/* Post Snippet */}
                    <p className="text-gray-300 mt-1">
                      {generateSnippet(post.text)}
                    </p>

                    {/* Post Date and Time */}
                    <p className="text-gray-400 text-sm mt-2">
                      Posted on {new Date(post.date).toLocaleDateString()} at{" "}
                      {new Date(post.date).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && posts.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Load more posts"
                >
                  {loading ? "Loading..." : "Load More Posts"}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </main>
  );
};

export default DashboardPage;

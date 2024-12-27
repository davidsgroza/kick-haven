"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

// Define the structure of a Post
type Post = {
  _id: string;
  categoryId: string;
  title: string;
  snippet: string;
  date: string;
};

const DashboardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    } else {
      fetchPosts();
    }
  }, [session, status, router]);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/user/posts");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch posts.");
      }
      const data: Post[] = await response.json();
      setPosts(data);
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

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      <div className="w-full max-w-4xl flex gap-8">
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold">Dashboard</h1>

          <section>
            <h2 className="text-2xl font-semibold mb-4">My Posts</h2>

            {loading ? (
              <p className="text-gray-400">Loading your posts...</p>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
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
                    <Link href="#" className="text-blue-400 hover:underline">
                      {post.categoryId || "General"}
                    </Link>
                    <h3 className="text-xl font-medium mt-2">
                      <Link
                        href={`/posts/${post._id}`}
                        className="text-blue-400 hover:underline"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-300 mt-1 truncate">
                      {post.snippet}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Posted on {new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <Sidebar />
      </div>
    </main>
  );
};

export default DashboardPage;

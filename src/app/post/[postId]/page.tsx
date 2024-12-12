"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Post = {
  _id: string;
  categoryName: string;
  userId: string;
  username: string;
  parentPost: boolean;
  title: string;
  text: string;
  date: string;
  parentPostId: string | null;
};

const PostPage = () => {
  const { postId } = useParams();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      const fetchData = async () => {
        try {
          const postResponse = await fetch(`/api/posts/category/${postId}`);
          if (!postResponse.ok) {
            throw new Error(`Post fetch failed: ${postResponse.statusText}`);
          }
          const postData = await postResponse.json();
          setPost(postData);
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
  }, [postId]);

  if (loading) return <p className="text-center text-white">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (!post) return <p className="text-center text-white">Post not found.</p>;

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        {/* Post Card */}
        <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Category, User, and Time */}
          <header className="mb-6">
            <p className="text-sm text-blue-400 font-semibold">
              {post.categoryName}
            </p>
            <div className="flex items-center justify-between text-gray-400 text-sm mt-1">
              <span>Posted by {post.username || `User ${post.userId}`}</span>
              <span>{new Date(post.date).toLocaleString()}</span>
            </div>
          </header>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>

          {/* Post Content */}
          <div className="text-lg leading-relaxed text-gray-300">
            <p>{post.text}</p>
          </div>
        </article>
      </div>
    </main>
  );
};

export default PostPage;

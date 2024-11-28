"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Post = {
  _id: string;
  categoryId: string;
  userId: string;
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
        {/* Title Section */}
        <section className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-gray-400">
            Posted by User {post.userId} on{" "}
            {new Date(post.date).toLocaleString()}
          </p>
        </section>

        {/* Post Content Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <p className="text-lg leading-relaxed text-gray-300">{post.text}</p>
        </section>

        {/* Comments Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
          {/* Placeholder for comments */}
          <p className="text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        </section>
      </div>
    </main>
  );
};

export default PostPage;

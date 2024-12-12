"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
};

type Category = {
  _id: string;
  name: string;
  description: string;
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      const fetchData = async () => {
        try {
          const categoryResponse = await fetch(`/api/categories/${categoryId}`);
          if (!categoryResponse.ok) {
            throw new Error(
              `Category fetch failed: ${categoryResponse.statusText}`
            );
          }
          const categoryData = await categoryResponse.json();
          setCategory(categoryData);

          const postsResponse = await fetch(
            `/api/posts/category?categoryId=${categoryId}`
          );
          if (!postsResponse.ok) {
            throw new Error(`Posts fetch failed: ${postsResponse.statusText}`);
          }
          const postsData: Post[] = await postsResponse.json();
          setPosts(postsData);
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
  }, [categoryId]);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        {/* Category Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold">
            Category: {category?.name || "Loading..."}
          </h1>
          <p className="text-lg mt-4">
            {category?.description || "Explore discussions in this category!"}
          </p>
        </section>

        {/* Create Post Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => router.push("/create-post")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded"
          >
            Create Post
          </button>
        </div>

        {posts.length > 0 && (
          <section>
            {/* Sticky Posts */}
            {posts.some((post) => post.parentPost) && (
              <>
                <h2 className="text-2xl font-semibold mb-6">Sticky Posts</h2>
                <div className="space-y-6">
                  {posts
                    .filter((post) => post.parentPost)
                    .map((post) => (
                      <div
                        key={post._id}
                        className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer"
                        onClick={() => router.push(`/post/${post._id}`)}
                      >
                        {/* Category Name */}
                        <p className="text-blue-500 text-sm font-semibold hover:underline">
                          {category?.name || "Category"}
                        </p>

                        {/* Post Metadata */}
                        <p className="text-sm text-gray-400 mt-2">
                          By{" "}
                          <span className="text-gray-300">
                            {post.username || "Unknown"}
                          </span>{" "}
                          on {new Date(post.date).toLocaleString()}
                        </p>

                        {/* Post Title and Contents */}
                        <h3 className="text-xl font-semibold mt-4">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-gray-300">
                          {post.text.substring(0, 150)}...
                        </p>

                        {/* Post Actions: Comments and Voting */}
                        <div className="flex items-center space-x-4 mt-6 text-sm text-gray-400">
                          {/* Comment Button */}
                          <button
                            onClick={(e) => handleCommentClick(e, post._id)}
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            {post.commentCount || 0} Comments
                          </button>

                          {/* Voting Section */}
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
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* Other Posts */}
            <h2 className="text-2xl font-semibold mt-12 mb-6">Other Posts</h2>
            <div className="space-y-6">
              {posts
                .filter((post) => !post.parentPost)
                .map((post) => (
                  <div
                    key={post._id}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer"
                    onClick={() => router.push(`/post/${post._id}`)}
                  >
                    {/* Category Name */}
                    <p className="text-blue-500 text-sm font-semibold hover:underline">
                      {category?.name || "Category"}
                    </p>

                    {/* Post Metadata */}
                    <p className="text-sm text-gray-400 mt-2">
                      By{" "}
                      <span className="text-gray-300">
                        {post.username || "Unknown"}
                      </span>{" "}
                      on {new Date(post.date).toLocaleString()}
                    </p>

                    {/* Post Title and Contents */}
                    <h3 className="text-xl font-semibold mt-4">{post.title}</h3>
                    <p className="mt-2 text-gray-300">
                      {post.text.substring(0, 150)}...
                    </p>

                    {/* Post Actions: Comments and Voting */}
                    <div className="flex items-center space-x-4 mt-6 text-sm text-gray-400">
                      {/* Comment Button */}
                      <button
                        onClick={(e) => handleCommentClick(e, post._id)}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {post.commentCount || 0} Comments
                      </button>

                      {/* Voting Section */}
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
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default CategoryPage;

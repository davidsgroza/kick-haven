"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import CategorySidebar from "../../components/CategorySidebar";

// Define the Post type
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
  sticky: boolean;
  locked: boolean;
};

// Define the Category type
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
          // Fetch Category Details
          const categoryResponse = await fetch(`/api/categories/${categoryId}`);
          if (!categoryResponse.ok) {
            throw new Error(
              `Category fetch failed: ${categoryResponse.statusText}`
            );
          }
          const categoryData: Category = await categoryResponse.json();
          setCategory(categoryData);

          // Fetch Posts for the Category
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

  // Handle Upvote
  const handleUpvote = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    // Implement upvote logic
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
      )
    );
  };

  // Handle Downvote
  const handleDownvote = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    // Implement downvote logic
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, downvotes: post.downvotes + 1 } : post
      )
    );
  };

  // Handle Comment Click
  const handleCommentClick = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    router.push(`/post/${postId}`);
  };

  // Render Loading or Error States
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  // Separate posts into sticky and other posts
  const stickyPosts = posts.filter((post) => post.sticky);
  let otherPosts = posts.filter((post) => post.parentPost && !post.sticky);

  // Sort otherPosts by date descending
  otherPosts = otherPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        {/* Main Posts Section */}
        <div className="flex-1">
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
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded transition duration-300"
            >
              Create Post
            </button>
          </div>

          {posts.length > 0 && (
            <section className="flex">
              {/* Posts Container */}
              <div className="flex-1">
                {/* Sticky Posts */}
                {stickyPosts.length > 0 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-6">
                      Sticky Posts
                    </h2>
                    <div className="space-y-6">
                      {stickyPosts.map((post) => (
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
                          <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
                            <div className="flex items-center">
                              {/* Profile Picture */}
                              <Image
                                src="/icon.jpg"
                                alt={`${post.username}'s profile`}
                                width={24}
                                height={24}
                                className="rounded-full mr-2"
                              />

                              {/* Username */}
                              <span className="text-gray-300">
                                By {post.username || "Unknown"}
                              </span>
                            </div>

                            {/* Date and Time */}
                            <span className="text-gray-300">
                              {new Date(post.date).toLocaleString()}
                            </span>
                          </div>

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

                          {/* Display Locked Status */}
                          {post.locked && (
                            <span className="mt-2 inline-block bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                              Locked
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Other Posts */}
                {otherPosts.length > 0 && (
                  <>
                    <h2 className="text-2xl font-semibold mt-12 mb-6">
                      Other Posts
                    </h2>
                    <div className="space-y-6">
                      {otherPosts.map((post) => (
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
                          <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
                            <div className="flex items-center">
                              {/* Profile Picture */}
                              <Image
                                src="/icon.jpg"
                                alt={`${post.username}'s profile`}
                                width={24}
                                height={24}
                                className="rounded-full mr-2"
                              />

                              {/* Username */}
                              <span className="text-gray-300">
                                By {post.username || "Unknown"}
                              </span>
                            </div>

                            {/* Date and Time */}
                            <span className="text-gray-300">
                              {new Date(post.date).toLocaleString()}
                            </span>
                          </div>

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

                          {/* Display Locked Status */}
                          {post.locked && (
                            <span className="mt-2 inline-block bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                              Locked
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* If no posts are available */}
                {stickyPosts.length === 0 && otherPosts.length === 0 && (
                  <p className="text-gray-400">
                    No posts available in this category.
                  </p>
                )}
              </div>

              {/* Sidebar Section */}
              <div className="mt-12 md:mt-19 md:ml-8 w-full md:w-60">
                {/* Sticky Sidebar Container */}
                <div className="sticky top-20">
                  <CategorySidebar />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default CategoryPage;

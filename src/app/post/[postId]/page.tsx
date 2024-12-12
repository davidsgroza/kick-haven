// src/app/posts/[postId]/page.tsx

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import CategorySidebar from "../../components/CategorySidebar";

// Define the Post type
type Post = {
  _id: string;
  categoryId: string;
  categoryName: string;
  userId: string;
  username: string;
  parentPost: boolean;
  title: string;
  text: string;
  date: string;
  parentPostId: string | null;
  upvotes: number;
  downvotes: number;
  locked: boolean;
  commentCount: number;
};

// Define the Comment type
type Comment = {
  _id: string;
  postId: string;
  userId: string;
  username: string;
  text: string;
  date: string;
  upvotes: number;
  downvotes: number;
};

const PostPage = () => {
  const { postId } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // New comment state
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch post data
  useEffect(() => {
    if (postId) {
      const fetchData = async () => {
        try {
          const postResponse = await fetch(`/api/posts/category/${postId}`);
          if (!postResponse.ok) {
            throw new Error(`Post fetch failed: ${postResponse.statusText}`);
          }
          const postData: Post = await postResponse.json();
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

  // Fetch comments data
  useEffect(() => {
    if (postId) {
      const fetchComments = async () => {
        try {
          const commentsResponse = await fetch(`/api/comments/${postId}`);
          if (!commentsResponse.ok) {
            throw new Error(
              `Comments fetch failed: ${commentsResponse.statusText}`
            );
          }
          const commentsData: Comment[] = await commentsResponse.json();
          setComments(commentsData);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setCommentsError(err.message);
          } else {
            setCommentsError("An unknown error occurred");
          }
        } finally {
          setCommentsLoading(false);
        }
      };

      fetchComments();
    }
  }, [postId]);

  if (loading) return <p className="text-center text-white">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!post) return <p className="text-center text-white">Post not found.</p>;

  // Handle Upvote
  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/posts/${post._id}/upvote`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to upvote.");
      }
      const updatedPost: Post = await response.json();
      setPost(updatedPost);
    } catch (error) {
      console.error(error);
      // Optionally, display an error message to the user
    }
  };

  // Handle Downvote
  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/posts/${post._id}/downvote`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to downvote.");
      }
      const updatedPost: Post = await response.json();
      setPost(updatedPost);
    } catch (error) {
      console.error(error);
      // Optionally, display an error message to the user
    }
  };

  // Handle new comment submission
  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    setSubmittingComment(true);
    setSubmitError(null);

    if (!newCommentText.trim()) {
      setSubmitError("Comment cannot be empty.");
      setSubmittingComment(false);
      return;
    }

    try {
      const response = await fetch(`/api/comments/${post._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newCommentText.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit comment.");
      }

      const newComment: Comment = await response.json();

      // Append the new comment to the existing comments
      setComments((prevComments) => [newComment, ...prevComments]);

      // Clear the comment input
      setNewCommentText("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("An unknown error occurred.");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        {/* Main Post Section */}
        <div className="flex-1">
          {/* Post Card */}
          <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
            {/* Category Name */}
            <p
              className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer"
              onClick={() => router.push(`/category/${post.categoryId}`)}
            >
              {post.categoryName}
            </p>

            {/* Post Metadata */}
            <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
              <div className="flex items-center">
                {/* Profile Picture */}
                <Image
                  src="/icon.jpg" // Reference the image in the public directory
                  alt={`${post.username}'s profile`}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                {/* Username */}
                <span className="text-gray-300">
                  By {post.username || `User ${post.userId}`}
                </span>
              </div>
              {/* Date and Time */}
              <span className="text-gray-300">
                {new Date(post.date).toLocaleString()}
              </span>
            </div>

            {/* Post Title */}
            <h1 className="text-3xl font-bold text-white mt-4">{post.title}</h1>

            {/* Post Content */}
            <div className="text-lg leading-relaxed text-gray-300 mt-4">
              <p>{post.text}</p>
            </div>

            {/* Voting Section */}
            <div className="flex items-center space-x-2 mt-6">
              <button
                onClick={handleUpvote}
                className="bg-green-600 px-2 py-1 rounded text-white hover:bg-green-500"
                aria-label="Upvote post"
              >
                ▲
              </button>
              <span className="text-white">
                {post.upvotes - post.downvotes}
              </span>
              <button
                onClick={handleDownvote}
                className="bg-red-600 px-2 py-1 rounded text-white hover:bg-red-500"
                aria-label="Downvote post"
              >
                ▼
              </button>
            </div>

            {/* Display Locked Status */}
            {post.locked && (
              <span className="mt-2 inline-block bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                Locked
              </span>
            )}
          </article>

          {/* Comment Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Comments</h2>

            {/* New Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <textarea
                className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                rows={4}
                required
              ></textarea>
              {submitError && (
                <p className="text-red-500 mt-2">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={submittingComment}
                className={`mt-2 px-4 py-2 rounded ${
                  submittingComment
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500"
                } text-white`}
              >
                {submittingComment ? "Submitting..." : "Submit Comment"}
              </button>
            </form>

            {/* Comments List */}
            {commentsLoading ? (
              <p className="text-gray-400">Loading comments...</p>
            ) : commentsError ? (
              <p className="text-red-500">{commentsError}</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-400">No comments yet.</p>
            ) : (
              <ul>
                {comments.map((comment) => (
                  <li
                    key={comment._id}
                    className="bg-gray-700 p-4 rounded mb-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {/* Profile Picture */}
                        <Image
                          src="/icon.jpg" // Reference the image in the public directory
                          alt={`${comment.username}'s profile`}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        {/* Username */}
                        <span className="text-gray-300">
                          {comment.username || `User ${comment.userId}`}
                        </span>
                      </div>
                      {/* Date and Time */}
                      <span className="text-gray-400 text-sm">
                        {new Date(comment.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-200 mt-2">{comment.text}</p>
                    {/* Optionally, add voting for comments */}
                    {/* <div className="flex items-center space-x-2 mt-2">
                      <button
                        className="text-green-400 hover:text-green-300"
                        aria-label="Upvote comment"
                      >
                        ▲
                      </button>
                      <span>{comment.upvotes - comment.downvotes}</span>
                      <button
                        className="text-red-400 hover:text-red-300"
                        aria-label="Downvote comment"
                      >
                        ▼
                      </button>
                    </div> */}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar Section */}
        <div className="mt-12 md:mt-0 md:ml-8 w-full md:w-60">
          {/* Sticky Sidebar Container */}
          <div className="sticky top-4">
            <CategorySidebar />
          </div>
        </div>
      </div>
    </main>
  );
};

export default PostPage;

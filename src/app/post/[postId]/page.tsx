// post/[postId]/page.tsx

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
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
  commentCount: number;
  sticky: boolean;
  locked: boolean;
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
  const { data: session } = useSession();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<string>("asc");

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
            const errorData = await postResponse.json();
            throw new Error(
              errorData.error || `Post fetch failed: ${postResponse.statusText}`
            );
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

  // Debugging Logs for isAuthor
  useEffect(() => {
    console.log("Session User Name:", session?.user?.name);
    console.log("Post Username:", post?.username);
  }, [session, post]);

  // Fetch comments data with pagination and sorting
  useEffect(() => {
    if (postId) {
      fetchComments(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, currentPage, sortOrder]);

  const fetchComments = async (page: number) => {
    try {
      const response = await fetch(
        `/api/comments/${postId}?page=${page}&limit=5&sort=${sortOrder}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch comments.");
      }
      const commentsData: Comment[] = await response.json();
      setComments((prev) => [...prev, ...commentsData]);
      if (commentsData.length < 5) setHasMore(false);
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

  if (loading) return <p className="text-center text-white">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!post) return <p className="text-center text-white">Post not found.</p>;

  // Determine if the current user is the author
  const isAuthor = session?.user?.name === post.username;

  // Handle Upvote
  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/posts/category/${post._id}/upvote`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upvote.");
      }
      const updatedPost: Post = await response.json();
      setPost(updatedPost);
    } catch (error) {
      console.error(error);
      // Add error message
    }
  };

  // Handle Downvote
  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/posts/category/${post._id}/downvote`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to downvote.");
      }
      const updatedPost: Post = await response.json();
      setPost(updatedPost);
    } catch (error) {
      console.error(error);
      // Add error message
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
      const response = await fetch(`/api/comments/${postId}`, {
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

      setComments((prevComments) => [newComment, ...prevComments]);

      // Update the post's comment count
      setPost((prevPost) =>
        prevPost
          ? { ...prevPost, commentCount: prevPost.commentCount + 1 }
          : prevPost
      );

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

  // Handle Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`/api/posts/category/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post.");
      }
      router.push("/"); // Redirect after deletion
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An error occurred.");
      }
    }
  };

  // Handle Edit Post
  const handleEditPost = (postId: string) => {
    router.push(`/edit-post/${postId}`);
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const response = await fetch(
        `/api/posts/category/${post._id}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete comment.");
      }
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      // decrement commentCount
      setPost((prevPost) =>
        prevPost
          ? { ...prevPost, commentCount: prevPost.commentCount - 1 }
          : prevPost
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An error occurred.");
      }
    }
  };

  // Handle Edit Comment
  const handleEditComment = (commentId: string) => {
    router.push(`/edit-comment/${commentId}`);
  };

  // Handle Share Post
  const handleSharePost = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.text,
          url: window.location.href,
        })
        .then(() => console.log("Post shared successfully"))
        .catch((error) => console.error("Error sharing post:", error));
    } else {
      // Fallback for browsers that do not support the Web Share API
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Post URL copied to clipboard!"))
        .catch((error) => console.error("Error copying URL:", error));
    }
  };

  // Handle Save Post
  const handleSavePost = () => {
    // Implement save functionality
    alert("Post saved successfully!");
  };

  // Handle Report Post
  const handleReportPost = () => {
    // Implement report functionality
    alert("Post reported successfully!");
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
                  src="/icon.jpg"
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mt-6">
              {/* Upvote Button */}
              <button
                onClick={handleUpvote}
                className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                aria-label="Upvote post"
              >
                ▲
              </button>

              {/* Vote Count */}
              <span className="text-gray-300">
                {post.upvotes - post.downvotes}
              </span>

              {/* Downvote Button */}
              <button
                onClick={handleDownvote}
                className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                aria-label="Downvote post"
              >
                ▼
              </button>

              {/* Spacer */}
              <div className="flex-grow"></div>

              {/* Conditional Buttons */}
              {isAuthor ? (
                <>
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditPost(post._id)}
                    className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                    aria-label="Edit post"
                  >
                    Edit
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                    aria-label="Delete post"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  {/* Share Button */}
                  <button
                    onClick={handleSharePost}
                    className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                    aria-label="Share post"
                  >
                    Share
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={handleSavePost}
                    className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                    aria-label="Save post"
                  >
                    Save
                  </button>

                  {/* Report Button */}
                  <button
                    onClick={handleReportPost}
                    className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                    aria-label="Report post"
                  >
                    Report
                  </button>
                </>
              )}
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

            {/* Sort By Dropdown */}
            <div className="flex justify-end mb-4">
              <label htmlFor="sort" className="mr-2 text-gray-300">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setComments([]);
                  setCurrentPage(1);
                  setHasMore(true);
                }}
                className="p-2 rounded bg-gray-700 text-white"
              >
                <option value="asc">Oldest First</option>
                <option value="desc">Newest First</option>
              </select>
            </div>

            {/* New Comment Form or Add Comment Button */}
            {session ? (
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
                  className={`mt-2 px-4 py-2 rounded border border-gray-300 text-gray-300 hover:border-white hover:text-white transition ${
                    submittingComment ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  {submittingComment ? "Submitting..." : "Submit Comment"}
                </button>
              </form>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="mb-6 px-4 py-2 bg-gray-700 border border-gray-300 rounded text-gray-300 hover:border-white hover:text-white transition"
              >
                Add Comment
              </button>
            )}

            {/* Comments List */}
            {commentsLoading && currentPage === 1 ? (
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
                          src="/icon.jpg"
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

                    {/* Edit and Delete Buttons */}
                    {session?.user?.name === comment.username && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          className="px-2 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                          aria-label="Edit comment"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="px-2 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                          aria-label="Delete comment"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Load More Button */}
            {hasMore && !commentsLoading && (
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="mt-4 px-4 py-2 bg-gray-700 border border-gray-300 rounded text-gray-300 hover:border-white hover:text-white transition"
              >
                Load More
              </button>
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

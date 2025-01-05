"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactPlayer from "react-player";
import Sidebar from "../../components/CategorySidebar";
import { Components } from "react-markdown";
import DOMPurify from "dompurify";
import { toast } from "react-toastify"; // For notifications

// TypeScript Interfaces
interface Post {
  _id: string;
  categoryId: string;
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
  userVote: "upvote" | "downvote" | null;
}

interface Comment {
  _id: string;
  postId: string;
  userId: string;
  username: string;
  text: string;
  date: string;
  upvotes: number;
  downvotes: number;
  userVote: "upvote" | "downvote" | null;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface VoteResponse {
  success: boolean;
  message: string;
  upvotes: number;
  downvotes: number;
  userVote: "upvote" | "downvote" | null;
}

const PostPage = () => {
  const { postId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<string>("upvotes-desc");

  // New comment state (using ref for optimized typing)
  const newCommentTextRef = useRef<string>("");

  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch categories data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch categories.");
        }
        const categoriesData: Category[] = await response.json();
        setCategories(categoriesData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setCategoriesError(err.message);
        } else {
          setCategoriesError(
            "An unknown error occurred while fetching categories."
          );
        }
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch post data
  useEffect(() => {
    if (!postId) return; // Avoid fetching if no postId

    const fetchPost = async () => {
      setLoading(true);
      try {
        const postResponse = await fetch(`/api/posts/category/${postId}`);
        if (!postResponse.ok) {
          const errorData = await postResponse.json();
          throw new Error(errorData.error || "Post fetch failed.");
        }
        const postData: Post = await postResponse.json();
        setPost(postData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching the post.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost(); // Call the fetch function when postId changes
  }, [postId]);

  // Memoized fetchComments
  const fetchComments = useCallback(
    async (page: number) => {
      try {
        let sortParam = "";
        switch (sortOrder) {
          case "newest":
            sortParam = "newest";
            break;
          case "oldest":
            sortParam = "oldest";
            break;
          case "upvotes-desc":
            sortParam = "upvotes-desc";
            break;
          case "upvotes-asc":
            sortParam = "upvotes-asc";
            break;
          default:
            sortParam = "date-asc";
        }

        const response = await fetch(
          `/api/comments/${postId}?page=${page}&limit=5&sort=${sortParam}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch comments.");
        }
        const commentsData: Comment[] = await response.json();

        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c._id));
          const newUniqueComments = commentsData.filter(
            (c) => !existingIds.has(c._id)
          );
          return [...prev, ...newUniqueComments];
        });

        if (commentsData.length < 5) setHasMore(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setCommentsError(err.message);
        } else {
          setCommentsError("An unknown error occurred.");
        }
      } finally {
        setCommentsLoading(false);
      }
    },
    [postId, sortOrder]
  );

  // Fetch comments when postId, currentPage, or sortOrder changes
  useEffect(() => {
    if (postId) {
      fetchComments(currentPage);
    }
  }, [postId, currentPage, sortOrder, fetchComments]);

  // Loading & error checks
  if (loading || categoriesLoading) {
    return <p className="text-center text-white">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (categoriesError) {
    return <p className="text-center text-red-500">{categoriesError}</p>;
  }

  if (!post) {
    return <p className="text-center text-white">Post not found.</p>;
  }

  // Determine category name
  const category = categories.find((cat) => cat._id === post.categoryId);
  const categoryName = category ? category.name : "Unknown Category";

  // Check if current user is the author
  const isAuthor = session?.user?.name === post.username;

  // Unified vote call for posts or comments
  const postVote = async (
    targetId: string,
    voteType: "upvote" | "downvote"
  ) => {
    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, voteType }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to ${voteType}.`);
    }
    return (await response.json()) as VoteResponse;
  };

  // Handle Vote for Post
  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!post) return;
    try {
      const voteResponse = await postVote(post._id, voteType);
      setPost({
        ...post,
        upvotes: voteResponse.upvotes,
        downvotes: voteResponse.downvotes,
        userVote: voteResponse.userVote,
      });
      toast.success(voteResponse.message);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    }
  };

  // Handle Upvote/Downvote for Post
  const handleUpvoteButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleVote("upvote");
  };

  const handleDownvoteButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleVote("downvote");
  };

  // Handle Vote for Comment
  const handleCommentVote = async (
    commentId: string,
    voteType: "upvote" | "downvote"
  ) => {
    try {
      const voteResponse = await postVote(commentId, voteType);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                upvotes: voteResponse.upvotes,
                downvotes: voteResponse.downvotes,
                userVote: voteResponse.userVote,
              }
            : comment
        )
      );
      toast.success(voteResponse.message);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    }
  };

  // Handle new comment submission
  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault(); // Prevent form default submission behavior (page reload)
    setSubmittingComment(true);
    setSubmitError(null);

    const commentText = newCommentTextRef.current.trim();

    if (!commentText) {
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
        body: JSON.stringify({ text: commentText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit comment.");
      }

      const newComment: Comment = await response.json();

      setComments((prevComments) => {
        // Prevent adding duplicates
        if (prevComments.some((c) => c._id === newComment._id)) {
          return prevComments;
        }
        return [newComment, ...prevComments];
      });

      // Increment post's commentCount
      setPost((prevPost) =>
        prevPost
          ? { ...prevPost, commentCount: prevPost.commentCount + 1 }
          : prevPost
      );

      // Clear comment input field
      newCommentTextRef.current = ""; // Reset the ref to clear the field
      toast.success("Comment submitted successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
        toast.error(err.message);
      } else {
        setSubmitError("An unknown error occurred.");
        toast.error("An unknown error occurred.");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`/api/posts/category/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post.");
      }
      toast.success("Post deleted successfully!");
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An error occurred.");
      }
    }
  };

  // Handle Edit Post
  const handleEditPost = (id: string) => {
    router.push(`/edit-post/${id}`);
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      // Adjust if your comment delete path changes
      const response = await fetch(
        `/api/posts/category/${post?._id}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete comment.");
      }

      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPost((prevPost) =>
        prevPost
          ? { ...prevPost, commentCount: prevPost.commentCount - 1 }
          : prevPost
      );
      toast.success("Comment deleted successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An error occurred.");
      }
    }
  };

  // Handle Edit Comment
  const handleEditComment = (commentId: string) => {
    router.push(`/edit-comment/${commentId}`);
  };

  // Handle Share Post
  const handleSharePost = () => {
    if (!post) return;
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
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.info("Post URL copied to clipboard!"))
        .catch((error) => console.error("Error copying URL:", error));
    }
  };

  // Handle Share Comment
  const handleShareComment = () => {
    if (post) {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      if (navigator.share) {
        navigator
          .share({
            title: post.title,
            text: "Check out this comment on the post:",
            url: postUrl,
          })
          .then(() => console.log("Comment shared successfully"))
          .catch((error) => console.error("Error sharing comment:", error));
      } else {
        navigator.clipboard
          .writeText(postUrl)
          .then(() => toast.info("Post URL copied to clipboard!"))
          .catch((error) => console.error("Error copying URL:", error));
      }
    }
  };

  // Handle Save Post
  const handleSavePost = () => {
    toast.info("Post saved successfully!");
  };

  // Handle Report Post
  const handleReportPost = () => {
    toast.info("Post reported successfully!");
  };

  const renderers: Partial<Components> = {
    a: ({ href, children, ...props }) => {
      if (!href) return <>{children}</>;

      const isYouTube =
        ReactPlayer.canPlay(href) && href.includes("youtube.com");
      const isSpotify =
        ReactPlayer.canPlay(href) && href.includes("spotify.com");
      const isSoundCloud =
        ReactPlayer.canPlay(href) && href.includes("soundcloud.com");

      if (isYouTube || isSpotify || isSoundCloud) {
        return (
          <div className="my-4">
            <ReactPlayer url={href} controls width="100%" />
          </div>
        );
      }

      return (
        <a
          href={href}
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  // Sanitize the post text
  const sanitizedText = DOMPurify.sanitize(post.text);

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        {/* Main Post Section */}
        <div className="flex-1">
          <article className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <p
                className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer"
                onClick={() => router.push(`/category/${post.categoryId}`)}
              >
                kH: {categoryName}
              </p>
            </div>
            <h1 className="text-3xl font-bold text-white mt-4">{post.title}</h1>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]} // GitHub Flavored Markdown support
              components={renderers} // Custom renderers for links and media
            >
              {sanitizedText}
            </ReactMarkdown>
            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mt-6">
              {/* Upvote Button */}
              <button
                onClick={handleUpvoteButton}
                className={`px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition ${
                  post.userVote === "upvote"
                    ? "text-blue-500 border-blue-500"
                    : ""
                }`}
                aria-label="Upvote post"
                title="Upvote post"
              >
                ▲
              </button>

              {/* Vote Count */}
              <span className="text-gray-300">
                {post.upvotes - post.downvotes}
              </span>

              {/* Downvote Button */}
              <button
                onClick={handleDownvoteButton}
                className={`px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition ${
                  post.userVote === "downvote"
                    ? "text-red-500 border-red-500"
                    : ""
                }`}
                aria-label="Downvote post"
                title="Downvote post"
              >
                ▼
              </button>

              {/* If author, show Edit & Delete */}
              {isAuthor && (
                <>
                  <button
                    onClick={() => handleEditPost(post._id)}
                    className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                    aria-label="Edit post"
                    title="Edit post"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                    aria-label="Delete post"
                    title="Delete post"
                  >
                    Delete
                  </button>
                </>
              )}

              {/* Spacer */}
              <div className="flex-grow" />

              {/* Save Button */}
              <button
                onClick={handleSavePost}
                className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                aria-label="Save post"
                title="Save post"
              >
                Save
              </button>

              {/* Share Button */}
              <button
                onClick={handleSharePost}
                className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                aria-label="Share post"
                title="Share post"
              >
                Share
              </button>

              {/* Report Button */}
              <button
                onClick={handleReportPost}
                className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                aria-label="Report post"
                title="Report post"
              >
                Report
              </button>
            </div>

            {/* Locked status */}
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
                  setSortOrder(e.target.value); // Update the sortOrder state
                  setComments([]); // Clear existing comments
                  setCurrentPage(1); // Reset pagination to page 1
                  setHasMore(true); // Allow loading more comments
                  setCommentsError(null); // Reset any error state
                  setCommentsLoading(true); // Trigger the loading state
                }}
                className="p-2 rounded bg-gray-700 text-white"
              >
                <option value="oldest">Oldest First</option>
                <option value="newest">Newest First</option>
                <option value="upvotes-desc">Most Upvoted</option>
                <option value="upvotes-asc">Least Upvoted</option>
              </select>
            </div>

            {/* New Comment Form */}
            {session ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                  key={submittingComment ? "submitting" : "normal"} // Change key to force reset
                  className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a comment..."
                  defaultValue={newCommentTextRef.current} // Use ref value directly
                  onChange={(e) => {
                    newCommentTextRef.current = e.target.value;
                  }} // Update ref, no re-render
                  rows={4}
                  required
                />
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
                        <Image
                          src="/icon.jpg"
                          alt={`${comment.username}'s profile`}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        <span className="text-gray-300">
                          {comment.username || `User ${comment.userId}`}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(comment.date).toLocaleString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-gray-200 mt-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]} // GitHub Flavored Markdown support
                        components={renderers} // Custom renderers for links and media
                      >
                        {comment.text}
                      </ReactMarkdown>
                    </p>
                    {/* Action Buttons for Comment */}
                    <div className="mt-2 flex space-x-2">
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleCommentVote(comment._id, "upvote")}
                        className={`px-2 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition ${
                          comment.userVote === "upvote"
                            ? "text-blue-500 border-blue-500"
                            : ""
                        }`}
                        aria-label="Upvote comment"
                        title="Upvote comment"
                      >
                        ▲
                      </button>

                      {/* Vote Count */}
                      <span className="text-gray-300">
                        {comment.upvotes - comment.downvotes}
                      </span>

                      {/* Downvote Button */}
                      <button
                        onClick={() =>
                          handleCommentVote(comment._id, "downvote")
                        }
                        className={`px-2 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition ${
                          comment.userVote === "downvote"
                            ? "text-red-500 border-red-500"
                            : ""
                        }`}
                        aria-label="Downvote comment"
                        title="Downvote comment"
                      >
                        ▼
                      </button>

                      {/* Edit / Delete for Author */}
                      {session?.user?.name === comment.username && (
                        <>
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="px-2 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                            aria-label="Edit comment"
                            title="Edit comment"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="px-2 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                            aria-label="Delete comment"
                            title="Delete comment"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {/* Spacer */}
                      <div className="flex-grow" />

                      {/* Save Button */}
                      <button
                        onClick={handleSavePost}
                        className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                        aria-label="Save post"
                        title="Save post"
                      >
                        Save
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={handleShareComment}
                        className="px-2 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                        aria-label="Share comment"
                        title="Share comment"
                      >
                        Share
                      </button>

                      {/* Report Button */}
                      <button
                        onClick={handleReportPost}
                        className="px-3 py-1 border rounded text-gray-300 hover:border-white hover:text-white transition"
                        aria-label="Report post"
                        title="Report post"
                      >
                        Report
                      </button>
                    </div>
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
          <div className="sticky top-4">
            <Sidebar />
          </div>
        </div>
      </div>
    </main>
  );
};

export default PostPage;

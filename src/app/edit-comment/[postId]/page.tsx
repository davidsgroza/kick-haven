"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

type Category = {
  _id: string;
  name: string;
};

const EditPostPage = () => {
  const router = useRouter();
  const { postId } = useParams();
  const { isAuthenticated, status } = useAuth();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [parentPostId, setParentPostId] = useState<string | null>(null);

  // Fetch the post data and categories
  useEffect(() => {
    if (isAuthenticated && postId) {
      const fetchPostAndCategories = async () => {
        try {
          const postResponse = await fetch(`/api/posts/category/${postId}`);
          const postData = await postResponse.json();
          setTitle(postData.title);
          setText(postData.text);
          setParentPostId(postData.parentPostId); // Set the parent post ID

          const categoryResponse = await fetch("/api/categories");
          const categoryData: Category[] = await categoryResponse.json();
          setCategories(categoryData);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          setError("Error fetching post or categories.");
        }
      };

      fetchPostAndCategories();
    }
  }, [isAuthenticated, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/category/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          text: text.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update post");
      }

      // Redirect to the parent post page after update
      if (parentPostId) {
        router.push(`/post/${parentPostId}`);
      } else {
        router.push(`/post/${postId}`); // Fallback in case there's no parentPostId
      }
    } catch {
      setError("An error occurred while updating the post.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Loading State During Authentication
  if (status === "loading") {
    return <div className="text-center text-white">Loading...</div>;
  }

  // Prevent Rendering If Not Authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-lg space-y-4"
        >
          {/* Category field (read-only) */}
          <div>
            <label htmlFor="category" className="block mb-2 text-gray-300">
              Category
            </label>
            <select
              id="category"
              className="bg-gray-700 text-white w-full p-2 rounded"
              value={categories[0]?._id || ""}
              disabled
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block mb-2 text-gray-300">
              Title
            </label>
            <input
              id="title"
              className="bg-gray-700 text-white w-full p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              disabled
            />
          </div>

          <div>
            <label htmlFor="text" className="block mb-2 text-gray-300">
              Content
            </label>
            <textarea
              id="text"
              className="bg-gray-700 text-white w-full p-2 rounded"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your post content here..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded ${
                loading && "opacity-50 cursor-not-allowed"
              }`}
            >
              {loading ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditPostPage;

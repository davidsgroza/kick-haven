"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

type Category = {
  _id: string;
  name: string;
};

const CreatePostPage = () => {
  const router = useRouter();
  const { isAuthenticated, status } = useAuth();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch Categories Only If Authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCategories = async () => {
        try {
          const res = await fetch("/api/categories");
          if (!res.ok) {
            throw new Error("Failed to fetch categories");
          }
          const data: Category[] = await res.json();
          setCategories(data);
        } catch {
          setError("Could not load categories.");
        }
      };

      fetchCategories();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim() || !categoryId) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          text: text.trim(),
          categoryId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const { postId } = await res.json();
      router.push(`/post/${postId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while creating the post.");
      }
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
        <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-lg space-y-4"
        >
          <div>
            <label htmlFor="category" className="block mb-2 text-gray-300">
              Category
            </label>
            <select
              id="category"
              className="bg-gray-700 text-white w-full p-2 rounded"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select a category</option>
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
              {loading ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreatePostPage;

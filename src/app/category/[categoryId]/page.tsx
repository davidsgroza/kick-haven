"use client"; // This makes this component a Client Component

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Correctly use `useParams` for dynamic routes

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

const CategoryPage = () => {
  const { categoryId } = useParams(); // Use useParams to get the dynamic categoryId from the URL
  const [posts, setPosts] = useState<Post[]>([]);
  const [categoryName, setCategoryName] = useState<string | null>(null);
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
          setCategoryName(categoryData.name);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold">
          Category: {categoryName || "Loading Category..."}
        </h1>
        <p className="text-lg mt-4">
          Explore discussions in {categoryName || "this category"}!
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Sticky Posts</h2>
        <div className="space-y-6">
          {posts
            .filter((post) => post.parentPost)
            .map((post) => (
              <div
                key={post._id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700"
              >
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="mt-2 text-sm">{post.text}</p>
                <p className="mt-4 text-sm">
                  Posted on: {new Date(post.date).toLocaleString()}
                </p>
              </div>
            ))}
        </div>

        <h2 className="text-2xl font-semibold mt-12 mb-6">Other Posts</h2>
        <div className="space-y-6">
          {posts
            .filter((post) => !post.parentPost)
            .map((post) => (
              <div
                key={post._id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700"
              >
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="mt-2 text-sm">{post.text}</p>
                <p className="mt-4 text-sm">
                  Posted on: {new Date(post.date).toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
};

export default CategoryPage;

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define a Category object
interface Category {
  _id: string;
  name: string;
  description: string;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error(
            `Failed to fetch categories: ${res.status} ${res.statusText}`
          );
        }
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Unable to load categories at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8">
      {/* Welcome Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold">Welcome to kickHaven</h1>
        <p className="text-lg mt-4">
          Explore and discuss all your favorite alternative music genres!
        </p>
      </section>

      {/* Categories Section */}
      <section>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Categories</h2>

          {/* Loading State */}
          {loading && categories.length === 0 ? (
            <div className="flex justify-center items-center">
              {/* Spinner copied from Dashboard */}
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            </div>
          ) : error ? (
            /* Error Handling */
            <p className="text-red-500">{error}</p>
          ) : categories.length > 0 ? (
            /* Categories Grid */
            <div className="grid grid-cols-2 gap-4">
              {categories.map(({ _id, name, description }) => (
                <Link
                  key={_id}
                  href={`/category/${_id}`}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition group"
                >
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold">{name}</h3>
                    <p className="mt-2 text-sm">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              No categories available at the moment.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

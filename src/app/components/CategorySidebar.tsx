"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type Category = {
  _id: string;
  name: string;
  description: string;
};

const CategorySidebar = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.statusText}`);
        }
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <p className="text-gray-400">Loading categories...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <aside className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 max-h-screen overflow-y-auto">
      <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
      <ul className="space-y-2">
        {categories.map((category) => {
          const isActive = pathname === `/category/${category._id}`;

          return (
            <li key={category._id}>
              <Link
                href={`/category/${category._id}`}
                className={`flex items-center text-gray-200 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition ${
                  isActive ? "bg-gray-700 text-white" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {/*Category Icon */}
                <Image
                  src="/icon.jpg" // Replace with a category-specific icon
                  alt={`${category.name} Icon`}
                  width={20}
                  height={20}
                  className="rounded-full mr-2"
                />
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default CategorySidebar;

"use client";

import { useSession, signOut } from "next-auth/react";
import React, { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

function Navbar() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="bg-blue-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center text-lg font-bold text-white"
          >
            <Image
              src="/icon.jpg"
              alt="kickHaven Icon"
              width={50}
              height={50}
              className="rounded-lg mr-2"
            />
            kickHaven
          </Link>
        </div>

        <div className="flex-grow flex justify-center">
          <form onSubmit={handleSearch} className="relative w-1/2 md:w-1/3">
            <input
              type="text"
              placeholder="Search kickHaven"
              className="w-full p-3 pl-12 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-900 text-white placeholder-gray-400"
              value={searchQuery}
              onChange={handleChange}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </form>
        </div>

        <div>
          {!session ? (
            <>
              <Link
                href="/login"
                className="mx-2 text-white hover:text-white bg-blue-800 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="mx-2 text-white hover:text-white bg-blue-800 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="mx-2 text-white hover:text-white bg-blue-800 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mx-2 text-red-500 hover:text-red-300 bg-blue-800 hover:bg-red-600 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

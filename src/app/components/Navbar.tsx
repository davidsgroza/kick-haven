"use client";

import { useSession, signOut } from "next-auth/react";
import React from "react";
import Link from "next/link";
import Image from "next/image";

function Navbar() {
  const { data: session } = useSession(); // To check if the user is logged in

  return (
    <nav className="bg-blue-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center text-lg font-bold text-white"
          >
            {/* The logo */}
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
        <div>
          {/* Show Login/Register when the user is not authenticated */}
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
              {/* Show Dashboard and Logout when the user is authenticated */}
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

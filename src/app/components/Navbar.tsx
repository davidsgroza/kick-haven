"use client";

import { useSession, signOut } from "next-auth/react"; // Import useSession and signOut
import React from "react";
import Link from "next/link";
import Image from "next/image";

function Navbar() {
  const { data: session } = useSession(); // Use session to check if the user is logged in

  return (
    <nav className="bg-blue-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {/* The logo doesn't react to hover and click states */}
          <Image
            src="/icon.jpg"
            alt="kickHaven Icon"
            width={32}
            height={32}
            className="mr-2"
          />
          <Link href="/" className="text-lg font-bold text-white">
            kickHaven
          </Link>
        </div>
        <div>
          {/* Show Login/Register when the user is not authenticated */}
          {!session ? (
            <>
              <Link
                href="/login"
                className="mx-2 text-white hover:text-blue-300 active:text-blue-500 focus:text-blue-400"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="mx-2 text-white hover:text-blue-300 active:text-blue-500 focus:text-blue-400"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Show My Account and Logout when the user is authenticated */}
              <Link
                href="/account"
                className="mx-2 text-white hover:text-blue-300 active:text-blue-500 focus:text-blue-400"
              >
                My Account
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mx-2 text-red-500 hover:text-red-400 active:text-red-700 focus:text-red-600"
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

import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import Link from "next/link";
import "./globals.css";
import { cookies } from "next/headers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "kickHaven",
  description: "A forum for music fans",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionId = (await cookieStore).get("session_id")?.value;

  let isLoggedIn = false;
  if (sessionId) {
    const response = await fetch("/api/login", {
      headers: {
        Cookie: `session_id=${sessionId}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      isLoggedIn = data.authenticated;
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
          {/* Navbar */}
          <nav className="bg-blue-700 p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center">
                {/* Image before the kickHaven link */}
                <img
                  src="/icon.jpg"
                  alt="kickHaven Icon"
                  className="h-8 w-8 mr-2"
                />
                <Link href="/" className="text-lg font-bold">
                  kickHaven
                </Link>
              </div>
              <div>
                {isLoggedIn ? (
                  <Link href="/account" className="mx-2">
                    My Account
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="mx-2">
                      Login
                    </Link>
                    <Link href="/register" className="mx-2">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-grow">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-800 p-4 text-center">
            <Link
              href="https://github.com/davidsgroza/kick-haven"
              className="text-blue-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View the GitHub Repository
            </Link>
            <p>© 2024 kickHaven. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

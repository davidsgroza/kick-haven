import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import Link from "next/link";
import "./globals.css";

// Load fonts
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

// Metadata for the application
export const metadata: Metadata = {
  title: "kickHaven",
  description: "A forum for music fans",
};

// Main Layout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                />{" "}
                {/* Adjust size and margin */}
                <Link href="/" className="text-lg font-bold">
                  kickHaven
                </Link>
              </div>
              <div>
                <Link href="/login" className="mx-2">
                  Login
                </Link>
                <Link href="/register" className="mx-2">
                  Register
                </Link>
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

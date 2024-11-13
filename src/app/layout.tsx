import localFont from "next/font/local";
import React from "react";
import Link from "next/link";
import "./globals.css";
import { Metadata } from "next";
import Navbar from "@/app/components/Navbar"; // Import Navbar component
import SessionWrapper from "@/app/components/SessionWrapper"; // Import SessionSrapper component

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

// Metadata for the application (server-side)
export const metadata: Metadata = {
  title: "kickHaven",
  description: "A forum for music fans",
};

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
        <SessionWrapper>
          <div className="min-h-screen flex flex-col bg-gray-900 text-white">
            <Navbar /> {/* Navbar component now correctly imported */}
            <main className="flex-grow">{children}</main>
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
        </SessionWrapper>
      </body>
    </html>
  );
}

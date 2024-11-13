"use client";

import localFont from "next/font/local";
import React from "react";
import Link from "next/link";
import "./globals.css";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const LayoutSessionStatusClient = dynamic(
    () => import("./LayoutSessionStatusClient"),
    {
      ssr: false,
    }
  );

  return (
    <SessionProvider>
      <html lang="en">
        <Head>
          <title>kickHaven</title>
          <meta name="description" content="A forum for music fans" />
        </Head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <nav className="bg-gray-800 p-4">
            <ul className="flex justify-between items-center">
              <li>
                <Link href="/">kickHaven</Link>
              </li>
              <li>
                <LayoutSessionStatusClient />
              </li>
            </ul>
          </nav>
          <main className="min-h-screen flex flex-col bg-gray-900 text-white">
            {children}
          </main>
        </body>
      </html>
    </SessionProvider>
  );
}

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";

function LayoutSessionStatusClient() {
  const { data: session, status } = useSession();
  // Use the session variable here
  console.log("User is authenticated:", session);

  if (status === "authenticated") {
    return (
      <ul className="flex items-center">
        <li>
          <Link href="/profile">Profile</Link>
        </li>
        <li>
          <Link href="/logout">Logout</Link>
        </li>
      </ul>
    );
  }

  return (
    <ul className="flex items-center">
      <li>
        <Link href="/login">Login</Link>
      </li>
      <li>
        <Link href="/register">Register</Link>
      </li>
    </ul>
  );
}

export default function WrappedLayoutSessionStatusClient() {
  return (
    <SessionProvider>
      <LayoutSessionStatusClient />
    </SessionProvider>
  );
}

"use client";
import { useSession } from "next-auth/react";

export function userAuthenticated() {
  const { data: session, status } = useSession();
  console.log("User is authenticated:", session);

  return status === "authenticated" && session !== null;
}

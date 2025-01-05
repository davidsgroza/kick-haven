// @types/next-auth.d.ts
import { DefaultSession } from "next-auth";

// Extend the default session type to include 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id?: string; // Adding 'id' property to user
    } & DefaultSession["user"];
  }
}

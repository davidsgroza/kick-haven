import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/utils/mongo";
import bcrypt from "bcryptjs";
import { SessionStrategy } from "next-auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"username" | "password", string> | undefined
      ): Promise<{ id: string; name: string; email: string } | null> {
        if (!credentials) {
          return null;
        }
        const { username, password } = credentials;

        const client = await connectToDatabase();
        const db = client.db("kick-haven-local");
        const user = await db.collection("users").findOne({ username });
        console.log(`Trying to authenticate user: ${username}`);
        if (!user) {
          console.log(`User ${username} not found`);
          return null;
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log("Invalid password");
          return null;
        }
        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/login", // Custom login page
    error: "/auth/error", // Error page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

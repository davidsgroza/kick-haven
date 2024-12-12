import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/utils/mongo";
import bcrypt from "bcryptjs";
import { SessionStrategy } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { username, password } = credentials;

        const client = await connectToDatabase();
        const db = client.db("kick-haven-local");
        const dbUser = await db.collection("users").findOne({ username });

        console.log(`Trying to authenticate user: ${username}`);
        if (!dbUser) {
          console.log(`User ${username} not found`);
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, dbUser.password);
        if (!isValidPassword) {
          console.log("Invalid password");
          return null;
        }

        // Return an AdapterUser compatible object including emailVerified
        return {
          id: dbUser._id.toString(),
          name: dbUser.username,
          email: dbUser.email,
          emailVerified: null, // required by AdapterUser
        } satisfies AdapterUser;
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    // Only destructure what we need to avoid unused var warnings
    async jwt({ token, user }) {
      // If a user signed in, add their id to the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // If token has an id, add it to session.user
      if (token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

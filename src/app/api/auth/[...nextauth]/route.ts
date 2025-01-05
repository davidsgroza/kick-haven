import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/utils/mongo";
import bcrypt from "bcryptjs";
import { SessionStrategy } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

// NextAuth configuration
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

        // Return the user object including `id` and `name`, ensuring it's compatible with AdapterUser
        return {
          id: dbUser._id.toString(), // Add user `id`
          name: dbUser.username,
          email: dbUser.email,
          emailVerified: null, // `emailVerified` is required by AdapterUser
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
    // Add `id` to the JWT token when user logs in
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Add user `id` to token
      }
      return token;
    },
    // Add `id` to the session.user when the session is being created
    async session({ session, token }) {
      if (token.id) {
        (session.user as { id?: string }).id = token.id as string; // Add `id` to session.user
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

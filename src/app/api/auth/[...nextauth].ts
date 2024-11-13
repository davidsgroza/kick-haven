import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/utils/mongo";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await connectToDatabase();
        const db = client.db("kick-haven-local");

        const user = await db
          .collection("users")
          .findOne({ username: credentials.username });
        if (!user) {
          console.log("User not found");
        }
        if (
          user &&
          !(await bcrypt.compare(credentials.password, user.password))
        ) {
          console.log("Password mismatch");
        }

        // Check if user exists and the password is correct
        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          client.close();
          return { id: user._id, name: user.username, email: user.email };
        }

        // If the credentials are invalid
        client.close();
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // Custom login page
    error: "/auth/error", // Error page
  },
};

export default NextAuth(authOptions);

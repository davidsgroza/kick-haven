import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";

export default NextAuth({
  secret: process.env.SECRET,
  providers: [
    // Sign in with passwordless email link
    EmailProvider({
      server: process.env.MAIL_SERVER,
      from: "<no-reply@example.com>",
    }),
  ],
});

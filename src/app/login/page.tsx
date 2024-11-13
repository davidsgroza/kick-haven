"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { data: session, status } = useSession();

  if (status === "authenticated") {
    console.log("User is authenticated:", session);
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error before making a request

    // Field validations
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Login request using Next-Auth
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result && result.error) {
      setError(result.error);
    } else if (result) {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 w-full max-w-xl"
      >
        <h1 className="text-2xl font-semibold">Login</h1>
        {error && <p className="text-red-500">{error}</p>}{" "}
        {/* Display error message */}
        <p>
          By continuing, you agree to our{" "}
          <Link
            href="/terms-and-conditions"
            className="text-blue-400 hover:text-blue-600"
          >
            User Agreement
          </Link>
          .
        </p>
        <hr className="border-gray-600 my-4" />
        <div className="mb-4">
          <div className="flex justify-between">
            <label
              className="text-lg font-medium text-white"
              htmlFor="username"
            >
              Username:
            </label>
            <input
              type="username"
              id="username"
              placeholder="Username"
              className="bg-gray-700 text-gray-200 w-3/4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between">
            <label
              className="text-lg font-medium text-white"
              htmlFor="password"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="bg-gray-700 text-gray-200 w-3/4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <hr className="border-gray-600 my-4" />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 rounded-lg hover:bg-blue-700 active:bg-blue-900 transition duration-200"
        >
          Login
        </button>
        <hr className="border-gray-600 my-4" />
        <p>
          {" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-600">
            Forgot password?
          </Link>
        </p>
        <p>
          Do not have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-600">
            Register here
          </Link>
        </p>
      </form>
    </main>
  );
}

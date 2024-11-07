"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error before making a request

    // Field validations
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError("Invalid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Login request
    const loginResponse = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      // If the response is not ok, show the error message
      if (loginData.message === "No match for E-Mail Address and/or Password") {
        setError("Invalid email or password");
      } else {
        setError(loginData.message);
      }
    } else {
      // Alert on successful login
      alert(loginData.message || "Logged in successfully");
      // Optionally, redirect or clear the form
      setEmail("");
      setPassword("");
      // Redirect to the main page
      router.push("/"); // This will navigate to the main page (home)
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
      >
        <h1 className="text-2xl font-semibold">Login</h1>
        {error && <p className="text-red-500">{error}</p>}{" "}
        {/* Display error message */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded-lg bg-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded-lg bg-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
        <p>
          Do not have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:text-blue-700">
            Register here
          </Link>
        </p>
      </form>
    </main>
  );
}

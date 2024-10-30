"use client"; // Client component

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State to hold error messages
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error before making a request

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response is not ok, show the error message
      setError(data.message);
    } else {
      // Alert on successful login
      alert(data.message || "Logged in successfully");
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
        <button type="submit" className="w-full p-2 bg-blue-500 rounded-lg">
          Login
        </button>
      </form>
    </main>
  );
}

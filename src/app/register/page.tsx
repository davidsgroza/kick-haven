"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    alert(data.message || "Registered successfully");

    router.push("/"); // This will navigate to the main page (home)
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
      >
        <h1 className="text-2xl font-semibold">Register</h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 rounded-lg bg-gray-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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
          Register
        </button>
      </form>
    </main>
  );
}

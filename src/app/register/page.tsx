"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      console.log("Submitting registration form");

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          emailConfirm,
          password,
          passwordConfirm,
          termsAndConditions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Registration successful");
        alert("User registered successfully!"); // Add this line to display a popup message
        router.push("/"); // Redirect to the homepage
      } else {
        console.log("Registration failed:", data.message);
        alert(data.message); // Display the error message
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold">Register Account</h1>

        <div className="flex flex-col space-y-2">
          <label className="block text-gray-200" htmlFor="username">
            Username:
          </label>
          <input
            type="text"
            placeholder="Username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-700 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="block text-gray-200" htmlFor="email">
            E-Mail:
          </label>
          <input
            type="email"
            placeholder="E-Mail"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-700 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="block text-gray-200" htmlFor="emailConfirm">
            E-Mail Confirm:
          </label>
          <input
            type="email"
            placeholder="E-Mail Confirm"
            id="emailConfirm"
            value={emailConfirm}
            onChange={(e) => setEmailConfirm(e.target.value)}
            className="bg-gray-700 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="block text-gray-200" htmlFor="password">
            Password:
          </label>
          <input
            type="password"
            placeholder="Password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-700 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="block text-gray-200" htmlFor="passwordConfirm">
            Password Confirm:
          </label>
          <input
            type="password"
            placeholder="Password Confirm"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="bg-gray-700 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="block text-gray-200">
            <input
              type="checkbox"
              checked={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.checked)}
              className="mr-2"
            />
            I have read and agree to the Terms and Conditions
          </label>
        </div>

        <button type="submit" className="w-full p-2 bg-blue-500 rounded-lg">
          Register
        </button>
      </form>
    </main>
  );
};

export default RegisterPage;

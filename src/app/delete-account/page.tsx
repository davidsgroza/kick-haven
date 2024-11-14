"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const DeleteAccountPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  //const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "loading") {
      return; // Do nothing while session is loading
    }

    if (!session) {
      router.push("/login"); // Redirect to login if no session
    } else {
      setIsAuthenticated(true); // Set to true when user is authenticated
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // Loading state
  }

  if (!isAuthenticated || !session?.user?.name) {
    return null; // Prevent rendering while redirect is happening
  }

  // Handle delete confirmation
  const handleDeleteAccount = () => {
    if (!password) {
      setError("Please enter your password to confirm.");
      return;
    }

    // Call your API to delete the account using the password
    // Placeholder for actual delete API call
    fetch("/api/delete-account", {
      method: "POST",
      body: JSON.stringify({ password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete account.");
        }
        // If successful, sign out and redirect to home
        signOut({ callbackUrl: "/" });
        router.push("/");
      })
      .catch((err) => {
        setError(err.message || "Something went wrong.");
      });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-semibold mb-8">Delete Account</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
        <p className="text-lg">
          Warning: Deleting your account is permanent and cannot be undone. All
          your posts, preferences, and data will be deleted.
        </p>

        <div className="space-y-4">
          {/* Password input for confirmation */}
          <div>
            <label htmlFor="password" className="block text-gray-200 mb-2">
              Enter your password to confirm:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
          </div>

          {/* Error message */}
          {error && <p className="text-red-500">{error}</p>}

          {/* Confirmation button */}
          <button
            onClick={handleDeleteAccount}
            className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Confirm Delete Account
          </button>
        </div>
      </div>
    </main>
  );
};

export default DeleteAccountPage;

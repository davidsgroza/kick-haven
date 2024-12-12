"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

const DeleteAccountPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

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
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Left side (Main Content) */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold mb-8">Delete Account</h1>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
            <p className="text-lg">
              Warning: Deleting your account is permanent and cannot be undone.
              All your posts, preferences, and data will be deleted.
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
                onClick={() => setShowConfirmationModal(true)}
                className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Right side (Sidebar) */}
        <Sidebar />
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-lg w-full">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Are you sure?
            </h2>
            <p className="text-gray-300 mb-6">
              Deleting your account is permanent and cannot be undone. Please
              confirm by entering your password.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="w-full p-3 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-500"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default DeleteAccountPage;

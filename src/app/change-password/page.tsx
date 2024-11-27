"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

const ChangePasswordPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Form data state
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

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

  // Handle form data change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);

    // TO DO: Handle password change
    console.log("Changing password with data:", formData);

    // Simulate a success
    setTimeout(() => {
      alert("Password changed successfully!");
      router.push("/dashboard"); // Redirect back to dashboard after success
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Left side (Main Content) */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg space-y-6">
          <h1 className="text-4xl font-semibold mb-8">Change Password</h1>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-6 rounded-lg space-y-6"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter your current password"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter a new password"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
                className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Confirm your new password"
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>

        {/* Right side (Sidebar) */}
        <Sidebar />
      </div>
    </main>
  );
};

export default ChangePasswordPage;

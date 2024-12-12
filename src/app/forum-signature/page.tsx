"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

const ForumSignaturePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Form data state for signature
  const [signature, setSignature] = useState<string>("");

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
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSignature(e.target.value);
  };

  // Handle form submission (no backend integration yet)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate signature (optional)
    if (signature.trim() === "") {
      setError("Signature cannot be empty.");
      return;
    }

    setError(null);

    // backend integration
    console.log("Updating signature:", signature);

    // successfully submitted
    setTimeout(() => {
      alert("Signature updated successfully!");
      router.push("/dashboard"); // Redirect back to dashboard after success
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Left side (Main Content) */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold mb-8">Forum Signature</h1>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-6 rounded-lg space-y-6"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <label
                htmlFor="signature"
                className="block text-sm font-medium text-gray-300"
              >
                Create your forum signature
              </label>
              <textarea
                id="signature"
                name="signature"
                value={signature}
                onChange={handleInputChange}
                className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter your signature. You can include a song embed (SoundCloud/BandCamp)."
                rows={6}
                required
              />
              <small className="text-gray-400 mt-1 block">
                You can embed a song by pasting a SoundCloud or BandCamp URL.
              </small>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                Save Changes
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

export default ForumSignaturePage;

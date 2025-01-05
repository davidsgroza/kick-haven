"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar"; // Import Sidebar component
import ReactPlayer from "react-player";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ForumSignaturePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Form data state for signature
  const [signature, setSignature] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // State for loading
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

    // Fetch the user's current signature
    const fetchSignature = async () => {
      if (!session?.user?.name) return;
      try {
        const response = await fetch("/api/forum-signature", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.user.name}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setSignature(data.signature || ""); // Prefill the signature field
        } else {
          setError(data.message || "Failed to load signature.");
        }
      } catch (error) {
        setError("An error occurred while loading the signature.");
        console.error(error);
      } finally {
        setLoading(false); // Hide the spinner when data is loaded
      }
    };

    fetchSignature();
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

    try {
      const response = await fetch("/api/forum-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.name}`,
        },
        body: JSON.stringify({
          signature,
          currentUsername: session.user.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signature updated successfully!");
        router.push("/dashboard"); // Redirect back to dashboard after success
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      console.error(error);
    }
  };

  // Function to render the forum signature preview
  const renderSignaturePreview = (signatureText: string) => {
    return (
      <div className="signature-preview mt-4 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white">Preview:</h3>
        <div className="mt-2">
          {/* Use ReactMarkdown to render any URLs like SoundCloud/BandCamp */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => {
                // If it's a SoundCloud or Bandcamp link, use ReactPlayer to show the preview
                if (
                  href &&
                  (href.includes("soundcloud.com") ||
                    href.includes("bandcamp.com"))
                ) {
                  return (
                    <div className="my-4">
                      <ReactPlayer url={href} width="100%" height="50px" />
                    </div>
                  );
                }
                return (
                  <a
                    href={href}
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {signatureText}
          </ReactMarkdown>
        </div>
      </div>
    );
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

            {/* Loading State */}
            {loading && signature.trim() === "" ? (
              <div className="flex justify-center items-center">
                {/* Spinner copied from Dashboard */}
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>
            ) : (
              <>
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
                    You can embed a song by pasting a SoundCloud URL.
                  </small>
                </div>

                {/* Signature preview */}
                {renderSignaturePreview(signature)}

                <div className="flex justify-end gap-4">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Right side (Sidebar) */}
        <Sidebar />
      </div>
    </main>
  );
};

export default ForumSignaturePage;

"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

const DashboardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session data and status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if session exists
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

  // Sample placeholder posts
  const posts = Array.from({ length: 5 }).map((_, index) => ({
    subcategory: "Alternative Music",
    title: `Sample Post Title ${index + 1}`,
    snippet:
      "This is a preview of the post content, providing a glimpse of the discussion...",
  }));

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      {/* Main content */}
      <div className="w-full max-w-4xl flex gap-8">
        {/* Left side (Main Content) */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          {/* Dashboard Title */}
          <h1 className="text-4xl font-semibold">Dashboard</h1>

          {/* My Posts Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">My Posts</h2>
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  <Link href="#" className="text-blue-400 hover:underline">
                    {post.subcategory}
                  </Link>
                  <h3 className="text-xl font-medium mt-2">
                    <Link href="#" className="text-blue-400 hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-300 mt-1 truncate">{post.snippet}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right side (Sidebar) */}
        <aside className="w-60 bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
          {/* Profile Picture & Username */}
          <div className="flex items-center space-x-4 mb-6">
            <Image
              src="/icon.jpg" // Image in the src/app folder
              alt="Profile Picture"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div className="text-white">
              <h3 className="text-xl font-semibold">{session.user?.name}</h3>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/profile-info"
                className="block text-gray-200 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Profile Information
              </Link>
            </li>
            <li>
              <Link
                href="/change-password"
                className="block text-gray-200 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Change Password
              </Link>
            </li>
            <li>
              <Link
                href="/forum-signature"
                className="block text-gray-200 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Forum Signature
              </Link>
            </li>
            <li>
              <Link
                href="/messages"
                className="block text-gray-200 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Messages
              </Link>
            </li>
            <li>
              <Link
                href="/notifications"
                className="block text-gray-200 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Notifications
              </Link>
            </li>
            <li>
              <Link
                href="/preferences"
                className="block text-gray-200 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Preferences
              </Link>
            </li>
            <li>
              <Link
                href="/delete-account"
                className="block text-gray-200 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Delete Account
              </Link>
            </li>
            {/* Logout button with onClick handler */}
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block text-red-500 hover:text-red-400 hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Logout
              </button>
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
};

export default DashboardPage;

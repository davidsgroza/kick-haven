"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

const NotificationsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Sample notifications (placeholder data)
  const notifications = [
    {
      id: 1,
      type: "Message",
      content: "You have a new message from User One.",
      date: "2024-11-12",
    },
    {
      id: 2,
      type: "Mention",
      content: "User Two mentioned you in a post.",
      date: "2024-11-11",
    },
    {
      id: 3,
      type: "Follow",
      content: "User Three started following you.",
      date: "2024-11-10",
    },
  ];

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

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Left side (Main Content) */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold mb-8">Notifications</h1>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold mb-6">
              Recent Notifications
            </h2>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  <p className="font-semibold">{notification.type}</p>
                  <p className="text-gray-300 mt-1">{notification.content}</p>
                  <small className="text-gray-400">{notification.date}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side (Sidebar) */}
        <Sidebar />
      </div>
    </main>
  );
};

export default NotificationsPage;

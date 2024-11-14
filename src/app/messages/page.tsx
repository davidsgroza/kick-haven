"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MessagesPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Sample conversations (placeholder data)
  const conversations = [
    {
      id: 1,
      sender: "User One",
      lastMessage: "Hey, let's talk about music!",
      date: "2024-11-12",
    },
    {
      id: 2,
      sender: "User Two",
      lastMessage: "I have some great tracks to share.",
      date: "2024-11-10",
    },
    {
      id: 3,
      sender: "User Three",
      lastMessage: "Looking forward to the next concert!",
      date: "2024-11-08",
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
    <main className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-semibold mb-8">Messages</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold mb-6">Conversations</h2>

        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              <Link
                href={`/messages/${conversation.id}`} // Link to individual message page
                className="block"
              >
                <h3 className="text-lg font-medium text-blue-400 hover:underline">
                  {conversation.sender}
                </h3>
                <p className="text-gray-300 mt-1 truncate">
                  {conversation.lastMessage}
                </p>
                <small className="text-gray-400">{conversation.date}</small>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MessagesPage;

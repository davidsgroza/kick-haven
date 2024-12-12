// components/Sidebar.tsx
"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

const Sidebar = () => {
  const { data: session } = useSession();

  return (
    <aside className="w-60 bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <Image
          src="/icon.jpg"
          alt="Profile Picture"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="text-white">
          <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
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
  );
};

export default Sidebar;

"use client";

import { useSession, signOut } from "next-auth/react";
import React, { useState } from "react";
import Link from "next/link";

function MyAccount() {
  const { data: session } = useSession();
  const [editingProfile, setEditingProfile] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "Bio goes here", // Add fetch bio or add bio
  });

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-lg">Welcome back, {session?.user?.name}!</p>
      </header>

      <div className="flex justify-center gap-10 mb-8">
        {/* Navigation links to sections */}
        <Link href="#profile" className="text-blue-400 hover:text-blue-300">
          Profile
        </Link>
        <Link href="#posts" className="text-blue-400 hover:text-blue-300">
          My Posts
        </Link>
        <Link href="#settings" className="text-blue-400 hover:text-blue-300">
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="text-red-500 hover:text-red-400"
        >
          Log Out
        </button>
      </div>

      {/* Sections */}
      <section id="profile" className="mb-12">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        <div className="mt-4">
          <p>
            <strong>Username:</strong> {userInfo.username}
          </p>
          <p>
            <strong>Email:</strong> {userInfo.email}
          </p>
          <p>
            <strong>Bio:</strong> {userInfo.bio || "No bio added yet"}
          </p>

          {!editingProfile ? (
            <button
              onClick={() => setEditingProfile(true)}
              className="text-blue-400 hover:text-blue-300"
            >
              Edit Profile
            </button>
          ) : (
            <div className="mt-4">
              <input
                type="text"
                value={userInfo.username}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, username: e.target.value })
                }
                className="block mb-2 p-2 text-black"
                placeholder="Update Username"
              />
              <textarea
                value={userInfo.bio}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, bio: e.target.value })
                }
                className="block mb-2 p-2 text-black"
                placeholder="Update Bio"
              />
              <button
                onClick={() => setEditingProfile(false)}
                className="text-green-500 hover:text-green-400"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Posts Section */}
      <section id="posts" className="mb-12">
        <h2 className="text-2xl font-bold">My Posts</h2>
        <p>List of posts goes here...</p>
      </section>

      {/* Settings Section */}
      <section id="settings" className="mb-12">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <div className="mt-4">
          <button className="text-blue-400 hover:text-blue-300">
            Change Password
          </button>
        </div>
      </section>

      <footer className="text-center mt-12">
        <button
          onClick={handleSignOut}
          className="text-red-500 hover:text-red-400"
        >
          Log Out
        </button>
      </footer>
    </div>
  );
}

export default MyAccount;

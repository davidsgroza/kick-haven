"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const Sidebar = () => {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch the user's profile image from the server
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!session?.user?.id) return; // Ensure the user ID is available
      try {
        // Fetch the user's profile image from the server using the user ID
        const imageUrl = `/api/user/profile-image/${session.user.id}`;
        setProfileImage(imageUrl);
      } catch (error) {
        console.error("Error fetching profile image:", error);
        setProfileImage("/icon.jpg"); // Fallback to default icon
        setError("Failed to load profile image.");
      }
    };

    fetchProfileImage();
  }, [session]); // Re-fetch when the session changes

  // Handle file selection for profile picture upload
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and GIF files are allowed.");
      return;
    }

    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      setError("File size must be less than 4MB.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setUploading(true);
      const response = await axios.post("/api/user/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess("Image uploaded successfully!");
        // Update the profile image state after uploading
        const updatedProfileImage = URL.createObjectURL(file);
        setProfileImage(updatedProfileImage); // Immediately reflect the uploaded image
        await update(); // Update session to reflect the new image
      } else {
        setError(response.data.message || "Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("An error occurred while uploading the image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle delete profile picture
  const handleDeleteProfilePicture = async () => {
    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      const response = await axios.delete("/api/user/profile-image");

      if (response.data.success) {
        await update(); // Update session
        setProfileImage("/icon.jpg"); // Reset to default icon
        setSuccess("Image deleted successfully!");
      } else {
        setError(response.data.message || "Failed to delete image.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("An error occurred while deleting the image.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <aside className="w-60 bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="rounded-full overflow-hidden w-44 h-44 border-4 border-gray-700 shadow-md transition-transform transform hover:scale-105">
            <Image
              src={profileImage || "/icon.jpg"}
              alt="Profile Picture"
              width={200}
              height={200}
              className="object-cover w-full h-full"
              unoptimized // Prevents Next.js image optimization
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 bg-gray-800/70 py-2 rounded-b-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-white bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition"
              title="Change Picture"
            >
              ✏️
            </button>
            <button
              onClick={handleDeleteProfilePicture}
              className="text-white bg-red-200 hover:bg-red-300 p-2 rounded-full transition"
              title="Delete Picture"
            >
              ❌
            </button>
          </div>
          <input
            type="file"
            accept="image/jpeg, image/png, image/gif"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="text-white">
          <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
          {uploading && <p className="text-sm text-gray-400">Uploading...</p>}
          {deleting && <p className="text-sm text-gray-400">Deleting...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-white">
        Account Settings
      </h3>
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
            className="block text-red-500 hover:text-red-400 hover:bg-gray-700 px-3 py-2 rounded-md transition w-full text-left"
          >
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;

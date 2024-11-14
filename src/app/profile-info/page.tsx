"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ProfileInfoPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session data and status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Profile form data
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    birthdate: "",
    email: "",
    username: session?.user?.name || "",
  });

  useEffect(() => {
    if (status === "loading") {
      return; // Do nothing while session is loading
    }

    if (!session) {
      router.push("/login"); // Redirect to login if no session
    } else {
      setIsAuthenticated(true); // Set to true when user is authenticated
      // Set user form data
      setFormData((prevData) => ({
        ...prevData,
        email: session.user?.email || "",
        username: session.user?.name || "",
      }));
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // Loading state
  }

  if (!isAuthenticated || !session?.user?.name) {
    return null; // Prevent rendering while redirect is happening
  }

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend call to implement
    console.log("Updated Profile Data:", formData);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-semibold mb-8">
        Update Profile Information
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6"
      >
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-300"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-300"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            //onChange={handleInputChange}
            className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Tell us about yourself"
            rows={4}
          ></textarea>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-300"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter your location"
          />
        </div>

        <div>
          <label
            htmlFor="birthdate"
            className="block text-sm font-medium text-gray-300"
          >
            Birthdate
          </label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleInputChange}
            className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
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
    </main>
  );
};

export default ProfileInfoPage;

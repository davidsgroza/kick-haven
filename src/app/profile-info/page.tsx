"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const ProfileInfoPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form for profile information
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    birthdate: "",
    email: "",
    username: "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);

      // Fetch the user's profile info from the API
      const fetchUserProfile = async () => {
        // Ensure session is loaded and user exists
        if (!session || !session.user) {
          setError("User not authenticated.");
          return;
        }

        try {
          const response = await fetch("/api/profile-info", {
            method: "GET",
            headers: {
              // Assuming session.user.name is being passed, or if you're using email, pass session.user.email
              Authorization: `Bearer ${session.user.name || ""}`, // Adjust as per your session object
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch profile data.");
          }

          const data = await response.json();
          setFormData({
            bio: data.bio || "",
            location: data.location || "",
            birthdate: data.birthdate || "",
            email: data.email || "",
            username: data.username || "",
          });
        } catch (err) {
          console.error(err);
          setError("Failed to load user profile data.");
        }
      };

      fetchUserProfile();
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setError(null);

    // Ensure session exists before submitting
    if (!session?.user) {
      setError("User session is not available.");
      return;
    }

    // Prepare data for submission
    const updatedData = {
      ...formData,
      currentUsername: session.user?.name || "", // Safely access session username
    };
    console.log(updatedData); // Log the data being sent to the backend

    try {
      const response = await fetch("/api/profile-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(errorMessage || "Something went wrong");
        return;
      }

      alert("Profile updated successfully");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      <div className="w-full max-w-4xl flex gap-8">
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold mb-8">Profile Information</h1>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-6 rounded-lg space-y-6"
          >
            {/* Display error message if error exists */}
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            {/* Username */}
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

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                E-Mail
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

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-300"
              >
                About You
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 p-3 w-full bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Tell us about yourself"
                rows={4}
              ></textarea>
            </div>

            {/* Location */}
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
                placeholder="Where are you from?"
              />
            </div>

            {/* Birthdate */}
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

            <div className="mt-6">
              <button
                type="submit"
                className="w-full p-3 bg-blue-500 rounded-md text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </main>
  );
};

export default ProfileInfoPage;

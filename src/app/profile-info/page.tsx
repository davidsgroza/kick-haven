"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const ProfileInfoPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form state for profile information
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    birthdate: "",
    email: "",
    username: session?.user?.name || "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      setFormData((prevData) => ({
        ...prevData,
        email: session.user?.email || "",
        username: session.user?.name || "",
      }));
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !session?.user?.name) {
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

    // Validate form data if needed (e.g., validate email format)
    if (!formData.username || !formData.email) {
      setError("Please fill out all required fields.");
      return;
    }

    setError(null);

    // TO DO: Handle form submission (e.g., send data to API)

    console.log("Updated Profile Data:", formData);

    // Simulate success after submission
    setTimeout(() => {
      alert("Profile updated successfully!");
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      {/* Main content */}
      <div className="w-full max-w-4xl flex gap-8">
        {/* Left side (Main Content) */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold mb-8">Profile Information</h1>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-6 rounded-lg space-y-6"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}

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
        </div>

        {/* Right side (Sidebar) */}
        <Sidebar />
      </div>
    </main>
  );
};

export default ProfileInfoPage;

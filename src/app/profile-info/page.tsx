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
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track if the form is being submitted
  const [originalData, setOriginalData] = useState({
    bio: "",
    location: "",
    birthdate: "",
    email: "",
  });

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
          });
          setOriginalData(data); // Save the original data for comparison
        } catch (err) {
          console.error(err);
          setError("Failed to load user profile data.");
        }
      };

      fetchUserProfile();
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center mt-10">
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
    );
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
    setIsSubmitting(true); // Set submitting state to true

    // Ensure session exists before submitting
    if (!session?.user) {
      setError("User session is not available.");
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    // Prepare data for submission. Only send fields that have changed
    const updatedData: { [key: string]: unknown } = {
      currentUsername: session.user?.name || "",
    };

    // Compare formData with originalData and only send changed fields
    if (formData.email !== originalData.email) {
      updatedData.email = formData.email;
    }
    if (formData.bio !== originalData.bio) {
      updatedData.bio = formData.bio;
    }
    if (formData.location !== originalData.location) {
      updatedData.location = formData.location;
    }
    if (formData.birthdate !== originalData.birthdate) {
      updatedData.birthdate = formData.birthdate;
    }

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
        setIsSubmitting(false); // Reset submitting state
        return;
      }

      alert("Profile updated successfully");
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      setIsSubmitting(false); // Reset submitting state
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

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full p-3 bg-blue-500 rounded-md text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting} // Disable button while submitting
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center">
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
                  "Save Changes"
                )}
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

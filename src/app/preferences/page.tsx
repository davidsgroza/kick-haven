"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar"; // Import Sidebar component

const PreferencesPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Sample preferences (placeholder settings)
  const [preferences, setPreferences] = useState({
    emailPublic: false,
    allowMessages: true,
    emailNotifications: true,
  });

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

  // Handle toggling of preferences
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences((prevPreferences) => ({
      ...prevPreferences,
      [name]: checked,
    }));
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex justify-center py-10">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Left side (Main Content) */}
        <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold mb-8">Preferences</h1>

          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>

            <div className="space-y-4">
              {/* Email Visibility Preference */}
              <div className="flex items-center justify-between">
                <label htmlFor="emailPublic" className="text-gray-200">
                  Make my email public
                </label>
                <input
                  type="checkbox"
                  id="emailPublic"
                  name="emailPublic"
                  checked={preferences.emailPublic}
                  onChange={handleChange}
                  className="w-6 h-6 bg-gray-700 border-gray-600 rounded-md"
                />
              </div>

              {/* Allow Messages Preference */}
              <div className="flex items-center justify-between">
                <label htmlFor="allowMessages" className="text-gray-200">
                  Allow others to message me
                </label>
                <input
                  type="checkbox"
                  id="allowMessages"
                  name="allowMessages"
                  checked={preferences.allowMessages}
                  onChange={handleChange}
                  className="w-6 h-6 bg-gray-700 border-gray-600 rounded-md"
                />
              </div>

              {/* Email Notifications Preference */}
              <div className="flex items-center justify-between">
                <label htmlFor="emailNotifications" className="text-gray-200">
                  Receive email notifications
                </label>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={preferences.emailNotifications}
                  onChange={handleChange}
                  className="w-6 h-6 bg-gray-700 border-gray-600 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side (Sidebar) */}
        <Sidebar />
      </div>
    </main>
  );
};

export default PreferencesPage;

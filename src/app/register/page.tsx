"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

/**
 * Page for registering a new user.
 *
 * This page contains a form with input fields for the user's username, email,
 * email confirmation, password, password confirmation, and a checkbox for
 * agreeing to the terms and conditions.
 *
 * When the form is submitted, it sends a POST request to the `/api/register`
 * endpoint with the form data. If the request is successful, it redirects to
 * the homepage. If there are any errors, it displays them below the form.
 */
const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailConfirmError, setEmailConfirmError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [termsAndConditionsError, setTermsAndConditionsError] = useState("");
  const router = useRouter();

  interface FormErrors {
    username?: string;
    email?: string;
    emailConfirm?: string;
    password?: string;
    passwordConfirm?: string;
    termsAndConditions?: string;
  }

  /**
   * Validates the form data and returns an object with any errors.
   *
   * If any of the input fields contain invalid data, the corresponding key
   * in the returned object will contain an error message. If all the input
   * fields are valid, the returned object will be empty.
   */
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (username.length < 5 || username.length > 20) {
      errors.username = "Username must be between 5 and 20 characters";
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      errors.email =
        "Email address must be in the format 'example@example.com'";
    }

    if (email !== emailConfirm) {
      errors.emailConfirm = "Email and email confirm do not match";
    }

    if (password.length < 8 || password.length > 64) {
      errors.password = "Password must be between 8 and 64 characters";
    }

    if (password !== passwordConfirm) {
      errors.passwordConfirm = "Password and password confirm do not match";
    }

    if (!termsAndConditions) {
      errors.termsAndConditions = "You must accept the terms and conditions";
    }

    return errors;
  };

  /**
   * Handles the submission of the registration form.
   *
   * Validates the form data, and if it is valid, sends a POST request to
   * the /api/register API endpoint with the form data. If the request is
   * successful, displays a popup message and redirects to the homepage.
   * If the request is not successful, displays an error popup message.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form event
   */
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setUsernameError(errors.username || "");
      setEmailError(errors.email || "");
      setEmailConfirmError(errors.emailConfirm || "");
      setPasswordError(errors.password || "");
      setPasswordConfirmError(errors.passwordConfirm || "");
      setTermsAndConditionsError(errors.termsAndConditions || "");
      return;
    }

    try {
      console.log("Submitting registration form");

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          emailConfirm,
          password,
          passwordConfirm,
          termsAndConditions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Automatically log the user in after registration
        const signInResponse = await signIn("credentials", {
          redirect: false,
          username,
          password,
        });

        if (signInResponse?.ok) {
          router.push("/"); // Redirect to the homepage after successful sign-in
        } else {
          alert("Sign-in after registration failed.");
        }
      } else {
        alert(data.message); // Display the error message
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 w-full max-w-xl"
      >
        <h1 className="text-2xl font-semibold">Register Account</h1>
        <p className="text-gray-200 mb-4">
          If you already have an account with us, please login at the{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-600">
            login page
          </Link>
          .
        </p>
        <hr className="border-gray-600 my-4" />

        <div className="mb-4">
          <div className="flex justify-between">
            <label className="block text-gray-200 w-1/4" htmlFor="username">
              Username:
            </label>
            <input
              type="text"
              placeholder="Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`bg-gray-700 text-gray-200 w-3/4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                usernameError ? "border-red-500" : ""
              }`}
            />
          </div>
          <div className="flex justify-stretch">
            {usernameError && <p className="text-red-500">{usernameError}</p>}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between">
            <label className="block text-gray-200" htmlFor="email">
              E-Mail:
            </label>
            <input
              type="email"
              placeholder="E-Mail"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-gray-700 text-gray-200 w-3/4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                emailError ? "border-red-500" : ""
              }`}
            />
          </div>
          <div className="flex justify-stretch">
            {emailError && <p className="text-red-500">{emailError}</p>}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between">
            <label className="block text-gray-200" htmlFor="emailConfirm">
              E-Mail Confirm:
            </label>
            <input
              type="email"
              placeholder="E-Mail Confirm"
              id="emailConfirm"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              className={`bg-gray-700 text-gray-200 w-3/4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                emailConfirmError ? "border-red-500" : ""
              }`}
            />
          </div>
          <div className="flex justify-stretch">
            {emailConfirmError && (
              <p className="text-red-500">{emailConfirmError}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between">
            <label className="block text-gray-200" htmlFor="password">
              Password:
            </label>
            <input
              type="password"
              placeholder="Password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`bg-gray-700 text-gray-200 w-3/4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                passwordError ? "border-red-500" : ""
              }`}
            />
          </div>
          <div className="flex justify-stretch">
            {passwordError && <p className="text-red-500">{passwordError}</p>}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between">
            <label className="block text-gray-200" htmlFor="passwordConfirm">
              Password Confirm:
            </label>
            <input
              type="password"
              placeholder="Password Confirm"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={`bg-gray-700 text-gray-200 w-3/4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                passwordConfirmError ? "border-red-500" : ""
              }`}
            />
          </div>
          <div className="flex justify-stretch">
            {passwordConfirmError && (
              <p className="text-red-500">{passwordConfirmError}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <hr className="border-gray-600 my-4" />
          <div className="flex justify-between">
            <label className="block text-gray-200">
              <input
                type="checkbox"
                checked={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.checked)}
                className="mr-2"
              />
              I have read and agree to the{" "}
              <Link
                href="/terms-and-conditions"
                className="text-blue-400 hover:text-blue-600"
              >
                Terms and Conditions
              </Link>
            </label>
          </div>
          {termsAndConditionsError && (
            <p className="text-red-500">{termsAndConditionsError}</p>
          )}
        </div>

        <hr className="border-gray-600 my-4" />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 rounded-lg hover:bg-blue-700 active:bg-blue-900 transition duration-200"
        >
          Register
        </button>
      </form>
    </main>
  );
};

export default RegisterPage;

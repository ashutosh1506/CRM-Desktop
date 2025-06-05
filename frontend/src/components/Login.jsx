import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import React from "react";

export default function Login() {
  const { user, login } = useAuth();
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          // Use FedCM for authentication
          use_fedcm: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: 300,
            type: "standard",
          }
        );

        // Don't call prompt() method directly to avoid deprecated behavior
        // Let the button click handle the authentication flow
      } catch (err) {
        console.error("Google Sign-In initialization error:", err);
        setAuthError("Failed to initialize Google Sign-In");
      }
    };

    return () => {
      // Clean up properly
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credential: response.credential }),
        }
      );

      const data = await res.json();

      if (data.token) {
        await login(data.token);
        toast.success("Login successful!");
      } else {
        toast.error("Login failed");
        setAuthError("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Login failed");
      setAuthError("Authentication error. Please try again later.");
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Xeno CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your customer relationship management platform
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {authError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Authentication Error
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{authError}</p>
                    <p className="mt-1">
                      If you're seeing issues with Google Sign-In, please make
                      sure third-party cookies are enabled in your browser
                      settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center">
            <div id="google-signin-button" className="mb-4"></div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Click the button above to sign in with your Google account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

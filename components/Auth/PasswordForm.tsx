"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";

export default function PasswordForm({
  username,
  secureWord,
  onSuccess,
}: {
  username: string;
  secureWord: string;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Client-side password hashing
      const hashedPassword = CryptoJS.SHA256(password).toString();

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, hashedPassword, secureWord }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error data:", errorData);
        
        // Check if it's a secure word error
        if (errorData.code === "SECURE_WORD_INVALID") {
          console.log("Secure word invalid - redirecting to login");
          
          // Clear session storage and redirect to login
          sessionStorage.removeItem("mfa-username");
          sessionStorage.removeItem(`mfa-attempts-${username}`);
          
          // Show error message briefly before redirecting
          setError(errorData.error);
          
          // Try immediate redirect first
          router.push("/login");
          
          // Also try with window.location as backup
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
          
          return;
        }
        
        throw new Error(errorData.error || "Login failed");
      }

      onSuccess();
    } catch (err) {
      console.log("Error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Enter Password</h2>
      
      {/* Debug section */}
      {/* <div className="text-xs text-gray-500 space-y-1">
        <p>Username: {username}</p>
        <p>Secure Word: {secureWord}</p>
        <button 
          type="button"
          onClick={async () => {
            try {
              const response = await fetch("/api/test/clearSecureWord", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
              });
              console.log("Secure word cleared:", await response.json());
            } catch (err) {
              console.log("Error clearing secure word:", err);
            }
          }}
          className="text-blue-600 underline"
        >
          Test: Clear Secure Word
        </button>
      </div>
       */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
          {error.includes("secure word") && (
            <p className="mt-1 text-xs">Redirecting to login page...</p>
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
}

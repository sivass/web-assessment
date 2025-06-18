// components/Auth/MFACode.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MFAAttemptsWidget from "./MFAAttemptsWidget";

export default function MFACode({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get username from session storage
    const storedUsername = sessionStorage.getItem("mfa-username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verifyMfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, username }),
      });

      if (response.status === 403) {
        console.log("Account locked - redirecting to login");
        // Account locked - redirect to login page
        sessionStorage.removeItem("mfa-username");
        sessionStorage.removeItem(`mfa-attempts-${username}`);
        window.dispatchEvent(new Event("mfa-attempts-updated"));
        router.push("/");
        return;
      }

      if (!response.ok) {
        // Track failed attempt
        const currentAttempts = parseInt(
          sessionStorage.getItem(`mfa-attempts-${username}`) || "0"
        );
        const newAttempts = currentAttempts + 1;
        sessionStorage.setItem(
          `mfa-attempts-${username}`,
          newAttempts.toString()
        );

        // Trigger custom event to update widget
        window.dispatchEvent(new Event("mfa-attempts-updated"));

        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid code");
      }

      // Clear attempts on success
      sessionStorage.removeItem(`mfa-attempts-${username}`);
      window.dispatchEvent(new Event("mfa-attempts-updated"));
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">MFA Verification</h2>
      {username && <MFAAttemptsWidget username={username} />}

      {/* Debug info */}
      <div className="text-xs text-gray-500">
        <p>Username: {username}</p>
        <p>
          Current attempts:{" "}
          {sessionStorage.getItem(`mfa-attempts-${username}`) || "0"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="mfa-code"
            className="block text-sm font-medium text-gray-700"
          >
            6-digit verification code
          </label>
          <input
            id="mfa-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            pattern="\d{6}"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Use demo code: <span className="font-mono">123456</span>
          </p>
        </div>
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
      </form>
    </div>
  );
}

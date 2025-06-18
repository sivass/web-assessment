"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MFAPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get username from session storage or URL params
    const storedUsername = sessionStorage.getItem("mfa-username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // If no username, redirect to login
      router.push("/login");
    }
  }, [router]);

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

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.status === 403) {
        console.log("Account locked - redirecting to login");
        // Account locked - redirect to login page
        sessionStorage.removeItem("mfa-username");
        router.push("/");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error data:", errorData);
        throw new Error(errorData.error || "Invalid code");
      }

      // Clear session storage
      sessionStorage.removeItem("mfa-username");
      
      // Force a page refresh to update the navbar state
      window.location.href = "/dashboard";
    } catch (err) {
      console.log("Error:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!username) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg shadow">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">MFA Verification</h2>
      <p className="text-sm text-gray-600 mb-4">Verifying for user: {username}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="w-full p-2 border rounded"
          pattern="\d{6}"
          required
        />
        <p className="text-sm text-gray-600">Use code: 123456</p>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}

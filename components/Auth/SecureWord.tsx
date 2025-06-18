"use client";
import { useEffect, useState } from "react";

export default function SecureWord({
  secureWord,
  onNext,
}: {
  secureWord: string;
  onNext: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Secure Word</h2>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xl font-mono text-center font-bold text-blue-600">
          {secureWord}
        </p>
        <p
          className={`text-sm text-center mt-2 ${
            timeLeft < 15 ? "text-red-500" : "text-gray-600"
          }`}
        >
          Expires in {timeLeft} seconds
        </p>
      </div>
      <button
        onClick={onNext}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Continue to Password
      </button>
    </div>
  );
}

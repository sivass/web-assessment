"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Lock } from "lucide-react";

interface MFAAttemptsWidgetProps {
  username: string;
}

export default function MFAAttemptsWidget({ username }: MFAAttemptsWidgetProps) {
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const updateAttempts = () => {
    // Get attempts from session storage
    const storedAttempts = sessionStorage.getItem(`mfa-attempts-${username}`);
    if (storedAttempts) {
      const attemptCount = parseInt(storedAttempts);
      setAttempts(attemptCount);
      setIsLocked(attemptCount >= 3);
    } else {
      setAttempts(0);
      setIsLocked(false);
    }
  };

  useEffect(() => {
    updateAttempts();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `mfa-attempts-${username}`) {
        updateAttempts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    const handleCustomStorageChange = () => {
      updateAttempts();
    };

    window.addEventListener('mfa-attempts-updated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mfa-attempts-updated', handleCustomStorageChange);
    };
  }, [username]);

  const remainingAttempts = Math.max(0, 3 - attempts);

  if (isLocked) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <Lock className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Account Locked</h3>
            <p className="text-sm text-red-600">
              Too many failed attempts. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (attempts > 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Failed Attempts: {attempts}/3
            </h3>
            <p className="text-sm text-yellow-600">
              {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 
"use client";
import { useState, useEffect } from "react";
import UsernameForm from "@/components/Auth/UsernameForm";
import SecureWord from "@/components/Auth/SecureWord";
import PasswordForm from "@/components/Auth/PasswordForm";
import MFACode from "@/components/Auth/MFACode";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [session, setSession] = useState<{
    username: string;
    secureWord: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const token = getAuthToken();
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleUsernameSuccess = (username: string, secureWord: string) => {
    setSession({ username, secureWord });
    setStep(2);
  };

  const handlePasswordSuccess = () => {
    // Store username in session storage for MFA
    if (session?.username) {
      sessionStorage.setItem("mfa-username", session.username);
    }
    setStep(4);
  };

  const handleMFASuccess = () => {
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg shadow">
      {step === 1 && <UsernameForm onSuccess={handleUsernameSuccess} />}
      {step === 2 && session && (
        <SecureWord secureWord={session.secureWord} onNext={() => setStep(3)} />
      )}
      {step === 3 && session && (
        <PasswordForm
          username={session.username}
          secureWord={session.secureWord}
          onSuccess={handlePasswordSuccess}
        />
      )}
      {step === 4 && <MFACode onSuccess={handleMFASuccess} />}
    </div>
  );
}

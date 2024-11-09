"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supbaseClient";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Exchange the code in the URL for a session
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        setStatus("Verification failed. Please try again or sign in.");
      } else {
        setStatus("Email verified! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    };

    handleAuthRedirect();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
      <p className="text-center text-gray-600 mb-6">{status}</p>
      {status === "Verification failed. Please try again or sign in." && (
        <Button onClick={() => router.push("/auth")} className="bg-blue-500 text-white">
          Go to Sign In
        </Button>
      )}
    </div>
  );
}

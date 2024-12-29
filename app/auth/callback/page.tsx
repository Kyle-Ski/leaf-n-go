"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing...");
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1)); // Parse the hash fragment
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type"); // e.g., 'invite' or 'recovery'

      if (accessToken && refreshToken) {
        const { error } = await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error during authentication callback:", error);
          setStatus("Authentication failed. Please try again.");
        } else if (type === "recovery") {
          setShowResetForm(true); // Show the password reset form
          setStatus("Please reset your password.");
        } else if (type === "invite") {
          setStatus("Invite accepted! Redirecting...");
          setTimeout(() => router.push("/welcome"), 2000);
        } else {
          setStatus("Unknown action. Redirecting...");
          setTimeout(() => router.push("/"), 2000);
        }
      } else {
        setStatus("Invalid or missing authentication tokens.");
      }
    };

    handleAuthRedirect();
  }, [router]);

  const handlePasswordReset = async () => {
    if (!newPassword) {
      setStatus("Please enter a new password.");
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error resetting password:", error);
      setStatus("Password reset failed. Please try again.");
    } else {
      setStatus("Password updated successfully! Redirecting to sign in...");
      setTimeout(() => router.push("/auth"), 2000);
    }
  };
//diff
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-semibold mb-4">Authentication</h1>
      <p className="text-center text-gray-600 mb-6">{status}</p>

      {showResetForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordReset();
          }}
          className="flex flex-col space-y-4 w-full max-w-md"
        >
          <input
            type="password"
            placeholder="New Password"
            className="p-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" className="bg-blue-500 text-white">
            Reset Password
          </Button>
        </form>
      )}

      {status === "Authentication failed. Please try again." && (
        <Button onClick={() => router.push("/auth")} className="bg-blue-500 text-white">
          Go to Sign In
        </Button>
      )}
    </div>
  );
}

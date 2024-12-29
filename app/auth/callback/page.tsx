"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import clsx from "clsx";
import passwordRequirements, { PasswordRequirement } from "@/utils/auth/validateNewPassowrd";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing...");
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  
  // State to track which password requirements are met
  const [passwordValidations, setPasswordValidations] = useState<Record<string, boolean>>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });
  
  // Determine if the password is valid (all requirements met)
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

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

  // Update password validations whenever the newPassword changes
  useEffect(() => {
    const validations: Record<string, boolean> = {};
    passwordRequirements.forEach((req: PasswordRequirement) => {
      validations[req.id] = req.test(newPassword);
    });
    setPasswordValidations(validations);
  }, [newPassword]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setStatus("Please ensure all password requirements are met.");
      return;
    }

    setStatus("Updating password...");

    try {
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
    } catch (err) {
      console.error("Unexpected error during password reset:", err);
      setStatus("An unexpected error occurred. Please try again.");
    }
  };

  // Calculate password strength based on the number of requirements met
  const passwordStrength = Object.values(passwordValidations).filter(Boolean).length;

  // Define strength labels and colors
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  // Determine the label and color based on strength
  const strengthLabel = strengthLabels[passwordStrength] || "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-semibold mb-4">Authentication</h1>
      <p className="text-center text-gray-600 mb-6">{status}</p>

      {showResetForm && (
        <form
          onSubmit={handlePasswordReset}
          className="flex flex-col space-y-4 w-full max-w-md"
        >
          {/* New Password Input */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="p-2 border rounded w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="mt-2 space-y-1">
            {passwordRequirements.map((req: PasswordRequirement) => (
              <div key={req.id} className="flex items-center">
                {passwordValidations[req.id] ? (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XIcon className="h-5 w-5 text-red-500" />
                )}
                <span
                  className={`ml-2 text-sm ${
                    passwordValidations[req.id] ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Password Strength</label>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div
                  className={clsx(
                    "h-2.5 rounded-full",
                    {
                      "bg-red-500": passwordStrength <= 1,
                      "bg-orange-500": passwordStrength === 2,
                      "bg-yellow-500": passwordStrength === 3,
                      "bg-blue-500": passwordStrength === 4,
                      "bg-green-500": passwordStrength === 5,
                    }
                  )}
                  style={{ width: `${(passwordStrength / passwordRequirements.length) * 100}%` }}
                ></div>
              </div>
              <p
                className={clsx(
                  "mt-1 text-sm",
                  {
                    "text-red-700": passwordStrength <= 1,
                    "text-orange-700": passwordStrength === 2,
                    "text-yellow-700": passwordStrength === 3,
                    "text-blue-700": passwordStrength === 4,
                    "text-green-700": passwordStrength === 5,
                  }
                )}
              >
                {strengthLabel}
              </p>
            </div>
          )}

          {/* Reset Password Button */}
          <Button
            type="submit"
            className="bg-blue-500 text-white"
            disabled={!isPasswordValid}
          >
            Reset Password
          </Button>
        </form>
      )}

      {!showResetForm && (
        <>
          {status === "Authentication failed. Please try again." && (
            <Button onClick={() => router.push("/auth")} className="bg-blue-500 text-white">
              Go to Sign In
            </Button>
          )}
        </>
      )}
    </div>
  );
}

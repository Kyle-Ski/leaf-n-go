"use client";

import { useState } from "react";
import { supabase } from "@/lib/supbaseClient";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setConfirmationMessage("");

    if (isSignUp && !validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, include uppercase and lowercase letters, numbers, and symbols."
      );
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setConfirmationMessage("A confirmation email has been sent. Please check your inbox to verify your account.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center p-4 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h1>
      {confirmationMessage ? (
        <p className="text-green-600 text-center">{confirmationMessage}</p>
      ) : (
        <form onSubmit={handleAuth} className="flex flex-col space-y-4 w-full max-w-md">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="bg-blue-500 text-white">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
      )}
      <p className="mt-4 text-gray-600">
        {isSignUp ? "Already have an account?" : "Don’t have an account?"}
        <span
          onClick={() => {
            setError("");
            setConfirmationMessage("");
            setIsSignUp(!isSignUp);
          }}
          className="text-blue-500 cursor-pointer ml-1"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </span>
      </p>
    </div>
  );
}

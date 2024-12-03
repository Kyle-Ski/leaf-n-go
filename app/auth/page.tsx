"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-Context";
import { useAppContext } from "@/lib/appContext";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth(); // Use setUser from AuthContext
  const { dispatch } = useAppContext(); // Use dispatch from AppContext

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Default to Sign In
  const [error, setError] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Check query parameters for mode
  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsSignUp(mode === "signup"); // Set isSignUp based on query param
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return (
      password.length >= 8 &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  };

  const fetchItems = async (userId: string) => {
    try {
      const response = await fetch("/api/items", {
        headers: {
          "x-user-id": userId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch items.");
      }

      const data = await response.json();
      dispatch({ type: "SET_ITEMS", payload: data }); // Save items to global state
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setConfirmationMessage("");
    setIsLoading(true); // Start loading

    if (isSignUp && !validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, include uppercase and lowercase letters, numbers, and symbols."
      );
      setIsLoading(false); // Stop loading
      return;
    }

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/signin";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
      } else if (isSignUp) {
        setConfirmationMessage(
          "Welcome new user! A confirmation email has been sent. Please check your inbox to verify your account."
        );
      } else {
        const { user } = await response.json();
        setUser(user); // Update user state in AuthContext

        // Fetch items after logging in
        await fetchItems(user.id);

        router.push("/"); // Redirect to homepage
      }
    } catch (err) {
      console.warn("error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center p-4 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h1>
      {isSignUp && (
        <p className="text-sm text-gray-600 mb-4">
          Welcome new user! Create an account to start planning your adventures.
        </p>
      )}
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-blue-500">Processing...</p>
        </div>
      ) : confirmationMessage ? (
        <p className="text-green-600 text-center">{confirmationMessage}</p>
      ) : (
        <form
          onSubmit={handleAuth}
          className={`flex flex-col space-y-4 w-full max-w-md transition-opacity ${
            isLoading ? "opacity-50" : "opacity-100"
          }`}
        >
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
      {!isLoading && (
        <p className="mt-4 text-gray-600">
          {isSignUp ? "Already have an account?" : `Don't have an account?`}
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
      )}
    </div>
  );
}

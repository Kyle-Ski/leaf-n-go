"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-Context";
import { useAppContext } from "@/lib/appContext";
import { UserSettings } from "@/types/projectTypes";
import ConsentModal from "@/components/consentModal";
import { useConsent } from "@/lib/consentContext";
import { toast } from "react-toastify";
import passwordRequirements from "@/utils/auth/validateNewPassowrd";
import { CheckIcon, XIcon } from "lucide-react";
import clsx from "clsx";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth(); // Use setUser from AuthContext
  const { dispatch } = useAppContext(); // Use dispatch from AppContext
  const { consent } = useConsent();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Default to Sign In
  const [error, setError] = useState<string | null>("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(!consent.cookies.functional && !consent.aiDataUsage);
  const [passwordValidations, setPasswordValidations] = useState<Record<string, boolean>>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  const showErrorToast = (error: string | null) => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000, // Adjust as needed
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  // Example usage in your component
  useEffect(() => {
    if (error) {
      showErrorToast(error);
      setError(null); // Clear the error after displaying
    }
  }, [error]);

  // Determine if consent modal should be shown
  useEffect(() => {
    // Show modal if user hasn't set functional, analytics, or aiDataUsage preferences
    const shouldShowConsent =
      !consent.cookies.functional &&
      !consent.cookies.analytics &&
      !consent.aiDataUsage;
    setIsConsentModalOpen(shouldShowConsent);
  }, [consent]);

  // Check query parameters for mode
  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsSignUp(mode === "signup"); // Set isSignUp based on query param
  }, [searchParams]);

  useEffect(() => {
    const validations: Record<string, boolean> = {};
    passwordRequirements.forEach((req) => {
      validations[req.id] = req.test(password);
    });
    setPasswordValidations(validations);
  }, [password]);

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const validatePassword = () => {
    return isPasswordValid;
  };

  const fetchUserSettings = async () => {
    try {
      const response = await fetch(`/api/user-settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch user settings');
      }
      const data: UserSettings = await response.json();

      // Dispatch the fetched user settings to the global state
      dispatch({ type: 'SET_USER_SETTINGS', payload: data });
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  const fetchTripTypes = async () => {
    try {
      const response = await fetch("api/trips/trip-categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trip categories.")
      }

      const data = await response.json();

      dispatch({ type: "SET_TRIP_CATEGORIES", payload: data })

    } catch (error) {
      console.error("Error fetching trip types:", error);
    }
  }

  const fetchChecklists = async () => {
    try {
      const response = await fetch("/api/checklists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch checklists");
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length === 0) {
        dispatch({ type: "SET_NO_CHECKLISTS_FOR_USER", payload: true })
        dispatch({ type: "SET_CHECKLISTS", payload: [] })
      } else if (data.length > 0) {
        dispatch({ type: "SET_CHECKLISTS", payload: data }); // Update global state with checklists
        dispatch({ type: "SET_NO_CHECKLISTS_FOR_USER", payload: false })
      } else {
        throw new Error("Checklist data is not formatted as expected.")
      }

    } catch (error) {
      console.error("Error fetching checklists:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch items.");
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length === 0) {
        dispatch({ type: "SET_NO_ITEMS_FOR_USER", payload: true })
        dispatch({ type: "SET_ITEMS", payload: [] });
      } else if (data.length > 0) {
        dispatch({ type: "SET_ITEMS", payload: data }); // Save items to global state
        dispatch({ type: "SET_NO_ITEMS_FOR_USER", payload: false })
      } else {
        throw new Error("Items is not formatted as expected")
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/item-categories", {
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch Item Categories")
      }

      const data = await response.json()
      dispatch({ type: "SET_CATEGORIES", payload: data })
    } catch (err) {
      console.error(err);
      setError("Unable to load item categories. Please try again later.");
    }
  }

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/trips", {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trips.");
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length === 0) {
        dispatch({ type: "SET_NO_TRIPS_FOR_USER", payload: true });
        dispatch({ type: "SET_TRIPS", payload: [] })
      } else {
        dispatch({ type: "SET_TRIPS", payload: data });
        dispatch({ type: "SET_NO_TRIPS_FOR_USER", payload: false });
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load trips. Please try again later.");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setConfirmationMessage("");
    setIsLoading(true); // Start loading

    if (isSignUp && !validatePassword()) {
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

        // Fetch items and checklists after logging in
        await fetchTrips()
        await fetchItems();
        await fetchChecklists()
        await fetchCategories()
        await fetchUserSettings()
        await fetchTripTypes();
        router.push("/"); // Redirect to homepage
      }
    } catch (err) {
      console.warn("error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
// Calculate password strength based on the number of requirements met
const passwordStrength = Object.values(passwordValidations).filter(Boolean).length;

// Define strength labels and colors
const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

// Determine the label and color based on strength
const strengthLabel = strengthLabels[passwordStrength] || "";

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
        className={`flex flex-col space-y-4 w-full max-w-md transition-opacity ${isLoading ? "opacity-50" : "opacity-100"
          }`}
      >
        {/* Email Input */}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        {/* Password Input */}
        <div className="relative">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Optional: Toggle Password Visibility */}
          {/* Implement if desired */}
        </div>
        
        {/* Password Requirements */}
        {isSignUp && (
          <div className="mt-2 space-y-1">
            {passwordRequirements.map((req) => (
              <div key={req.id} className="flex items-center">
                {passwordValidations[req.id] ? (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XIcon className="h-5 w-5 text-red-500" />
                )}
                <span className={`ml-2 text-sm ${passwordValidations[req.id] ? "text-green-700" : "text-gray-500"}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Password Strength Meter */}
        {isSignUp && password && (
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
        
        {/* Submit Button */}
        <Button type="submit" className="bg-blue-500 text-white" disabled={isSignUp && !isPasswordValid}>
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
    <ConsentModal isOpen={isConsentModalOpen} onClose={() => {
      setIsConsentModalOpen(false)
    }} />
  </div>
);
}
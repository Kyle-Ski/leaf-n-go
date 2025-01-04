"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConsentCategories, useConsent, defaultConsent } from "@/lib/consentContext"; // Import defaultConsent
import InfoBox from "./informationBox";

// Inline SVG for Checkmark
export const CheckMark = () => (
  <svg
    className="w-5 h-5 text-blue-500 ml-2"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const ConsentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { consent, updateConsent } = useConsent();
  const [localPreferences, setLocalPreferences] = useState<ConsentCategories>(consent);
  const [selectedPreset, setSelectedPreset] = useState<"full" | "functional" | "essential" | "custom" | null>(null);
  const [isSaveClicked, setIsSaveClicked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update localPreferences when consent changes
  useEffect(() => {
    setLocalPreferences(consent);
    // Determine if a preset matches the current preferences
    if (
      consent.cookies.functional &&
      consent.cookies.analytics &&
      consent.aiDataUsage
    ) {
      setSelectedPreset("full");
    } else if (
      consent.cookies.functional &&
      !consent.cookies.analytics &&
      !consent.aiDataUsage
    ) {
      setSelectedPreset("functional");
    } else if (
      !consent.cookies.functional &&
      !consent.cookies.analytics &&
      !consent.aiDataUsage
    ) {
      setSelectedPreset("essential");
    } else {
      setSelectedPreset("custom");
    }
  }, [consent]);

  // Handle toggling of consent options
  const handleToggle = (
    category: keyof ConsentCategories,
    key?: keyof ConsentCategories["cookies"]
  ) => {
    setLocalPreferences((prev) => {
      if (category === "cookies" && key) {
        return {
          ...prev,
          cookies: {
            ...prev.cookies,
            [key]: !prev.cookies[key],
          },
        };
      }
      return {
        ...prev,
        [category]: !prev[category],
      };
    });

    // If user modifies individual toggles, set preset to custom
    setSelectedPreset("custom");
  };

  // Preset Options Handlers
  const applyPreset = (preset: "full" | "functional" | "essential") => {
    let updatedConsent: ConsentCategories;

    switch (preset) {
      case "full":
        updatedConsent = {
          ...defaultConsent,
          cookies: {
            essential: true,
            functional: true,
            analytics: true,
          },
          aiDataUsage: true,
        };
        break;
      case "functional":
        updatedConsent = {
          ...defaultConsent,
          cookies: {
            essential: true,
            functional: true,
            analytics: false,
          },
          aiDataUsage: false,
        };
        break;
      case "essential":
        updatedConsent = {
          ...defaultConsent,
          cookies: {
            essential: true,
            functional: false,
            analytics: false,
          },
          aiDataUsage: false,
        };
        break;
      default:
        updatedConsent = defaultConsent;
    }

    setLocalPreferences(updatedConsent);
    setSelectedPreset(preset);
  };

  // Handle saving preferences
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Ensure localStorage is always true as it's required
      const updatedConsent = {
        ...localPreferences,
        localStorage: true,
      };
      await updateConsent(updatedConsent);
      setIsSaveClicked(true);
      onClose();
    } catch (err) {
      console.error("Error saving consent preferences:", err);
      setError("There was an issue saving your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancelling (saving default preferences)
  const handleCancel = () => {
    updateConsent(defaultConsent);
    setIsSaveClicked(false);
    onClose();
  };

  // Handle modal open state changes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      if (!isSaveClicked) {
        // User closed the modal without saving, save defaultConsent
        updateConsent(defaultConsent);
      }
      setIsSaveClicked(false); // Reset flag for next time
      setError(null); // Clear any existing errors
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleDialogChange}
    // Removed initialFocus ref as per user request
    >
      {/* Conditionally Render Overlay and Modal Content */}
      {isOpen && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"></div>

          {/* Modal Content with Fade-in/Fade-out */}
          <div
            className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            aria-modal="true"
            role="dialog"
          >
            <DialogContent className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 overflow-y-auto max-h-full">
              <DialogHeader>
                <DialogTitle>Welcome to Leaf-N-Go!</DialogTitle>
                <DialogDescription>
                  Hello!! Welcome to Leaf-N-Go! Let&apos;s get to helping you plan for your next adventure. Before we can do that, we need to make sure you&apos;re okay with these settings.
                </DialogDescription>
              </DialogHeader>

              {/* Preset Sliders Section */}
              <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Quick Preferences</h3>
                <div className="flex flex-col space-y-2">
                  {/* Full Use */}
                  <button
                    type="button"
                    onClick={() => applyPreset("full")}
                    className={`text-left flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${selectedPreset === "full" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"
                      } hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    aria-pressed={selectedPreset === "full"}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Yes! I&apos;d like to use the app to the fullest
                      </span>
                      <span className="text-sm text-gray-600">
                        Enable all cookies and AI data usage for the best experience.
                      </span>
                    </div>
                    {selectedPreset === "full" && <CheckMark />}
                  </button>

                  {/* Functional Only */}
                  <button
                    type="button"
                    onClick={() => applyPreset("functional")}
                    className={`text-left flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${selectedPreset === "functional" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"
                      } hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    aria-pressed={selectedPreset === "functional"}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        I&apos;d like to use all the functions, but don&apos;t track me
                      </span>
                      <span className="text-sm text-gray-600">
                        Enable functional cookies but disable analytics and AI data usage.
                      </span>
                    </div>
                    {selectedPreset === "functional" && <CheckMark />}
                  </button>

                  {/* Essential Only */}
                  <button
                    type="button"
                    onClick={() => applyPreset("essential")}
                    className={`text-left flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${selectedPreset === "essential" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"
                      } hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    aria-pressed={selectedPreset === "essential"}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        I&apos;m cautious about privacy
                      </span>
                      <span className="text-sm text-gray-600">
                        Enable only essential cookies and disable functional, analytics, and AI data usage.
                      </span>
                    </div>
                    {selectedPreset === "essential" && <CheckMark />}
                  </button>
                </div>
              </div>

              <InfoBox message={`NOTE: We do not use analytics in the app as of Jan 2025. This is just a placeholder.`} />

              {/* Divider */}
              <div className="my-6 border-t border-gray-200"></div>

              {/* Individual Preferences */}
              <div className="space-y-4">
                {/* Essential Cookies (Non-Toggleable) */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="mr-2"
                      aria-disabled="true"
                      aria-label="Essential Cookies"
                    />
                    <span className="font-medium">Essential Cookies</span>
                  </div>
                  <span className="ml-6 text-sm text-gray-600">
                    These cookies are necessary for the app to function properly and cannot be disabled.
                  </span>
                </div>

                {/* Functional Cookies */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localPreferences.cookies.functional}
                      onChange={() =>
                        handleToggle("cookies", "functional")
                      }
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-checked={localPreferences.cookies.functional}
                      aria-label="Enable Functional Cookies"
                    />
                    <span className="font-medium">Enable Functional Cookies</span>
                  </div>
                  <span className="ml-6 text-sm text-gray-600">
                    These cookies allow the app to remember your preferences and settings.
                  </span>
                </div>

                {/* Analytics Cookies */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localPreferences.cookies.analytics}
                      onChange={() => handleToggle("cookies", "analytics")}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-checked={localPreferences.cookies.analytics}
                      aria-label="Enable Analytics Cookies"
                    />
                    <span className="font-medium">Enable Analytics Cookies</span>
                  </div>
                  <span className="ml-6 text-sm text-gray-600">
                    These cookies help us understand how you use the app, allowing us to improve your experience.
                  </span>
                </div>

                {/* AI Data Usage */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localPreferences.aiDataUsage}
                      onChange={() => handleToggle("aiDataUsage")}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-checked={localPreferences.aiDataUsage}
                      aria-label="Allow AI Data Usage"
                    />
                    <span className="font-medium">Allow AI Data Usage</span>
                  </div>
                  <span className="ml-6 text-sm text-gray-600">
                    We use your data to provide personalized packing insights and recommendations.
                  </span>
                </div>

                {/* Local Storage Permission (Non-Toggleable) */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="mr-2"
                      aria-disabled="true"
                      aria-label="Allow Local Storage"
                    />
                    <span className="font-medium">Allow Local Storage</span>
                  </div>
                  <span className="ml-6 text-sm text-gray-600">
                    This application requires the use of local storage to function correctly.
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                <Button
                  onClick={handleSave}
                  className="bg-blue-500 text-white flex items-center justify-center disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving && (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  )}
                  Save Preferences
                </Button>
                <Button
                  onClick={handleCancel}
                  className="bg-gray-300 text-black flex items-center justify-center disabled:opacity-50"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </div>
        </>
      )}
    </Dialog>
  );
};

export default ConsentModal;

"use client"

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConsentCategories, useConsent } from "@/lib/consentContext";

const ConsentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { consent, updateConsent } = useConsent();
  const [localPreferences, setLocalPreferences] = useState(consent);

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
  };

  const handleSave = () => {
    updateConsent(localPreferences);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Privacy Preferences</DialogTitle>
          <DialogDescription>
            Please select your privacy preferences. You can update these at any
            time in the settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Essential Cookies Explanation */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="mr-2"
              />
              <span className="font-medium">Essential Cookies</span>
            </div>
            <span className="ml-6 text-sm text-gray-600">
              These cookies are necessary for the app to function properly and
              cannot be disabled.
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
                className="mr-2"
              />
              <span className="font-medium">Enable Functional Cookies</span>
            </div>
            <span className="ml-6 text-sm text-gray-600">
              These cookies allow the app to remember your preferences and
              settings.
            </span>
          </div>

          {/* Analytics Cookies */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={localPreferences.cookies.analytics}
                onChange={() => handleToggle("cookies", "analytics")}
                className="mr-2"
              />
              <span className="font-medium">Enable Analytics Cookies</span>
            </div>
            <span className="ml-6 text-sm text-gray-600">
              These cookies help us understand how you use the app, allowing us
              to improve your experience.
            </span>
          </div>

          {/* AI Data Usage */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={localPreferences.aiDataUsage}
                onChange={() => handleToggle("aiDataUsage")}
                className="mr-2"
              />
              <span className="font-medium">Allow AI Data Usage</span>
            </div>
            <span className="ml-6 text-sm text-gray-600">
              We use your data to provide personalized packing insights and
              recommendations.
            </span>
          </div>
        </div>
        <div className="flex space-x-4 mt-4">
          <Button onClick={handleSave} className="bg-blue-500 text-white">
            Save Preferences
          </Button>
          <Button onClick={onClose} className="bg-gray-300 text-black">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentModal;

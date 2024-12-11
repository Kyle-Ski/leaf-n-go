"use client";

import { withAuth } from "@/lib/withAuth";
import { useAuth } from "@/lib/auth-Context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/appContext";
import { UserSettings } from "@/types/projectTypes";
import { Loader } from "@/components/ui/loader"; // Ensure Loader is imported
import { ConsentCategories, useConsent, defaultConsent } from "@/lib/consentContext";

interface UpdateUserSettingAction {
  type: "UPDATE_USER_SETTING";
  payload: {
    key: keyof UserSettings;
    value: UserSettings[keyof UserSettings];
  };
}

// Assuming you have an action creator, otherwise define it inline
const updateUserSetting = (payload: { key: keyof UserSettings; value: UserSettings[keyof UserSettings] }): UpdateUserSettingAction => ({
  type: "UPDATE_USER_SETTING",
  payload,
});

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { dispatch } = useAppContext();
  const { consent, updateConsent } = useConsent();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updatedName, setUpdatedName] = useState(user?.user_metadata?.name || "");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updatedEmail, setUpdatedEmail] = useState(user?.email || "");
  const [localConsent, setLocalConsent] = useState<ConsentCategories>(consent);
  const [selectedPreset, setSelectedPreset] = useState<"full" | "functional" | "essential" | "custom" | null>(null);
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [saveSuccessConsent, setSaveSuccessConsent] = useState(false);
  const [errorConsent, setErrorConsent] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [preferredWeight, setPreferredWeight] = useState<"kg" | "lbs">(user?.user_metadata?.preferred_weight || "lbs");

  // Appearance Settings
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [saveSuccessAppearance, setSaveSuccessAppearance] = useState(false);

  // Notifications Settings
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [saveSuccessNotifications, setSaveSuccessNotifications] = useState(false);

  // Preferred Weight Unit
  const [isSavingWeightUnit, setIsSavingWeightUnit] = useState(false);
  const [saveSuccessWeightUnit, setSaveSuccessWeightUnit] = useState(false);

  // Profile Information
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessProfile, setSaveSuccessProfile] = useState(false);

  // Track changed fields using a partial UserSettings type
  const [changedFields, setChangedFields] = useState<Partial<UserSettings>>({});

  // Fetch user settings from the database when the component mounts
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/user-settings?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user settings');
        }
        const data: UserSettings = await response.json();
        setDarkMode(data.dark_mode);
        setEmailNotifications(data.email_notifications);
        setPushNotifications(data.push_notifications);
        setPreferredWeight(data.weight_unit);
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };

    fetchUserSettings();
  }, [user]);

  useEffect(() => {
    setLocalConsent(consent);
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

  const handleConsentToggle = (
    category: keyof ConsentCategories,
    key?: keyof ConsentCategories["cookies"]
  ) => {
    setLocalConsent((prev) => {
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

  const applyConsentPreset = (preset: "full" | "functional" | "essential") => {
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

    setLocalConsent(updatedConsent);
    setSelectedPreset(preset);
  };

  // Handle individual field changes and track changed fields
  const handleFieldChange = (key: keyof UserSettings, value: UserSettings[keyof UserSettings]) => {
    // Update local state
    switch (key) {
      case "dark_mode":
        setDarkMode(value as boolean);
        break;
      case "email_notifications":
        setEmailNotifications(value as boolean);
        break;
      case "push_notifications":
        setPushNotifications(value as boolean);
        break;
      case "weight_unit":
        setPreferredWeight(value as "kg" | "lbs");
        break;
      // case "name":
      //   setUpdatedName(value as string);
      //   break;
      // case "email":
      //   setUpdatedEmail(value as string);
      //   break;
      default:
        break;
    }

    // Track changed fields
    setChangedFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // **Updated handleSave Function Start Here**
  const handleSave = async (
    sectionFields: (keyof UserSettings)[],
    section: "profile" | "appearance" | "notifications" | "weight_unit"
  ) => {
    if (!user) return;

    // Set the appropriate isSaving state based on the section
    switch (section) {
      case "profile":
        setIsSavingProfile(true);
        break;
      case "appearance":
        setIsSavingAppearance(true);
        break;
      case "notifications":
        setIsSavingNotifications(true);
        break;
      case "weight_unit":
        setIsSavingWeightUnit(true);
        break;
      default:
        break;
    }

    try {
      // Prepare updatedFields as before
      const updatedFields: Partial<UserSettings> = {};

      for (const field of sectionFields) {
        if (changedFields[field] !== undefined) {
          switch (field) {
            case "dark_mode":
              updatedFields.dark_mode = changedFields.dark_mode as boolean;
              break;
            case "email_notifications":
              updatedFields.email_notifications = changedFields.email_notifications as boolean;
              break;
            case "push_notifications":
              updatedFields.push_notifications = changedFields.push_notifications as boolean;
              break;
            case "weight_unit":
              updatedFields.weight_unit = changedFields.weight_unit as "kg" | "lbs";
              break;
            // case "name":
            //   updatedFields.name = changedFields.name as string;
            //   break;
            // case "email":
            //   updatedFields.email = changedFields.email as string;
            //   break;
            default:
              break;
          }
        }
      }

      if (Object.keys(updatedFields).length === 0) {
        // Nothing to save
        return;
      }

      // Dispatch the updated settings to the reducer
      Object.entries(updatedFields).forEach(([key, value]) => {
        dispatch(updateUserSetting({ key: key as keyof UserSettings, value }));
      });

      // Make the API call with only the updated fields
      const response = await fetch(`/api/user-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...updatedFields,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user settings');
      }

      const result = await response.json();
      console.log(result);

      // Set the appropriate saveSuccess state based on the section
      switch (section) {
        case "profile":
          setSaveSuccessProfile(true);
          break;
        case "appearance":
          setSaveSuccessAppearance(true);
          break;
        case "notifications":
          setSaveSuccessNotifications(true);
          break;
        case "weight_unit":
          setSaveSuccessWeightUnit(true);
          break;
        default:
          break;
      }

      // Reset changed fields after successful save
      setChangedFields({});
    } catch (error) {
      console.error("Error saving user settings:", error);
    } finally {
      // Reset the isSaving state
      switch (section) {
        case "profile":
          setIsSavingProfile(false);
          break;
        case "appearance":
          setIsSavingAppearance(false);
          break;
        case "notifications":
          setIsSavingNotifications(false);
          break;
        case "weight_unit":
          setIsSavingWeightUnit(false);
          break;
        default:
          break;
      }
    }
  };

  // Inline SVG for Checkmark
  const CheckMark = () => (
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


  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 space-y-8 sm:p-6">
      <section className="w-full max-w-4xl space-y-8">
        {/* General Settings Section */}
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage your account preferences and settings here.</p>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="p-6 bg-white shadow-lg relative">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <div>
              <label className="block text-gray-700">Name</label>
              <Input
                type="text"
                value={updatedName}
                onChange={(e) => console.log("changing name:", e.target.value)}//{(e) => handleFieldChange("name", e.target.value)}
                placeholder="Your Name"
                className="w-full mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <Input
                type="email"
                value={updatedEmail}
                onChange={(e) => console.log("changing email:", e.target.value)}//(e) => handleFieldChange("email", e.target.value)}
                className="w-full mt-1 bg-gray-100"
                readOnly // Assuming email is not editable; remove if it should be editable
              />
            </div>

            {/* Loader */}
            {isSavingProfile && (
              <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white bg-opacity-75">
                <Loader className="h-8 w-8 text-blue-500" />
              </div>
            )}

            {/* Success Message */}
            {saveSuccessProfile && (
              <p className="text-green-500 text-sm mt-2">Settings saved successfully!</p>
            )}

            <div className="flex space-x-4 mt-4">
              <Button
                onClick={
                  () => console.log("Save Profile")
                  // () => handleSave(["name", "email"], "profile")
                }
                className="bg-green-500 text-white hover:bg-green-600"
                disabled={isSavingProfile} // Disable button while saving
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="p-6 bg-white shadow-lg relative">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <label className="text-gray-700">Dark Mode</label>
            <Switch
              checked={darkMode}
              onCheckedChange={(value) => handleFieldChange("dark_mode", value)}
            />
          </CardContent>

          {/* Loader */}
          {isSavingAppearance && (
            <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white bg-opacity-75">
              <Loader className="h-8 w-8 text-blue-500" />
            </div>
          )}

          {/* Success Message */}
          {saveSuccessAppearance && (
            <p className="text-green-500 text-sm mt-2">Settings saved successfully!</p>
          )}

          <CardContent className="flex space-x-4 mt-4">
            <Button
              onClick={() => handleSave(["dark_mode"], "appearance")}
              className="bg-green-500 text-white hover:bg-green-600"
              disabled={isSavingAppearance} // Disable button while saving
            >
              Save
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="p-6 bg-white shadow-lg relative">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Email Notifications</label>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(value) => handleFieldChange("email_notifications", value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Push Notifications</label>
              <Switch
                checked={pushNotifications}
                onCheckedChange={(value) => handleFieldChange("push_notifications", value)}
              />
            </div>
          </CardContent>

          {/* Loader */}
          {isSavingNotifications && (
            <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white bg-opacity-75">
              <Loader className="h-8 w-8 text-blue-500" />
            </div>
          )}

          {/* Success Message */}
          {saveSuccessNotifications && (
            <p className="text-green-500 text-sm mt-2">Settings saved successfully!</p>
          )}

          <CardContent className="flex space-x-4 mt-4">
            <Button
              onClick={() => handleSave(["email_notifications", "push_notifications"], "notifications")}
              className="bg-green-500 text-white hover:bg-green-600"
              disabled={isSavingNotifications} // Disable button while saving
            >
              Save
            </Button>
          </CardContent>
        </Card>

        {/* Preferred Weight Setting */}
        <Card className="p-6 bg-white shadow-lg relative">
          <CardHeader>
            <CardTitle>Preferred Weight Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-gray-700">Preferred Weight Unit</label>
              <div className="flex space-x-4 mt-2">
                <Button
                  variant={preferredWeight === "kg" ? "secondary" : "outline"}
                  onClick={() => handleFieldChange("weight_unit", "kg")}
                  className={`w-1/2 ${preferredWeight === "kg" ? "bg-blue-500 text-white hover:bg-gray-600 hover:text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white"
                    }`}
                >
                  Kilograms (kg)
                </Button>
                <Button
                  variant={preferredWeight === "lbs" ? "secondary" : "outline"}
                  onClick={() => handleFieldChange("weight_unit", "lbs")}
                  className={`w-1/2 ${preferredWeight === "lbs" ? "bg-blue-500 text-white hover:bg-gray-600 hover:text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white"
                    }`}
                >
                  Pounds (lbs)
                </Button>
              </div>
            </div>
          </CardContent>

          {/* Loader */}
          {isSavingWeightUnit && (
            <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white bg-opacity-75">
              <Loader className="h-6 w-6 text-blue-500" />
            </div>
          )}

          {/* Success Message */}
          {saveSuccessWeightUnit && (
            <p className="text-green-500 text-sm mt-2">Settings saved successfully!</p>
          )}

          <CardContent className="flex space-x-4 mt-4">
            <Button
              onClick={() => handleSave(["weight_unit"], "weight_unit")}
              className="bg-green-500 text-white hover:bg-green-600"
              disabled={isSavingWeightUnit} // Disable button while saving
            >
              Save
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Preferences */}
        <Card className="p-6 bg-white shadow-lg relative">
          <CardHeader>
            <CardTitle>Privacy Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Sliders Section */}
            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold">Quick Preferences</h3>
              <div className="flex flex-col space-y-2">
                {/* Full Use */}
                <button
                  type="button"
                  onClick={() => applyConsentPreset("full")}
                  className={`text-left flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${selectedPreset === "full" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"
                    } hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-pressed={selectedPreset === "full"}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Yes! I'd like to use the app to the fullest
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
                  onClick={() => applyConsentPreset("functional")}
                  className={`text-left flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${selectedPreset === "functional" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"
                    } hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-pressed={selectedPreset === "functional"}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      I'd like to use all the functions, but don't track me
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
                  onClick={() => applyConsentPreset("essential")}
                  className={`text-left flex items-center justify-between p-4 border rounded-lg transition-colors duration-300 ${selectedPreset === "essential" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"
                    } hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-pressed={selectedPreset === "essential"}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      I'm cautious about privacy
                    </span>
                    <span className="text-sm text-gray-600">
                      Enable only essential cookies and disable functional, analytics, and AI data usage.
                    </span>
                  </div>
                  {selectedPreset === "essential" && <CheckMark />}
                </button>
              </div>
            </div>

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
                    checked={localConsent.cookies.functional}
                    onChange={() => handleConsentToggle("cookies", "functional")}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    aria-checked={localConsent.cookies.functional}
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
                    checked={localConsent.cookies.analytics}
                    onChange={() => handleConsentToggle("cookies", "analytics")}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    aria-checked={localConsent.cookies.analytics}
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
                    checked={localConsent.aiDataUsage}
                    onChange={() => handleConsentToggle("aiDataUsage")}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    aria-checked={localConsent.aiDataUsage}
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
            {errorConsent && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                {errorConsent}
              </div>
            )}

            {/* Action Buttons */}
            <CardContent className="flex space-x-4 mt-6">
              <Button
                onClick={async () => {
                  // Handle saving consent preferences
                  setIsSavingConsent(true);
                  setErrorConsent(null);
                  setSaveSuccessConsent(false);
                  try {
                    // Ensure localStorage is always true as it's required
                    const updatedConsentToSave = {
                      ...localConsent,
                      localStorage: true,
                    };
                    user?.id && await updateConsent(updatedConsentToSave, true, user.id);
                    setSaveSuccessConsent(true);
                    setSelectedPreset(null);
                    // Optionally, display a success message for a short duration
                    setTimeout(() => setSaveSuccessConsent(false), 3000);
                  } catch (err) {
                    console.error("Error saving consent preferences:", err);
                    setErrorConsent("There was an issue saving your preferences. Please try again.");
                  } finally {
                    setIsSavingConsent(false);
                  }
                }}
                className="bg-green-500 text-white flex items-center justify-center disabled:opacity-50"
                disabled={isSavingConsent}
              >
                {isSavingConsent && (
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
            </CardContent>

            {/* Success Message */}
            {saveSuccessConsent && (
              <p className="text-green-500 text-sm mt-2">Settings saved successfully!</p>
            )}
          </CardContent>
        </Card>


        {/* Security Settings */}
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="bg-blue-500 text-white hover:bg-blue-600">Change Password</Button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Log Out</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={logout}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Log Out
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default withAuth(SettingsPage);
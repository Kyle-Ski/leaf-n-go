"use client";
import { withAuth } from "@/lib/withAuth";
import { useAuth } from "@/lib/auth-Context";
import { useState, useEffect, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/appContext";
import { UserSettings } from "@/types/projectTypes";

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
  const [updatedName, setUpdatedName] = useState(user?.user_metadata?.name || "");
  const [updatedEmail, setUpdatedEmail] = useState(user?.email || "");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [preferredWeight, setPreferredWeight] = useState<"kg" | "lbs">(user?.user_metadata?.preferred_weight || "lbs");

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

  // Handle individual field changes and track changed fields
  const handleFieldChange = (key: keyof UserSettings, value: UserSettings[keyof UserSettings]) => {
    // Update local state
    switch (key) {
      // case "name":
      //   setUpdatedName(value as string);
      //   break;
      // case "email":
      //   setUpdatedEmail(value as string);
      //   break;
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
      default:
        break;
    }

    // Track changed fields
    setChangedFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save updated user settings to the database
  const handleSave = async (sectionFields: (keyof UserSettings)[]) => {
    if (!user) return;

    // Explicitly type updatedFields as Partial<UserSettings>
    const updatedFields: Partial<UserSettings> = {};

    // Update the forEach loop with type assertions
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
          default:
            // Optionally handle unexpected fields or throw an error
            break;
        }
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      // Nothing to save
      return;
    }

    try {
      // Dispatch the updated settings to the reducer
      Object.entries(updatedFields).forEach(([key, value]) => {
        // Type assertion ensures key is keyof UserSettings
        dispatch(updateUserSetting({ key: key as keyof UserSettings, value }));
      });

      // Make the API call with only the updated fields
      const response = await fetch(`/api/user-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      // Reset changed fields after successful save
      setChangedFields({});
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  };

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
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="flex space-x-4 mt-4">
              <Button onClick={
                // () => handleSave(["name"])
                () => console.log("SAVING NAME")
              }
                className="bg-green-500 text-white hover:bg-green-600">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="p-6 bg-white shadow-lg">
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
          <CardContent className="flex space-x-4 mt-4">
            <Button onClick={() => handleSave(["dark_mode"])} className="bg-green-500 text-white hover:bg-green-600">
              Save
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="p-6 bg-white shadow-lg">
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



          <CardContent className="flex space-x-4 mt-4">
            <Button
              onClick={() => handleSave(["email_notifications", "push_notifications"])}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Save
            </Button>
          </CardContent>
        </Card>

        {/* Preferred Weight Setting */}
        <Card className="p-6 bg-white shadow-lg">
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
          <CardContent className="flex space-x-4 mt-4">
            <Button
              onClick={() => handleSave(["weight_unit"])}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Save
            </Button>
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
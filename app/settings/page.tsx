"use client";
import { withAuth } from "@/lib/withAuth";
import { useAuth } from "@/lib/auth-Context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(user?.user_metadata?.name || "");
  const [updatedEmail, setUpdatedEmail] = useState(user?.email || "");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isDarkModeChanged, setIsDarkModeChanged] = useState(false);
  const [isEmailNotificationsChanged, setIsEmailNotificationsChanged] = useState(false);
  const [isPushNotificationsChanged, setIsPushNotificationsChanged] = useState(false);

  // Fetch user settings from the database when the component mounts
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/user-settings?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user settings');
        }
        const data = await response.json();
        setDarkMode(data.dark_mode);
        setEmailNotifications(data.email_notifications);
        setPushNotifications(data.push_notifications);
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };

    fetchUserSettings();
  }, [user]);

  // Save updated user settings to the database
  const handleSave = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          darkMode,
          emailNotifications,
          pushNotifications,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user settings');
      }

      const result = await response.json();
      
      setIsEditing(false);
      setIsDarkModeChanged(false);
      setIsEmailNotificationsChanged(false);
      setIsPushNotificationsChanged(false);
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
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
                onChange={(e) => setUpdatedName(e.target.value)}
                placeholder="Your Name"
                className="w-full mt-1"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <Input
                type="email"
                value={updatedEmail}
                onChange={(e) => setUpdatedEmail(e.target.value)}
                className="w-full mt-1 bg-gray-100"
                readOnly={!isEditing}
              />
            </div>
            <div className="flex space-x-4 mt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-green-500 text-white hover:bg-green-600">
                    Save
                  </Button>
                  <Button onClick={handleEditToggle} className="bg-gray-500 text-white hover:bg-gray-600">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEditToggle} className="bg-blue-500 text-white hover:bg-blue-600">
                  Edit Profile
                </Button>
              )}
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
            <Switch checked={darkMode} onCheckedChange={(value) => { setDarkMode(value); setIsDarkModeChanged(true); }} />
          </CardContent>
          {isDarkModeChanged && (
            <CardContent className="flex space-x-4 mt-4">
              <Button onClick={handleSave} className="bg-green-500 text-white hover:bg-green-600">
                Save
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Notifications Settings */}
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Email Notifications</label>
              <Switch checked={emailNotifications} onCheckedChange={(value) => { setEmailNotifications(value); setIsEmailNotificationsChanged(true); }} />
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Push Notifications</label>
              <Switch checked={pushNotifications} onCheckedChange={(value) => { setPushNotifications(value); setIsPushNotificationsChanged(true); }} />
            </div>
          </CardContent>
          {(isEmailNotificationsChanged || isPushNotificationsChanged) && (
            <CardContent className="flex space-x-4 mt-4">
              <Button onClick={handleSave} className="bg-green-500 text-white hover:bg-green-600">
                Save
              </Button>
            </CardContent>
          )}
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

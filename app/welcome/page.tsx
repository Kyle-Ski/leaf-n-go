"use client";

import { useUser } from "@/lib/userProvider";
import { supabase } from "@/lib/supbaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function Welcome() {
  const { user } = useUser();
  const router = useRouter();

  const completeOnboarding = async () => {
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarded: true })
        .eq("id", user.id);

      if (error) {
        console.error("Error completing onboarding:", error);
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="text-center py-10 bg-gradient-to-b from-green-500 to-blue-500 text-white w-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to Leaf-N-Go</h1>
        <p className="text-lg mb-6">Plan, pack, and adventure sustainably.</p>
        <Button
          onClick={completeOnboarding}
          className="bg-white text-green-600 px-6 py-2 rounded-md font-semibold hover:bg-green-100"
        >
          Start Exploring
        </Button>
      </section>

      {/* Step-by-Step Onboarding Actions */}
      <section className="my-10 px-4 max-w-6xl w-full text-center">
        <h2 className="text-2xl font-semibold mb-6">Get Started with Leaf-N-Go</h2>

        {/* Dashboard Overview */}
        <Card className="p-4 mb-6">
          <CardHeader>
            <CardTitle>Overview: Your Personal Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            The dashboard is your central hub for planning and tracking your adventures. You’ll find recent checklists, eco-insights, and other resources to keep you organized and prepared for any trip. Customize it to show what’s most important to you, from essential gear reminders to personalized packing suggestions.
          </CardContent>
          <Link href="/dashboard">
            <Button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md font-semibold hover:bg-blue-600">
              Go to Dashboard
            </Button>
          </Link>
        </Card>

        {/* Action 1: Create a Checklist */}
        <Card className="p-4 mb-6">
          <CardHeader>
            <CardTitle>1. Create Your First Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            Start by creating a customized packing checklist based on your trip type, whether it’s a short day hike or an extended backcountry adventure. Organize your essentials, avoid overpacking, and make sure you’re fully prepared without any unnecessary weight.
          </CardContent>
          <Link href="/checklists">
            <Button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md font-semibold hover:bg-blue-600">
              Create a Checklist
            </Button>
          </Link>
        </Card>

        {/* Action 2: Explore Eco-Friendly Insights */}
        <Card className="p-4 mb-6">
          <CardHeader>
            <CardTitle>2. Explore Eco-Friendly Insights</CardTitle>
          </CardHeader>
          <CardContent>
            Leaf-N-Go helps you make sustainable choices by offering environmental impact ratings for gear and materials. Whether you’re looking for durable, multi-use items or eco-friendly alternatives, we provide the insights you need to minimize your impact and pack responsibly.
          </CardContent>
          <Link href="/eco-insights">
            <Button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md font-semibold hover:bg-blue-600">
              View Eco-Friendly Insights
            </Button>
          </Link>
        </Card>

        {/* Action 3: Check Out Packing Tips */}
        <Card className="p-4 mb-6">
          <CardHeader>
            <CardTitle>3. Check Out Packing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            Efficient packing is key to a successful trip. Discover expert packing tips that cover everything from lightweight gear choices to organizing essentials for quick access. Leaf-N-Go’s tips will help you pack smarter, reduce waste, and stay organized.
          </CardContent>
          <Link href="/tips">
            <Button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md font-semibold hover:bg-blue-600">
              View Packing Tips
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-800 text-white text-center">
        <p>&copy; {new Date().getFullYear()} Leaf-N-Go. Adventure Responsibly.</p>
      </footer>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="text-center py-10 bg-gradient-to-b from-green-500 to-blue-500 text-white w-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to Leaf-N-Go</h1>
        <p className="text-lg mb-6">
          Plan, pack, and adventure sustainably.
        </p>
        <Link href="/checklists">
          <Button className="bg-white text-green-600 px-6 py-2 rounded-md font-semibold hover:bg-green-100">
            Get Started
          </Button>
        </Link>
      </section>

      {/* Key Features Section */}
      <section className="grid gap-6 my-10 px-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Customizable Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            Create packing lists tailored to each adventure, whether it’s a day hike or a multi-week trek.
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Eco-Friendly Insights</CardTitle>
          </CardHeader>
          <CardContent>
            Make informed choices with sustainability ratings and eco-friendly suggestions.
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>AI-Powered Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            Get smart packing recommendations based on destination and environmental impact.
          </CardContent>
        </Card>
      </section>

      {/* Getting Started Section */}
      <section className="my-10 text-center">
        <h2 className="text-2xl font-semibold mb-4">Get Started with Leaf-N-Go</h2>
        <p className="text-gray-600 mb-6">Start by creating your first checklist for your upcoming trip.</p>
        <Link href="/checklists">
          <Button className="bg-blue-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-600">
            Create a Checklist
          </Button>
        </Link>
      </section>

      {/* Quick Tips or Recent Activity */}
      <section className="my-10 max-w-4xl w-full px-4">
        <h2 className="text-2xl font-semibold text-center mb-6">Packing Tips & Recent Activity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Packing Tip #1</CardTitle>
            </CardHeader>
            <CardContent>
              Use multi-purpose gear to minimize weight and environmental impact.
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Recent Checklist: Weekend Hike</CardTitle>
            </CardHeader>
            <CardContent>
              Essentials for a 3-day trip, including sustainable gear suggestions.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-800 text-white text-center">
        <p>&copy; {new Date().getFullYear()} Leaf-N-Go. Adventure Responsibly.</p>
      </footer>
    </div>
  );
}

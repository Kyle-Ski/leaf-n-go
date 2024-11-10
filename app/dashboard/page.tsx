"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { withAuth } from "@/lib/userProvider"

const PlanningHub = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 space-y-8 sm:p-6">
      {/* Current Trip Overview */}
      <section className="w-full max-w-md sm:max-w-lg md:max-w-4xl">
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Trip: Yosemite Adventure</CardTitle>
            <p className="text-sm text-gray-500">August 12 - August 15, Yosemite National Park</p>
          </CardHeader>
          <CardContent className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-gray-700">Checklist Progress</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
              <span className="text-xs text-gray-500 mt-2">15/20 items packed</span>
            </div>
            <Link href="/checklists">
              <Button className="bg-blue-500 text-white">View Checklist</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Environmental Insights and Tips */}
      <section className="w-full grid gap-4 sm:grid-cols-2 max-w-md sm:max-w-lg md:max-w-4xl">
        <Card className="p-4 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Sustainable Packing Tip</CardTitle>
          </CardHeader>
          <CardContent>
            Bring reusable containers for snacks to reduce waste on the trail.
          </CardContent>
        </Card>
        <Card className="p-4 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Fire Safety Alert</CardTitle>
          </CardHeader>
          <CardContent>
            Yosemite has fire restrictions. No open fires outside of designated areas.
          </CardContent>
        </Card>
      </section>

      {/* Recent Trips and Activity */}
      <section className="w-full max-w-md sm:max-w-lg md:max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Recent Trips</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Card className="p-4 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Rocky Mountain Getaway</CardTitle>
              <p className="text-sm text-gray-500">Completed: July 15 - July 18</p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Completed Checklist: 18/18 items packed</p>
              <Link href="/checklists">
                <Button variant="outline" className="mt-2">Copy Checklist</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="p-4 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Weekend Hike</CardTitle>
              <p className="text-sm text-gray-500">Completed: July 1 - July 2</p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Completed Checklist: 10/10 items packed</p>
              <Link href="/checklists">
                <Button variant="outline" className="mt-2">Copy Checklist</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Start a New Trip */}
      <section className="w-full max-w-md sm:max-w-lg md:max-w-4xl text-center">
        <h2 className="text-xl font-semibold mb-4">Plan Your Next Adventure</h2>
        <Link href="/new-trip">
          <Button className="bg-green-600 text-white px-6 py-3 rounded-md">Start a New Trip</Button>
        </Link>
      </section>
    </div>
  );
};

export default withAuth(PlanningHub);

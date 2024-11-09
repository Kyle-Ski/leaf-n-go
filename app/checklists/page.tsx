"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ChecklistsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Placeholder data for checklists (could be fetched from an API)
  const checklists = [
    { title: "Weekend Hiking Trip", createdAt: "2024-11-01", progress: 80 },
    { title: "Two-Week Backpacking", createdAt: "2024-10-20", progress: 40 },
    { title: "Day Hike Essentials", createdAt: "2024-11-05", progress: 100 },
  ];

  const filteredChecklists = checklists.filter((list) =>
    list.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 space-y-8 sm:p-6">
      {/* Header with New Checklist Button */}
      <section className="w-full max-w-4xl flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Your Checklists</h1>
        <Link href="/checklists/new">
          <Button className="bg-blue-500 text-white">+ New Checklist</Button>
        </Link>
      </section>

      {/* Search Bar */}
      <section className="w-full max-w-4xl">
        <Input
          type="text"
          placeholder="Search checklists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300"
        />
      </section>

      {/* Checklist Cards */}
      <section className="w-full max-w-4xl grid gap-4">
        {filteredChecklists.length > 0 ? (
          filteredChecklists.map((list, index) => (
            <Card key={index} className="p-4 bg-white shadow-lg">
              <CardHeader>
                <CardTitle>{list.title}</CardTitle>
                <p className="text-sm text-gray-500">Created: {list.createdAt}</p>
              </CardHeader>
              <CardContent className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-gray-700">Completion</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${list.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {list.progress}% complete
                  </span>
                </div>
                <Link href={`/checklists/${index}`}>
                  <Button variant="outline" className="mt-2">View Checklist</Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-600">No checklists found.</p>
        )}
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { withAuth } from "@/lib/userProvider";

const ChecklistsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recent");

  // Placeholder data for checklists (could be fetched from an API)
  const checklists = [
    { title: "Weekend Hiking Trip", category: "Overnight", createdAt: "2024-11-01", progress: 80, favorite: true },
    { title: "Two-Week Backpacking", category: "Multi-Day", createdAt: "2024-10-20", progress: 40, favorite: false },
    { title: "Day Hike Essentials", category: "Day Trip", createdAt: "2024-11-05", progress: 100, favorite: false },
  ];

  const filteredChecklists = checklists
    .filter(
      (list) =>
        (categoryFilter === "All" || list.category === categoryFilter) &&
        list.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "Alphabetical") {
        return a.title.localeCompare(b.title);
      } else if (sortOption === "Recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

  const favorites = filteredChecklists.filter((list) => list.favorite);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 space-y-8 sm:p-6">
      {/* Header with New Checklist Button */}
      <section className="w-full max-w-4xl flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Your Checklists</h1>
        <Link href="/checklists/new">
          <Button className="bg-blue-500 text-white">+ New Checklist</Button>
        </Link>
      </section>

      {/* Search and Filter Options */}
      <section className="w-full max-w-4xl flex flex-wrap items-center gap-4">
        <Input
          type="text"
          placeholder="Search checklists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-4 py-2 rounded-lg border border-gray-300"
        />
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter by Category" />
            <ChevronDown />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Day Trip">Day Trip</SelectItem>
            <SelectItem value="Overnight">Overnight</SelectItem>
            <SelectItem value="Multi-Day">Multi-Day</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOption} onValueChange={(value) => setSortOption(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
            <ChevronDown />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Recent">Recent</SelectItem>
            <SelectItem value="Alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Favorite Checklists Section */}
      {favorites.length > 0 && (
        <section className="w-full max-w-4xl">
          <h2 className="text-xl font-semibold mb-4">Favorites</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {favorites.map((list, index) => (
              <Card key={index} className="p-4 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle>{list.title}</CardTitle>
                  <p className="text-sm text-gray-500">Category: {list.category}</p>
                </CardHeader>
                <CardContent className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-gray-700">Completion</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${list.progress}%` }}></div>
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
            ))}
          </div>
        </section>
      )}

      {/* Checklist Cards */}
      <section className="w-full max-w-4xl grid gap-4">
        {filteredChecklists.length > 0 ? (
          filteredChecklists.map((list, index) => (
            <Card key={index} className="p-4 bg-white shadow-lg">
              <CardHeader>
                <CardTitle>{list.title}</CardTitle>
                <p className="text-sm text-gray-500">Category: {list.category}</p>
              </CardHeader>
              <CardContent className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-gray-700">Completion</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${list.progress}%` }}></div>
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

      {/* Checklist Templates Section */}
      <section className="w-full max-w-4xl mt-10">
        <h2 className="text-xl font-semibold mb-4">Checklist Templates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Weekend Hike Template</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">A basic packing list for a two-day hike.</p>
              <Link href="/checklists/new?template=weekend-hike">
                <Button variant="outline">Use Template</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="p-4 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Multi-Day Backpacking Template</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">A comprehensive list for a week-long trip.</p>
              <Link href="/checklists/new?template=multi-day">
                <Button variant="outline">Use Template</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default withAuth(ChecklistsPage)
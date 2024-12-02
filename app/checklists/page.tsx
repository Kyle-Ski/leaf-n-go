"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-Context";
import { withAuth } from "@/lib/withAuth";
import { Checklist } from '@/types/projectTypes';
import { Loader } from "@/components/ui/loader";

const ChecklistsPage = () => {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChecklists();
    }
  }, [user]);

  const fetchChecklists = async () => {
    if (!user?.id) {
      console.error("User ID is undefined. Cannot fetch checklists.");
      setError("Unable to fetch checklists. Please try again later.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checklists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch checklists");
      }

      const data: Checklist[] = await response.json();
      setChecklists(data);
    } catch (error) {
      console.error("Error fetching checklists:", error);
      setError("Error fetching checklists. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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

      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader className="h-12 w-12 mb-4 text-blue-500" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      ) : (
        <>
          {/* Favorite Checklists Section */}
          {favorites.length > 0 && (
            <section className="w-full max-w-4xl">
              <h2 className="text-xl font-semibold mb-4">Favorites</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {favorites.map((list) => (
                  <Card key={list.id} className="p-4 bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle>{list.title}</CardTitle>
                      <p className="text-sm text-gray-500">Category: {list.category}</p>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-gray-700">Completion</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${list.completion?.total
                                ? (list.completion.completed / list.completion.total) * 100
                                : 0
                                }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2 block">
                          {list.completion?.total
                            ? `${list.completion.completed}/${list.completion.total} items added`
                            : "No items"}
                        </span>
                      </div>
                      <Link href={`/checklists/${list.id}`}>
                        <Button variant="outline" className="mt-2">
                          View Checklist
                        </Button>
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
              filteredChecklists.map((list) => (
                <Card key={list.id} className="p-4 bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle>{list.title}</CardTitle>
                    <p className="text-sm text-gray-500">Category: {list.category}</p>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-gray-700">Completion</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${list.completion?.total
                                ? (list.completion.completed / list.completion.total) * 100
                                : 0
                              }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {list.completion?.total
                          ? `${list.completion.completed}/${list.completion.total} items added`
                          : "No items"}
                      </span>
                    </div>
                    <Link href={`/checklists/${list.id}`}>
                      <Button variant="outline" className="mt-2">
                        View Checklist
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-600">No checklists found.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default withAuth(ChecklistsPage);

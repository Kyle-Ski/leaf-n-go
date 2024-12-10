"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-Context";
import { useAppContext } from "@/lib/appContext";
import { withAuth } from "@/lib/withAuth";
import { Loader } from "@/components/ui/loader";
import ProgressBar from "@/components/progressBar";
import { formatWeight } from "@/utils/convertWeight";

const ChecklistsPage = () => {
  const { user } = useAuth();
  const { state, dispatch } = useAppContext(); // Use AppState for global checklists
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchChecklists = async () => {
        if (!user?.id) {
          console.error("User ID is undefined. Cannot fetch checklists.");
          setError("Unable to fetch checklists. Please try again later.");
          setLoading(false);
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

          const data = await response.json();
          if (Array.isArray(data) && data.length === 0) {
            dispatch({ type: "SET_NO_CHECKLISTS_FOR_USER", payload: true })
          } else {
            dispatch({ type: "SET_CHECKLISTS", payload: data }); // Update global state with checklists
            dispatch({ type: "SET_NO_CHECKLISTS_FOR_USER", payload: false })
          }
        } catch (error) {
          console.error("Error fetching checklists:", error);
          setError("Error fetching checklists. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      if (state.noChecklists) {
        // User has no checklists; stop loading and optionally show a message
        setLoading(false);
      } else if (state.checklists.length > 0) {
        // Use existing checklists from AppState if available
        setLoading(false);
      } else {
        fetchChecklists();
      }
    }
  }, [user, state.checklists, state.noChecklists, dispatch]);

  const filteredChecklists = state.checklists
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
                    <CardContent className="flex flex-col space-y-4 mt-4">
                      {/* Completion Section */}
                      <ProgressBar label="Completion" percentage={(list.completion.completed / list.completion.total) * 100} color="green" description={`${list.completion.completed}/${list.completion.total} items added`} />

                      {/* Weight Section */}
                      <ProgressBar label="Weight" percentage={(list.completion.currentWeight / list.completion.totalWeight) * 100} color="blue" description={`${list.completion.currentWeight.toFixed(1)}/${list.completion.totalWeight.toFixed(1)} ${state.user_settings.weight_unit}`} />

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
              filteredChecklists.map((list) => {
                // console.log("--->", list)
                return(
                  <Card key={list.id} className="p-4 bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle>{list.title}</CardTitle>
                      <p className="text-sm text-gray-500">Category: {list.category}</p>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-4 mt-4">
                      {/* Completion Section */}
                      <ProgressBar label="Completion" percentage={(list.completion.completed / list.completion.total) * 100} color="green" description={`${list.completion.completed}/${list.completion.total} items added`} />
  
                      {/* Weight Section */}
                      <ProgressBar label="Weight" percentage={(list.completion.currentWeight / list.completion.totalWeight) * 100} color="blue" description={`${formatWeight((list.completion.currentWeight.toFixed(1)), state.user_settings.weight_unit)}/${formatWeight(list.completion.totalWeight.toFixed(1), state.user_settings.weight_unit)} ${state.user_settings.weight_unit}`} />
  
                      <Link href={`/checklists/${list.id}`}>
                        <Button variant="outline" className="mt-2">
                          View Checklist
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <p className="text-gray-600 text-center">No checklists found. Try creating a new checklist!</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default withAuth(ChecklistsPage);

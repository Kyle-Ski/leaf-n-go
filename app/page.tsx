"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { withAuth } from "@/lib/withAuth";
import { useAuth } from "@/lib/auth-Context";
import { FrontendTrip } from "@/types/projectTypes";
import { Loader } from "@/components/ui/loader";
import { useAppContext } from "@/lib/appContext";

const PlanningHub = () => {
  const { user } = useAuth();
  const { state, dispatch } = useAppContext();
  const [upcomingTrip, setUpcomingTrip] = useState<FrontendTrip | null>(null);
  const [recentTrips, setRecentTrips] = useState<FrontendTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatUpcomingTrips = () => {
    // Split trips into upcoming and recent
    const now = new Date();

    // Sort trips by start date (earliest first)
    const sortedTrips = state.trips.sort((a, b) => new Date(a.start_date || "").getTime() - new Date(b.start_date || "").getTime());

    // Find the upcoming trip (closest to now and not in the past)
    const upcoming = sortedTrips.find((trip) => {
      const tripStartDate = new Date(trip.start_date || "").getTime();
      return tripStartDate >= now.getTime();
    });

    // Find all recent trips (already passed)
    const recent = sortedTrips.filter((trip) => {
      const tripStartDate = new Date(trip.start_date || "").getTime();
      return tripStartDate < now.getTime();
    });

    setUpcomingTrip(upcoming || null);
    setRecentTrips(recent);
  }

  useEffect(() => {
    if (user && !state.noTrips && state.trips.length === 0) {
      const fetchTrips = async () => {
        try {
          const response = await fetch(`/api/trips`, {
            headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch trips.");
          }

          const data: FrontendTrip[] = await response.json();

          if (Array.isArray(data) && data.length === 0) {
            dispatch({ type: "SET_NO_TRIPS_FOR_USER", payload: true });
          } else {
            dispatch({ type: "SET_TRIPS", payload: data });
            dispatch({ type: "SET_NO_TRIPS_FOR_USER", payload: false });
          }

        } catch (err) {
          console.error("Error fetching trips:", err);
          setError("Unable to load trips. Please try again later.");
        } finally {
         
        }
      };

      fetchTrips();
    }
    setLoading(false);
    formatUpcomingTrips();
  }, [user, state.noTrips, state.trips]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 space-y-8 sm:p-6">
      {error && (
        <div className="w-full max-w-md sm:max-w-lg md:max-w-4xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-xl font-bold">&times;</span>
          </button>
        </div>
      )}

      {/* Current Trip Overview */}
      {upcomingTrip && (
        <section className="w-full max-w-md sm:max-w-lg md:max-w-4xl">
          <Card className="p-6 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Upcoming Trip: {upcomingTrip.title}</CardTitle>
              <p className="text-sm text-gray-500">
                {upcomingTrip.start_date} - {upcomingTrip.end_date}, {upcomingTrip.location}
              </p>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="flex flex-col space-y-2">
                <p>Notes:</p>
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">{upcomingTrip.notes}</p>
                  <Link href={`/trips/${upcomingTrip.id || ""}`}>
                    <Button className="bg-blue-500 text-white">View Trip</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

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
            Remember to check for fire restrictions and follow park guidelines.
          </CardContent>
        </Card>
      </section>

      {/* Recent Trips and Activity */}
      <section className="w-full max-w-md sm:max-w-lg md:max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Recent Trips</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {recentTrips.map((trip) => (
            <Card key={trip.id} className="p-4 bg-white shadow-lg">
              <CardHeader>
                <CardTitle>{trip.title}</CardTitle>
                <p className="text-sm text-gray-500">
                  Completed: {trip.start_date} - {trip.end_date}
                </p>
              </CardHeader>
              <CardContent>
                <Link href={`/trips/${trip.id || ""}`}>
                  <Button variant="outline" className="mt-2">
                    View Trip
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Start a New Trip */}
      <section className="w-full max-w-md sm:max-w-lg md:max-w-4xl text-center">
        <h2 className="text-xl font-semibold mb-4">Plan Your Next Adventure</h2>
        <Link href="/trips">
          <Button className="bg-green-600 text-white px-6 py-3 rounded-md">Start a New Trip</Button>
        </Link>
      </section>
    </div>
  );
};

export default withAuth(PlanningHub);

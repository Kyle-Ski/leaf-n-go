"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-Context";
import { withAuth } from "@/lib/withAuth";
import CreateTripModal from "@/components/createNewTripModal";
import { CreateTripPayload } from "@/types/projectTypes";
import { useAppContext } from "@/lib/appContext";

const TripsPage = () => {
  const { user } = useAuth();
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user && !state.noTrips && state.trips.length === 0) {
      fetchTrips();
    }
  }, [user, state.noTrips, state.trips]);

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/trips", {
        headers: { "x-user-id": user?.id || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trips.");
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length === 0) {
        dispatch({ type: "SET_NO_TRIPS_FOR_USER", payload: true });
      } else {
        dispatch({ type: "SET_TRIPS", payload: data });
        dispatch({ type: "SET_NO_TRIPS_FOR_USER", payload: false });
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load trips. Please try again later.");
    }
  };

  const handleCreateTrip = async (tripData: CreateTripPayload) => {
    try {
      const participants = [
        {
          user_id: user?.id || "",
          role: "owner",
        },
      ];

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ ...tripData, participants }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create trip.");
      }

      fetchTrips(); // Refresh trips after creating a new one
    } catch (err) {
      console.error(err);
      setError("Failed to create trip. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-center mb-4">{error}</p>
        <Button onClick={() => fetchTrips()} className="bg-blue-500 text-white">
          Retry
        </Button>
      </div>
    );
  }

  if (state.noTrips) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg mb-4">No trips found. Start by creating your first trip!</p>
        <Button
          className="bg-green-500 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Trip
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Trips</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-green-500 text-white">
          + New Trip
        </Button>
      </header>

      {/* Trip List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {state.trips.map((trip) => (
          <div key={trip.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">{trip.title}</h2>
            <p className="text-gray-600 text-sm">
              {trip.start_date ? `Starts: ${trip.start_date}` : "No start date"}{" "}
              - {trip.end_date ? `Ends: ${trip.end_date}` : "No end date"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/trips/${trip.id}`)}
            >
              View Trip
            </Button>
          </div>
        ))}
      </div>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTrip}
      />
    </div>
  );
};

export default withAuth(TripsPage);

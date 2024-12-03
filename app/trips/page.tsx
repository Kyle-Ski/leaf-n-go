"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/lib/auth-Context";
import { withAuth } from "@/lib/withAuth";
import CreateTripModal from "@/components/createNewTripModal";
import { CreateTripPayload, Trip } from "@/types/projectTypes";

const TripsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/trips", {
        headers: { "x-user-id": user?.id || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trips.");
      }

      const data = await response.json();
      setTrips(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load trips. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (tripData: CreateTripPayload) => {
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create trip.");
      }

      fetchTrips();
    } catch (err) {
      console.error(err);
      setError("Failed to create trip. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
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
      {trips.length === 0 ? (
        <p className="text-gray-600 text-center">No trips found. Start by creating a new trip!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold">{trip.title}</h2>
              <p className="text-gray-600 text-sm">
                {trip.start_date ? `Starts: ${trip.start_date}` : "No start date"}{" "}
                - {trip.end_date ? `Ends: ${trip.end_date}` : "No end date"}
              </p>
              {/* Add other trip details */}
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
      )}

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

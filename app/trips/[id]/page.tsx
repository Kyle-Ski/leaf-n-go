"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/lib/withAuth";

interface Trip {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  notes: string | null;
}

const TripPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTripDetails();
    }
  }, [id]);

  const fetchTripDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trip details.");
      }

      const data: Trip = await response.json();
      setTrip(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load trip details. Please try again later.");
    } finally {
      setLoading(false);
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

  if (!trip) {
    return <p className="text-gray-600 text-center">No trip found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{trip.title}</h1>
        <Button
          onClick={() => alert("Edit functionality placeholder")}
          className="bg-blue-500 text-white"
        >
          Edit Trip
        </Button>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Trip Details</h2>
        <p>
          <strong>Start Date:</strong> {trip.start_date || "N/A"}
        </p>
        <p>
          <strong>End Date:</strong> {trip.end_date || "N/A"}
        </p>
        <p>
          <strong>Location:</strong> {trip.location || "N/A"}
        </p>
        <p>
          <strong>Notes:</strong> {trip.notes || "No additional notes provided."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Checklists</h2>
        <p className="text-gray-600">Placeholder for trip checklists.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Packing Insights</h2>
        <p className="text-gray-600">Placeholder for AI-assisted packing suggestions.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Weather Overview</h2>
        <p className="text-gray-600">Placeholder for AI-assisted weather forecast.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Itinerary</h2>
        <p className="text-gray-600">Placeholder for day-by-day itinerary.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">People and Shared Resources</h2>
        <p className="text-gray-600">Placeholder for trip participants and shared resources.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Gear and Equipment</h2>
        <p className="text-gray-600">Placeholder for linked gear and equipment tracking.</p>
      </section>
    </div>
  );
};

export default withAuth(TripPage);

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/lib/withAuth";
import EditTripModal, { UpdateTripPayload } from "@/components/editTripModal";
import { Checklist } from "@/types/projectTypes";
import { useAuth } from "@/lib/auth-Context";

interface Trip {
    id: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    trip_checklists: Array<{ checklist_id: string; title: string }>;
    trip_participants: Array<{ user_id: string; role: string }>;
}


const TripPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [allChecklists, setAllChecklists] = useState<Checklist[]>([]);

    useEffect(() => {
        if (user) {
            fetchAllChecklists();
        }
    }, []);

    const fetchAllChecklists = async () => {
        if (!user?.id) {
            console.error("User ID is undefined. Cannot fetch checklists.");
            setError("Unable to fetch checklists. Please try again later.");
            return;
          }
        try {
            const response = await fetch(`/api/checklists`, {
                headers: { "Content-Type": "application/json", "x-user-id": user.id, },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch all checklists.");
            }

            const data = await response.json();
            setAllChecklists(data);
        } catch (err) {
            console.error("Error fetching all checklists:", err);
        }
    };

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

    const handleUpdateTrip = async (updatedTrip: UpdateTripPayload) => {
        if (!user?.id) {
            console.error("User ID is undefined. Cannot fetch checklists.");
            setError("Unable to fetch checklists. Please try again later.");
            return;
          }
        try {
            const response = await fetch(`/api/trips/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user.id,
                },
                body: JSON.stringify(updatedTrip),
            });

            if (!response.ok) {
                throw new Error("Failed to update trip.");
            }

            const updatedData = await response.json();
            setTrip(updatedData);
            setIsUpdateOpen(false);
        } catch (err) {
            console.error(err);
            setError("Unable to update trip. Please try again later.");
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
        <div className="max-w-4xl mx-auto p-2 space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{trip.title}</h1>
                <Button
                    onClick={() => setIsUpdateOpen(true)}
                    className="bg-blue-500 text-white"
                >
                    Edit Trip
                </Button>
            </header>

            {/* Trip Details */}
            <section className="w-full bg-white shadow-md rounded-lg p-6 sm:max-w-full md:max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
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

            {/* Checklists */}
            <section className="w-full bg-white shadow-md rounded-lg p-6 sm:max-w-full md:max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Checklists</h2>
                <p className="text-gray-600">Placeholder for trip checklists.</p>
            </section>

            {/* Packing Insights */}
            <section className="w-full bg-white shadow-md rounded-lg p-6 sm:max-w-full md:max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Packing Insights</h2>
                <p className="text-gray-600">Placeholder for AI-assisted packing suggestions.</p>
            </section>

            {/* Weather Overview */}
            <section className="w-full bg-white shadow-md rounded-lg p-6 sm:max-w-full md:max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Weather Overview</h2>
                <p className="text-gray-600">Placeholder for AI-assisted weather forecast.</p>
            </section>

            {/* Itinerary */}
            <section className="w-full bg-white shadow-md rounded-lg p-6 sm:max-w-full md:max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
                <p className="text-gray-600">Placeholder for day-by-day itinerary.</p>
            </section>

            {/* People and Shared Resources */}
            <section className="w-full bg-white shadow-md rounded-lg p-6 sm:max-w-full md:max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">People and Shared Resources</h2>
                <p className="text-gray-600">Placeholder for trip participants and shared resources.</p>
            </section>

            {/* Gear and Equipment */}
            <section className="w-full bg-white shadow-md rounded-lg p-6 sm:max-w-full md:max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Gear and Equipment</h2>
                <p className="text-gray-600">Placeholder for linked gear and equipment tracking.</p>
            </section>

            {/* Edit Trip Modal */}
            <EditTripModal
                allChecklists={allChecklists}
                isOpen={isUpdateOpen}
                onClose={() => setIsUpdateOpen(false)}
                trip={trip}
                onUpdate={handleUpdateTrip}
            />
        </div>
    );
};

export default withAuth(TripPage);

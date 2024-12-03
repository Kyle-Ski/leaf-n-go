"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-Context";
import { withAuth } from "@/lib/withAuth";

interface Trip {
    id: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    trip_checklists: Array<{ checklist_id: string; title: string }>;
}

const TripsPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTripTitle, setNewTripTitle] = useState("");
    const [newTripStartDate, setNewTripStartDate] = useState<Date | null>(null);
    const [newTripEndDate, setNewTripEndDate] = useState<Date | null>(null);
    const [newTripLocation, setNewTripLocation] = useState("");
    const [newTripNotes, setNewTripNotes] = useState("");

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

            const data: Trip[] = await response.json();
            setTrips(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load trips. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async () => {
        if (!newTripTitle) {
            setModalError("Trip title is required.");
            return;
        }

        try {
            const response = await fetch("/api/trips", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id || "",
                },
                body: JSON.stringify({
                    title: newTripTitle,
                    start_date: newTripStartDate?.toISOString() || null,
                    end_date: newTripEndDate?.toISOString() || null,
                    location: newTripLocation,
                    notes: newTripNotes,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setModalError(errorData.error || "Failed to create trip.");
                return;
            }

            // Reset form and refresh trips
            setIsCreateModalOpen(false);
            resetForm();
            fetchTrips();
        } catch (err) {
            console.error(err);
            setModalError("Failed to create trip. Please try again.");
        }
    };

    const resetForm = () => {
        setNewTripTitle("");
        setNewTripStartDate(null);
        setNewTripEndDate(null);
        setNewTripLocation("");
        setNewTripNotes("");
        setModalError(null);
    };

    const handleViewTrip = (tripId: string) => {
        router.push(`/trips/${tripId}`);
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
                            <ul className="mt-2 space-y-1 text-gray-800">
                                {trip.trip_checklists.length > 0 ? (
                                    trip.trip_checklists.map((checklist) => (
                                        <li key={checklist.checklist_id} className="text-sm">
                                            - {checklist.title}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No checklists linked.</p>
                                )}
                            </ul>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => handleViewTrip(trip.id)}
                            >
                                View Trip
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Trip Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Trip</DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="space-y-4">
                            {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
                            <label htmlFor="trip-title" className="block text-sm font-medium text-gray-700">
                                Trip Title
                            </label>
                            <Input
                                id="trip-title"
                                type="text"
                                placeholder="Trip Title"
                                value={newTripTitle}
                                onChange={(e) => setNewTripTitle(e.target.value)}
                                className="w-full"
                            />
                            <label htmlFor="trip-start" className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <DatePicker
                                id="trip-start"
                                selected={newTripStartDate}
                                onChange={(date) => setNewTripStartDate(date)}
                                placeholderText="Select start date"
                                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <label htmlFor="trip-end" className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <DatePicker
                                id="trip-end"
                                selected={newTripEndDate}
                                onChange={(date) => setNewTripEndDate(date)}
                                placeholderText="Select end date"
                                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <label htmlFor="trip-location" className="block text-sm font-medium text-gray-700">
                                Location
                            </label>
                            <Input
                                id="trip-location"
                                type="text"
                                placeholder="Location (optional)"
                                value={newTripLocation}
                                onChange={(e) => setNewTripLocation(e.target.value)}
                                className="w-full"
                            />

                            <label htmlFor="trip-notes" className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                id="trip-notes"
                                placeholder="Additional notes (optional)"
                                value={newTripNotes}
                                onChange={(e) => setNewTripNotes(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                            />
                        </div>
                    </DialogDescription>
                    <div className="mt-4 flex justify-end space-x-4">
                        <Button onClick={() => setIsCreateModalOpen(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTrip} className="bg-green-500 text-white">
                            Create
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default withAuth(TripsPage);

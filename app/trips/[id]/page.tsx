"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/lib/withAuth";
import EditTripModal, { UpdateTripPayload } from "@/components/editTripModal";
import { Checklist } from "@/types/projectTypes";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/lib/appContext";
import { useAuth } from "@/lib/auth-Context";

const TripPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { id } = useParams();
    const { state, dispatch } = useAppContext();
    const [allChecklists, setAllChecklists] = useState<Checklist[]>([]);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Find the trip in the app state
    const trip = state.trips.find((trip) => trip.id === id);

    useEffect(() => {
        if (!trip) {
            setError("Trip not found.");
            return;
        }

        // If no checklists flag is set, don't fetch again
        if (state.noChecklists) {
            setAllChecklists([]);
            return;
        }

        // If checklists exist in state, use them
        if (state.checklists.length > 0) {
            setAllChecklists(state.checklists);
        } else {
            fetchAllChecklists();
        }
    }, [trip, state.checklists, state.noChecklists]);

    const fetchAllChecklists = async () => {
        try {
            const response = await fetch(`/api/checklists`, {
                headers: { "x-user-id": user?.id || "" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch all checklists.");
            }

            const data: Checklist[] = await response.json();

            if (Array.isArray(data) && data.length === 0) {
                // If no checklists found, set the noChecklists flag
                dispatch({ type: "SET_NO_CHECKLISTS_FOR_USER", payload: true });
                setAllChecklists([]);
            } else {
                // If checklists exist, update the state
                dispatch({ type: "SET_CHECKLISTS", payload: data });
                setAllChecklists(data);
            }
        } catch (err) {
            console.error("Error fetching all checklists:", err);
            setError("Unable to load checklists. Please try again later.");
        }
    };

    const handleUpdateTrip = async (updatedTrip: UpdateTripPayload) => {
        try {
            const response = await fetch(`/api/trips/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-user-id": user?.id || "", },
                body: JSON.stringify(updatedTrip),
            });

            if (!response.ok) {
                throw new Error("Failed to update trip.");
            }

            const updatedData = await response.json();
            dispatch({ type: "UPDATE_TRIP", payload: updatedData });
            setIsUpdateOpen(false);
        } catch (err) {
            console.error(err);
            setError("Unable to update trip. Please try again later.");
        }
    };

    const handleDelete = async () => {
        if (!id) {
            setError("Error Deleting Trip, try again later")
            return
        }
        try {
            const response = await fetch(`/api/trips/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete trip.");
            }

            dispatch({ type: "REMOVE_TRIP", payload: id });
            router.push("/trips");
        } catch (err) {
            console.error(err);
            setError("Failed to delete trip. Please try again.");
        }
    };

    if (!trip) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600 text-lg">No trip found. Please select a valid trip.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-2 space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{trip.title}</h1>
                <Button onClick={() => setIsUpdateOpen(true)} className="bg-blue-500 text-white">
                    Edit Trip
                </Button>
            </header>

            {/* Trip Details */}
            <section className="w-full bg-white shadow-md rounded-lg p-6">
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
            <section className="w-full bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Checklists</h2>
                {state.checklists.length === 0 ? (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            You don't have any checklists created yet. You can make one by going here:
                        </p>
                        <Link
                            href="/checklists/new"
                            className="text-blue-500 underline hover:text-blue-700"
                        >
                            Create a New Checklist
                        </Link>
                    </div>
                ) : trip.trip_checklists.length === 0 ? (
                    <p className="text-gray-600">No checklists linked to this trip.</p>
                ) : (
                    <ul className="space-y-4">
                        {trip.trip_checklists.map((checklist) => (
                            <li
                                key={checklist.checklist_id}
                                className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                            >
                                <div>
                                    <h3 className="font-semibold">
                                        {checklist.checklists[0]?.title || "Untitled Checklist"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {checklist.completedItems} of {checklist.totalItems} items completed
                                    </p>
                                    <div className="relative h-2 bg-gray-200 rounded-full mt-2">
                                        <div
                                            className="absolute top-0 left-0 h-2 bg-green-500 rounded-full"
                                            style={{
                                                width: `${(checklist.completedItems / checklist.totalItems) * 100 || 0
                                                    }%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <Link
                                    href={`/checklists/${checklist.checklist_id}`}
                                    className="text-blue-500 border border-blue-500 rounded-lg px-4 py-2 text-sm hover:bg-blue-100 transition"
                                >
                                    View
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

            </section>

            <Button
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-500 text-white shadow-md"
            >
                Delete Trip
            </Button>

            {/* Edit Trip Modal */}
            <EditTripModal
                isOpen={isUpdateOpen}
                onClose={() => setIsUpdateOpen(false)}
                trip={trip}
                onUpdate={handleUpdateTrip}
            />

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this trip? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex space-x-4 mt-4">
                        <Button onClick={handleDelete} className="bg-red-500 text-white">
                            Delete
                        </Button>
                        <Button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-300 text-black">
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default withAuth(TripPage);

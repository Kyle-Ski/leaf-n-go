"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/lib/withAuth";
import EditTripModal, { UpdateTripPayload } from "@/components/editTripModal";
import { ChecklistWithItems } from "@/types/projectTypes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/lib/appContext";
import { useAuth } from "@/lib/auth-Context";
import ConfirmDeleteModal from "@/components/confirmDeleteModal";
import ChecklistDetails from "@/components/checklistDetails";
import Link from "next/link";

const TripPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { id } = useParams();
    const { state, dispatch } = useAppContext();
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // New states for showing checklist details in a dialog
    const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
    const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);

    // Find the trip in the app state
    const trip = state.trips.find((trip) => trip.id === id);

    const fetchAllChecklists = async () => {
        try {
            const response = await fetch(`/api/checklists`, {
                headers: { "x-user-id": user?.id || "" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch all checklists.");
            }

            const data: ChecklistWithItems[] = await response.json();

            if (Array.isArray(data) && data.length === 0) {
                // If no checklists found, set the noChecklists flag
                dispatch({ type: "SET_NO_CHECKLISTS_FOR_USER", payload: true });
            } else {
                // If checklists exist, update the state
                dispatch({ type: "SET_CHECKLISTS", payload: data });
            }
        } catch (err) {
            console.error("Error fetching all checklists:", err);
            setError("Unable to load checklists. Please try again later.");
        }
    };

    useEffect(() => {
        if (!trip) {
            setError("Trip not found.");
            return;
        }
        // If no checklists flag is set, don't fetch again
        if (state.noChecklists) {
            return;
        }

        if (state.checklists.length === 0) {
            fetchAllChecklists();
        }
    }, [trip, state.checklists, state.noChecklists, fetchAllChecklists]);

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
                headers: { "x-user-id": user?.id || "" }
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
                            You don&apos;t have any checklists created yet. You can make one by going here:
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
                        {trip.trip_checklists.map((checklist) => {
                            return (
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
                                    {/* Replace Link with a button that opens the dialog */}
                                    <Button
                                        className="text-blue-500 border border-blue-500 rounded-lg px-4 py-2 text-sm hover:bg-blue-100 transition"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedChecklistId(checklist.checklist_id);
                                            setIsChecklistDialogOpen(true);
                                        }}
                                    >
                                        View
                                    </Button>
                                </li>
                            )
                        })}
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
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
                title="Confirm Delete Trip"
                description="Are you sure you want to delete this trip? This action cannot be undone."
            />

            {/* Checklist Details Dialog */}
            <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
                <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Checklist</DialogTitle>
                        <DialogDescription>Viewing Checklist Details.</DialogDescription>
                    </DialogHeader>
                    {isChecklistDialogOpen && selectedChecklistId && user && (
                        <ChecklistDetails
                            id={selectedChecklistId}
                            user={user}
                            state={state}
                        />
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default withAuth(TripPage);

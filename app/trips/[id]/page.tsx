"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/lib/withAuth";
import EditTripModal, { UpdateTripPayload } from "@/components/editTripModal";
import { ChecklistWithItems } from "@/types/projectTypes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/lib/appContext";
import ConfirmDeleteModal from "@/components/confirmDeleteModal";
import ChecklistDetails from "@/components/checklistDetails";
import TripRecommendations from "@/components/tripRecommendations";
import parseRecommendations from "@/utils/parseTripRecommendations";
import getExistingItems from "@/utils/getItemNamesInTrip";
import TripDetails from "@/components/tripDetails";
import TripChecklists from "@/components/tripChecklists";

const TripPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const { state, dispatch } = useAppContext();
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
    const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
    const [recommendations, setRecommendations] = useState<{
        location: string;
        isWeatherMismatch: boolean;
        recommendations: Record<string, string>;
    }>({
        location: "", // Default to an empty string
        isWeatherMismatch: false, // Default to false
        recommendations: {}, // Default to an empty object
    });

    const [loading, setLoading] = useState(false);

    // Find the trip in the app state
    const trip = state.trips.find((trip) => trip.id === id);

    const getAssistantHelp = async () => {
        setLoading(true);
        setError(null);

        setRecommendations({
            location: "",
            isWeatherMismatch: false,
            recommendations: {},
        });

        if (!trip) {
            setLoading(false);
            setError("Trip data is missing, please try again later.");
            return;
        }

        try {
            const existingItems = getExistingItems(trip.id, state);

            const response = await fetch(`/api/assistant/trip-recommendations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tripId: trip.id,
                    location: trip.location,
                    startDate: trip.start_date,
                    endDate: trip.end_date,
                    existingItems,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error("Failed to get recommendations. Please try again.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedText = "";
            let isWeatherMismatch = false;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                streamedText += decoder.decode(value, { stream: true });

                // Detect weather mismatch
                if (streamedText.includes("unusual") || streamedText.includes("might be a system error")) {
                    isWeatherMismatch = true;
                }

                // Extract categories dynamically
                const categories = parseRecommendations(streamedText);

                setRecommendations((prev) => ({
                    location: trip.location || "",
                    isWeatherMismatch,
                    recommendations: { ...prev.recommendations, ...categories },
                }));
            }
            // Final pass for the last chunk of data after the loop
            const finalCategories = parseRecommendations(streamedText);

            setRecommendations((prev) => ({
                location: trip.location || "",
                isWeatherMismatch,
                recommendations: { ...prev.recommendations, ...finalCategories },
            }));

            dispatch({ type: "UPDATE_TRIP", payload: { ...trip, ai_recommendation: finalCategories } })

            await fetch(`/api/assistant/trip-recommendations/${trip.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ai_recommendation: finalCategories }),
            });

        } catch (err) {
            console.error("Error fetching recommendations:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllChecklists = async () => {
        try {
            const response = await fetch(`/api/checklists`, {
                headers: { "Content-Type": "application/json" },
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
                headers: { "Content-Type": "application/json", },
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
                headers: { "Content-Type": "application/json" }
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
                <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-500 text-white shadow-md"
                >
                    Delete Trip
                </Button>
            </header>

            {/* Trip Details */}
            <TripDetails trip={trip} />

            {/* Checklists */}
            <TripChecklists
                state={state}
                trip={trip}
                setIsChecklistDialogOpen={setIsChecklistDialogOpen}
                setSelectedChecklistId={setSelectedChecklistId}
            />

            {/* AI Assistant */}
            <TripRecommendations
                recommendations={recommendations}
                loading={loading}
                error={error}
                getAssistantHelp={getAssistantHelp}
                aiRecommendationFromState={trip.ai_recommendation}
                location={trip.location || "Unknown"}
            />

            {/* Edit Trip Button */}
            <Button onClick={() => setIsUpdateOpen(true)} className="bg-blue-500 text-white">
                Edit Trip
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
                <DialogContent className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-2 sm:p-4 rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Checklist</DialogTitle>
                        <DialogDescription>Viewing Checklist Details.</DialogDescription>
                    </DialogHeader>
                    {isChecklistDialogOpen && selectedChecklistId && (
                        <ChecklistDetails
                            id={selectedChecklistId}
                            state={state}
                            currentPage="trips"
                        />
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default withAuth(TripPage);

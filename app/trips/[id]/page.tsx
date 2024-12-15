"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/lib/withAuth";
import EditTripModal, { UpdateTripPayload } from "@/components/editTripModal";
import { ChecklistWithItems, ItemDetails, UpdatedAiRecommendedItem } from "@/types/projectTypes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/lib/appContext";
import ConfirmDeleteModal from "@/components/confirmDeleteModal";
import ChecklistDetails from "@/components/checklistDetails";
import TripRecommendations from "@/components/tripRecommendations";
import parseRecommendations from "@/utils/parseTripRecommendations";
import getExistingItems from "@/utils/getItemNamesInTrip";
import TripDetails from "@/components/tripDetails";
import TripChecklists from "@/components/tripChecklists";
import { toast } from "react-toastify";
import FloatingActionButton from "@/components/floatingActionButton";
import ExpandableCategoryTable from "@/components/expandableAiCategoryTable";
import { kgToLbs } from "@/utils/convertWeight";
import ensureKeys from "@/utils/ensureObjectKeys";
import { BotIcon } from "lucide-react";

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
    const [isAiSuggestionOpen, setIsAiSuggestionOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const showErrorToast = (error: string | null) => {
        if (error) {
            toast.error(error, {
                position: "top-right",
                autoClose: 5000, // Adjust as needed
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };

    // Example usage in your component
    useEffect(() => {
        if (error) {
            showErrorToast(error);
            setError(null); // Clear the error after displaying
        }
    }, [error]);

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

    useEffect(() => {
        if (!trip) {
            setError("Trip not found.");
            return;
        }

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

        // If no checklists flag is set, don't fetch again
        if (state.noChecklists) {
            return;
        }

        if (state.checklists.length === 0) {
            fetchAllChecklists();
        }
    }, [trip, state.checklists, state.noChecklists]);

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


    const addAiItemToChecklist = async (checklistId: string, item: ItemDetails) => {
        try {
            const defaultKeys: Partial<ItemDetails> = {
                name: "Un-named Item",
                quantity: 0,
                weight: 0,
                item_categories: undefined
            }
            const formattedItem = ensureKeys(item, defaultKeys)
            // Get user's weight unit preference
            const { weight_unit } = state.user_settings;
            let weightInLbs: number;

            // Convert weight if needed
            if (weight_unit === "kg") {
                const converted = kgToLbs(formattedItem.weight);
                if (converted === null) {
                    throw new Error("Invalid weight input.");
                }
                weightInLbs = converted;
            } else {
                weightInLbs = formattedItem.weight;
            }

            // Prepare the payload
            const payload = { ...formattedItem, weight: weightInLbs };

            // Send API request
            const response = await fetch(`/api/assistant/trip-recommendations/${checklistId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // Handle errors
            if (!response.ok) {
                const errorResponse = await response.json();
                console.error('Failed to add item to checklist', errorResponse);
                throw new Error('Failed to add item to checklist');
            }

            // Parse response data
            const data: UpdatedAiRecommendedItem = await response.json();
            // Dispatch actions to update the state
            dispatch({ type: "ADD_ITEM", payload: data.items[0] });
            dispatch({ type: "ADD_ITEM_TO_CHECKLIST", payload: data.checklists[checklistId].items });

            // Return the data
            return data;
        } catch (error) {
            console.error('Error in addAiItemToChecklist:', error);
            throw error;
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

    const hasValidRecommendations = (recs?: Record<string, string>) =>
        recs && Object.keys(recs).length > 0;

    const displayedRecommendations = hasValidRecommendations(recommendations?.recommendations)
        ? recommendations // Use live-streamed recommendations if available and valid
        : trip.ai_recommendation // Otherwise, use the saved recommendation
            ? {
                location, // Since saved recommendations don't include location
                isWeatherMismatch: false,
                recommendations: trip.ai_recommendation,
            }
            : null;

    return (
        <div className="max-w-4xl mx-auto p-2 space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{trip.title}</h1>
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
                aiRecommendationFromState={trip.ai_recommendation}
                location={trip.location || "Unknown"}
            />

            <FloatingActionButton>
                <Button
                    onClick={() => setIsUpdateOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2"
                >
                    Edit Trip
                </Button>
                <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-500 text-white shadow-md px-4 py-2"
                >
                    Delete Trip
                </Button>
                <Button
                    disabled={!trip?.ai_recommendation}
                    onClick={() => setIsAiSuggestionOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2"
                >
                    <BotIcon /> Add Suggestions to Inventory
                </Button>
                <Button
                    onClick={getAssistantHelp}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2"
                >
                    <BotIcon /> {loading ? "Loading Recommendations..." : (hasValidRecommendations(displayedRecommendations?.recommendations) ? "Get New Recommendations" : "Get Recommendations")}
                </Button>
            </FloatingActionButton>

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

            {/* Add AI recs to inventory Details Dialog */}
            <Dialog open={isAiSuggestionOpen} onOpenChange={setIsAiSuggestionOpen}>
                <DialogContent className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-2 sm:p-4 rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Add Suggestions To Checklist and Inventory</DialogTitle>
                        <DialogDescription>
                            You can choose to add the AI&apos;s recommendations to your inventory and trip checklist.
                        </DialogDescription>
                    </DialogHeader>
                    <ExpandableCategoryTable
                        data={trip.ai_recommendation}
                        tripChecklists={trip.trip_checklists}
                        onAddToChecklist={addAiItemToChecklist}
                    />
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default withAuth(TripPage);

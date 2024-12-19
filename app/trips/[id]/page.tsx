"use client";

import { useEffect, useReducer, useState } from "react";
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
import { parseRecommendations2 } from "@/utils/parseTripRecommendations";
import getExistingItems from "@/utils/getItemNamesInTrip";
import TripDetails from "@/components/tripDetails";
import TripChecklists from "@/components/tripChecklists";
import { toast } from "react-toastify";
import FloatingActionButton from "@/components/floatingActionButton";
import ExpandableCategoryTable from "@/components/expandableAiCategoryTable";
import { kgToLbs } from "@/utils/convertWeight";
import ensureKeys from "@/utils/ensureObjectKeys";
import { BotIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useConsent } from "@/lib/consentContext";
import CategorySelector from "@/components/categorySelector";

type Action =
    | { type: "ADD_CATEGORY"; payload: string }
    | { type: "REMOVE_CATEGORY"; payload: string }

function categoryReducer(state: string[], action: Action): string[] {
    switch (action.type) {
        case "ADD_CATEGORY":
            return [...new Set([...state, action.payload])]
        case "REMOVE_CATEGORY":
            return state.filter((category) => category !== action.payload)
        default:
            return state
    }
}

const TripPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const { state, dispatch } = useAppContext();
    const { hasConsent } = useConsent();
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
    const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
    const [isAssistantCategoriesOpen, setIsAssistantCategoriesOpen] = useState(false)
    const [recommendations, setRecommendations] = useState({});
    const [isAiSuggestionOpen, setIsAiSuggestionOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const defaultCategories = state.item_categories
        .filter((ic) => ic.user_id === null)
        .map((ic) => ic.name);
    const [categories, dispatch2] = useReducer(categoryReducer, defaultCategories)
    const [customCategory, setCustomCategory] = useState("")

    const handleAddCategory = (category: string) => {
        dispatch2({ type: "ADD_CATEGORY", payload: category })
    }

    const handleRemoveCategory = (category: string) => {
        dispatch2({ type: "REMOVE_CATEGORY", payload: category })
    }

    const handleAddCustomCategory = () => {
        if (customCategory.trim()) {
            handleAddCategory(customCategory.trim())
            setCustomCategory("")
        }
    }
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

    /**
     * Sends information about the user's trip to our AI.
     * Will always have default recommendation categories, will
     * give the AI the dates, location and items that are in the user's 
     * checklist.
     */
    const getAssistantHelp = async () => {
        setLoading(true);
        setError(null);

        setRecommendations({});

        if (!trip) {
            setLoading(false);
            setError("Trip data is missing, please try again later.");
            return;
        }
        dispatch({ type: "UPDATE_TRIP", payload: { ...trip, ai_recommendation: {} } })
        try {
            const existingItems = getExistingItems(trip.id, state);
            const userCategories = ["Weather Forecast Insights", "Pro Tips", "Specific Location Considerations", ...categories, "Additional Recommendations"]
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
                    tripType: trip.trip_category,
                    categories: userCategories
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error("Failed to get recommendations. Please try again.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedText = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                streamedText += decoder.decode(value, { stream: true });

                // Detect weather mismatch
                if (streamedText.includes("unusual") || streamedText.includes("might be a system error")) {
                    console.log("UNUSUAL?")
                }
                const categories2 = parseRecommendations2(streamedText, userCategories)
                // Extract categories dynamically

                setRecommendations((prev) => ({ ...prev, ...categories2 }))
            }
            // Final pass for the last chunk of data after the loop
            const finalCategories2 = parseRecommendations2(streamedText, userCategories)
            setRecommendations((prev) => ({ ...prev, ...finalCategories2 }))
            dispatch({ type: "UPDATE_TRIP", payload: { ...trip, ai_recommendation: finalCategories2 } })

            await fetch(`/api/assistant/trip-recommendations/${trip.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ai_recommendation: finalCategories2 }),
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
            router.push("/trips")
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
            if (updatedData?.ai_recommendation) {
                const ai_recommendation = JSON.parse(updatedData.ai_recommendation)
                dispatch({ type: "UPDATE_TRIP", payload: {...updatedData, ai_recommendation} });
                setIsUpdateOpen(false);
                return;
            }
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
            router.push("/trips");
            toast.success("Successfully deleted the trip.")
            dispatch({ type: "REMOVE_TRIP", payload: id });
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

    const hasValidRecommendations = (recs: Record<string, string[]> | null) =>
        recs && Object.keys(recs).length > 0;

    const displayedRecommendations = hasValidRecommendations(recommendations)
        ? recommendations // Use live-streamed recommendations if available and valid
        : trip.ai_recommendation // Otherwise, use the saved recommendation

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
            {hasConsent('aiDataUsage') ? <TripRecommendations
                recommendations={recommendations}
                loading={loading}
                error={error}
                setIsUpdateOpen={() => setIsUpdateOpen(true)}
                hasChecklist={!trip.trip_checklists.length}
                aiRecommendationFromState={trip.ai_recommendation}
                location={trip.location || "Unknown"}
            /> : <></>}

            <FloatingActionButton>
                <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-500 text-white shadow-md px-4 py-2"
                >
                    <TrashIcon /> Delete Trip
                </Button>
                <Button
                    onClick={() => setIsUpdateOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2"
                >
                    <PencilIcon /> Edit Trip
                </Button>
                {hasConsent('aiDataUsage') ? <Button
                    onClick={() => setIsAssistantCategoriesOpen(true)}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2"
                >
                    <BotIcon /> {loading ? "Loading Recommendations..." : "Edit Packing Categories for AI"}
                </Button> : <></>}
                {hasConsent('aiDataUsage') ? <Button
                    onClick={getAssistantHelp}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2"
                >
                    <BotIcon /> {loading ? "Loading Recommendations..." : (hasValidRecommendations(displayedRecommendations) ? "Get New Recommendations" : "Get Recommendations")}
                </Button> : <></>}
                {hasConsent('aiDataUsage') ? <Button
                    disabled={loading || !trip.trip_checklists.length}
                    onClick={() => setIsAiSuggestionOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2"
                >
                    <BotIcon /> Add Suggestions to Inventory
                </Button> : <></>}
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

            {/* Edit Categories the AI will taylor suggestions to */}
            <Dialog open={isAssistantCategoriesOpen} onOpenChange={setIsAssistantCategoriesOpen}>
                <DialogContent className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-2 sm:p-4 rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Categories The Assistant Will Respond With</DialogTitle>
                        <DialogDescription className="whitespace-pre-line">
                            {`Select the categories you'd like the assistant to focus on for recommendations.

                            We have the 10 essentials already picked, feel free to remove them and add your own!

                            The assistant will always give recommendations for the following: "Specific Location Considerations", "Additional Recommendations", "Pro Tips", and "Weather Forecast Insights"

                            For example: "I'm going on a road trip to the Grand Canyon and need help with: Flight Considerations, Clothing & Layers, Snacks, Electronics & Personal Items, and Health & Hygiene."`}
                        </DialogDescription>
                    </DialogHeader>
                    <CategorySelector
                        handleAddCategory={handleAddCategory}
                        customCategory={customCategory}
                        setCustomCategory={setCustomCategory}
                        handleAddCustomCategory={handleAddCustomCategory}
                        categories={categories}
                        handleRemoveCategory={handleRemoveCategory}
                    />
                    <Button
                        onClick={() => {
                            getAssistantHelp()
                            setIsAssistantCategoriesOpen(false)
                        }}
                        disabled={loading}
                        className="bg-purple-600 text-white px-4 py-2"
                    >
                        <BotIcon /> {loading ? "Loading Recommendations..." : (hasValidRecommendations(displayedRecommendations) ? "Get New Recommendations" : "Get Recommendations")}
                    </Button>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default withAuth(TripPage);

"use client";

import { useEffect, useReducer, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/lib/withAuth";
import { ChecklistWithItems, ItemDetails, UpdatedAiRecommendedItem } from "@/types/projectTypes";
import { useAppContext } from "@/lib/appContext";
import { toast } from "react-toastify";
import FloatingActionButton from "@/components/floatingActionButton";
import { BotIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useConsent } from "@/lib/consentContext";

import EditTripModal, { UpdateTripPayload } from "@/components/editTripModal";
import ConfirmDeleteModal from "@/components/confirmDeleteModal";
import ChecklistDetailsDialog from "@/components/tripPageDialogs/checklistDetailsDialog";
import AiSuggestionsDialog from "@/components/tripPageDialogs/aiSuggestionsDialog";
import AssistantCategoriesDialog from "@/components/tripPageDialogs/assistantCategoriesDialog";

import TripDetails from "@/components/tripDetails";
import TripChecklists from "@/components/tripChecklists";
import TripRecommendations from "@/components/tripRecommendations/tripRecommendations";

import { parseRecommendations2 } from "@/utils/parseTripRecommendations";
import getExistingItems from "@/utils/getItemNamesInTrip";
import { kgToLbs } from "@/utils/convertWeight";
import ensureKeys from "@/utils/ensureObjectKeys";
import WeatherCard from "@/components/weatherCard";

type Action =
    | { type: "ADD_CATEGORY"; payload: string }
    | { type: "REMOVE_CATEGORY"; payload: string };

function categoryReducer(state: string[], action: Action): string[] {
    switch (action.type) {
        case "ADD_CATEGORY":
            return [...new Set([...state, action.payload])];
        case "REMOVE_CATEGORY":
            return state.filter((category) => category !== action.payload);
        default:
            return state;
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
    const [isAssistantCategoriesOpen, setIsAssistantCategoriesOpen] = useState(false);
    const [recommendations, setRecommendations] = useState<Record<string, string[]>>({});
    const [isAiSuggestionOpen, setIsAiSuggestionOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const trip = state.trips.find((trip) => trip.id === id);

    // Determine initial categories for this trip
    let initialCategories: string[];
    if (trip && trip.ai_recommendation && Object.keys(trip.ai_recommendation).length > 0) {
        // If we have AI recommendations, use those categories
        initialCategories = Object.keys(trip.ai_recommendation);
    } else {
        // No AI recommendations yet, default to the 10 essentials
        initialCategories = state.item_categories
            .filter((ic) => ic.user_id === null)
            .map((ic) => ic.name);
    }

    // Filter out the unwanted categories
    const excludedCategories = [
        "Specific Location Considerations",
        "Additional Recommendations",
        "Pro Tips",
        "Weather Forecast Insights",
    ];
    initialCategories = initialCategories.filter(category => !excludedCategories.includes(category));

    const [categories, dispatch2] = useReducer(categoryReducer, initialCategories);

    const [customCategory, setCustomCategory] = useState("");

    const handleAddCategory = (category: string) => dispatch2({ type: "ADD_CATEGORY", payload: category });

    const handleRemoveCategory = (category: string) => dispatch2({ type: "REMOVE_CATEGORY", payload: category });

    const handleAddCustomCategory = () => {
        if (customCategory.trim()) {
            handleAddCategory(customCategory.trim());
            setCustomCategory("");
        }
    };

    const showErrorToast = (error: string | null) => {
        if (error) {
            toast.error(error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };

    useEffect(() => {
        if (error) {
            showErrorToast(error);
            setError(null); // Clear the error after displaying
        }
    }, [error]);

    const getAssistantHelp = async () => {
        setLoading(true);
        setError(null);
        setRecommendations({});

        if (!trip) {
            setLoading(false);
            setError("Trip data is missing, please try again later.");
            return;
        }

        dispatch({ type: "UPDATE_TRIP", payload: { ...trip, ai_recommendation: {} } });

        try {
            const existingItems = getExistingItems(trip.id, state);
            const userCategories = [
                "Weather Forecast Insights",
                "Pro Tips",
                "Specific Location Considerations",
                ...categories,
                "Additional Recommendations",
            ];
            const response = await fetch(`/api/assistant/trip-recommendations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tripId: trip.id,
                    location: trip.location,
                    startDate: trip.start_date,
                    endDate: trip.end_date,
                    existingItems,
                    tripType: trip.trip_category,
                    categories: userCategories,
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
                const categories2 = parseRecommendations2(streamedText, userCategories);
                setRecommendations((prev) => ({ ...prev, ...categories2 }));
            }

            const finalCategories2 = parseRecommendations2(streamedText, userCategories);
            setRecommendations((prev) => ({ ...prev, ...finalCategories2 }));
            dispatch({ type: "UPDATE_TRIP", payload: { ...trip, ai_recommendation: finalCategories2 } });

            await fetch(`/api/assistant/trip-recommendations/${trip.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
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
            router.push("/trips");
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
                    dispatch({ type: "SET_NO_CHECKLISTS_FOR_USER", payload: true });
                } else {
                    dispatch({ type: "SET_CHECKLISTS", payload: data });
                }
            } catch (err) {
                console.error("Error fetching all checklists:", err);
                setError("Unable to load checklists. Please try again later.");
            }
        };

        if (state.noChecklists) {
            return;
        }

        if (state.checklists.length === 0) {
            fetchAllChecklists();
        }
    }, [trip, state.checklists, state.noChecklists, dispatch, router]);

    const handleUpdateTrip = async (updatedTrip: UpdateTripPayload) => {
        try {
            const response = await fetch(`/api/trips/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTrip),
            });

            if (!response.ok) {
                throw new Error("Failed to update trip.");
            }

            const updatedData = await response.json();
            if (updatedData?.ai_recommendation) {
                const ai_recommendation = JSON.parse(updatedData.ai_recommendation);
                dispatch({ type: "UPDATE_TRIP", payload: { ...updatedData, ai_recommendation } });
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
                item_categories: undefined,
            };
            const formattedItem = ensureKeys(item, defaultKeys);
            const { weight_unit } = state.user_settings;
            let weightInLbs: number;

            if (weight_unit === "kg") {
                const converted = kgToLbs(formattedItem.weight);
                if (converted === null) {
                    throw new Error("Invalid weight input.");
                }
                weightInLbs = converted;
            } else {
                weightInLbs = formattedItem.weight;
            }

            const payload = { ...formattedItem, weight: weightInLbs };

            const response = await fetch(`/api/assistant/trip-recommendations/${checklistId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("Failed to add item to checklist", errorResponse);
                throw new Error("Failed to add item to checklist");
            }

            const data: UpdatedAiRecommendedItem = await response.json();
            // If the response contains categories, integrate them into state
            if (data.categories) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for (const [_, category] of Object.entries(data.categories)) {
                    // Assuming you have a dispatcher for adding or updating categories in your state:
                    dispatch({ type: "ADD_CATEGORY", payload: category });
                }
            }
            dispatch({ type: "ADD_ITEM", payload: data.items[0] });
            dispatch({ type: "ADD_ITEM_TO_CHECKLIST", payload: data.checklists[checklistId].items });
            return data;
        } catch (error) {
            console.error("Error in addAiItemToChecklist:", error);
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!id) {
            setError("Error Deleting Trip, try again later");
            return;
        }
        try {
            const response = await fetch(`/api/trips/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to delete trip.");
            }
            router.push("/trips");
            toast.success("Successfully deleted the trip.");
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
        ? recommendations
        : trip.ai_recommendation;

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

            {trip.location && trip.end_date && new Date(trip.end_date) >= new Date() && (
                <WeatherCard locationString={trip.location} tripId={trip.id}/>
            )}

            {/* AI Assistant */}
            {hasConsent("aiDataUsage") && (
                <TripRecommendations
                    recommendations={recommendations}
                    loading={loading}
                    error={error}
                    setIsUpdateOpen={() => setIsUpdateOpen(true)}
                    hasChecklist={!trip.trip_checklists.length}
                    aiRecommendationFromState={trip.ai_recommendation}
                    location={trip.location || "Unknown"}
                />
            )}

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
                {hasConsent("aiDataUsage") && (
                    <Button
                        onClick={() => setIsAssistantCategoriesOpen(true)}
                        disabled={loading}
                        className="bg-purple-600 text-white px-4 py-2"
                    >
                        <BotIcon /> {loading
                            ? "Loading Recommendations..."
                            : hasValidRecommendations(displayedRecommendations)
                                ? "Get New Recommendations"
                                : "Get Recommendations"}
                    </Button>
                )}
                {hasConsent("aiDataUsage") && (
                    <Button
                        disabled={loading || !trip.trip_checklists.length || !trip.ai_recommendation}
                        onClick={() => setIsAiSuggestionOpen(true)}
                        className="bg-purple-600 text-white px-4 py-2"
                    >
                        <BotIcon /> Add Suggestions to Inventory
                    </Button>
                )}
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
            <ChecklistDetailsDialog
                isOpen={isChecklistDialogOpen}
                onOpenChange={setIsChecklistDialogOpen}
                selectedChecklistId={selectedChecklistId}
            />

            {/* Add AI recs to inventory Details Dialog */}
            <AiSuggestionsDialog
                isOpen={isAiSuggestionOpen}
                onOpenChange={setIsAiSuggestionOpen}
                trip={trip}
                addAiItemToChecklist={addAiItemToChecklist}
            />

            {/* Edit Categories Dialog */}
            <AssistantCategoriesDialog
                isOpen={isAssistantCategoriesOpen}
                onOpenChange={setIsAssistantCategoriesOpen}
                loading={loading}
                displayedRecommendations={displayedRecommendations}
                hasValidRecommendations={hasValidRecommendations}
                categories={categories}
                customCategory={customCategory}
                setCustomCategory={setCustomCategory}
                handleAddCustomCategory={handleAddCustomCategory}
                handleAddCategory={handleAddCategory}
                handleRemoveCategory={handleRemoveCategory}
                getAssistantHelp={getAssistantHelp}
            />
        </div>
    );
};

export default withAuth(TripPage);

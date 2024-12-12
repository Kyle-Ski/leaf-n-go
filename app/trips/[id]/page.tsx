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
import ProgressBar from "@/components/progressBar";

const TripPage = () => {
    const router = useRouter();
    const { user } = useAuth();
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
        setError(null); // Clear previous errors

        // Reset recommendations to an empty state
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
            const getExistingItems = (tripId: string) => {
                const trip = state.trips.find((t) => t.id === tripId);

                if (!trip) {
                    console.error("Trip not found");
                    return [];
                }

                const checklistIds = trip.trip_checklists.map((tc) => tc.checklist_id);
                const relatedChecklists = state.checklists.filter((checklist) =>
                    checklistIds.includes(checklist.id)
                );

                return relatedChecklists.flatMap((checklist) =>
                    checklist.items.map((item) => {
                        const itemDetails = state.items.find((i) => i.id === item.item_id);
                        return {
                            id: item.item_id,
                            name: itemDetails?.name || "Unknown Item",
                        };
                    })
                );
            };

            const existingItems = getExistingItems(trip.id);

            const response = await fetch(`/api/assistant/recommendations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
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

            // Read the stream
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                streamedText += decoder.decode(value, { stream: true });

                // Check for weather mismatch
                if (streamedText.includes("unusual") || streamedText.includes("might be a system error")) {
                    isWeatherMismatch = true;
                }

                // Parse categories dynamically
                const categories: Record<string, string> = {
                    "Shelter & Sleep System": streamedText.match(/Shelter & Sleep System:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Clothing & Layers": streamedText.match(/Clothing & Layers:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Food & Cooking Gear": streamedText.match(/Food & Cooking Gear:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Navigation & Safety": streamedText.match(/Navigation & Safety:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Health & Hygiene": streamedText.match(/Health & Hygiene:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Backpack & Carrying System": streamedText.match(/Backpack & Carrying System:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Lighting & Power": streamedText.match(/Lighting & Power:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Entertainment & Personal Items": streamedText.match(/Entertainment & Personal Items:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Fix-it Kit": streamedText.match(/Fix-it Kit:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Water Management": streamedText.match(/Water Management:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Pro Tips": streamedText.match(/Pro Tips:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                    "Specific Location Considerations": streamedText.match(/Specific Location Considerations:\s*(.*?)(\n\n|$)/s)?.[1]?.trim() || "",
                };

                // Update recommendations incrementally
                setRecommendations((prev) => ({
                    location: trip.location || "",
                    isWeatherMismatch,
                    recommendations: { ...prev.recommendations, ...categories },
                }));
            }
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
                <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-500 text-white shadow-md"
                >
                    Delete Trip
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
                                        <ProgressBar label="" percentage={checklist.totalItems !== 0 ? (checklist.completedItems / checklist.totalItems) * 100 : 0} color="green" description={`${checklist.completedItems} of ${checklist.totalItems} items completed`} />
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

            {/* AI Assistant */}
            <section className="w-full bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Assistant Recommendations</h2>
                <Button
                    className="text-blue-500 border border-blue-500 rounded-lg px-4 py-2 text-sm hover:bg-blue-100 transition"
                    variant="outline"
                    onClick={getAssistantHelp}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Get Recommendations"}
                </Button>
                {recommendations && (
                    // <div className="recommendations">
                    //     <h2 className="text-xl font-bold mb-4">Packing Recommendations for {recommendations.location}</h2>

                    //     {recommendations.isWeatherMismatch && (
                    //         <p className="text-red-500">
                    //             Note: Weather data might be inaccurate for this location, or we couldn&apos;t find any data.
                    //         </p>
                    //     )}

                    //     <div className="packing-list">
                    //         {Object.entries(recommendations.recommendations)
                    //             // Filter out sections with no specific recommendations
                    //             .filter(([category, items]) =>
                    //                 items !== "No specific recommendations for this category." &&
                    //                 category !== "Pro Tips" &&
                    //                 category !== "Specific Location Considerations" // Exclude Pro Tips and Specific Location Considerations
                    //             )
                    //             // Ensure no duplicate sections are rendered
                    //             .reduce((uniqueSections, [category, items]) => {
                    //                 if (!uniqueSections.find(([existingCategory]) => existingCategory === category)) {
                    //                     uniqueSections.push([category, items]);
                    //                 }
                    //                 return uniqueSections;
                    //             }, [] as [string, string][])
                    //             .map(([category, items]) => (
                    //                 <div key={category} className="mb-4">
                    //                     <h3 className="font-semibold text-lg">{category}</h3>
                    //                     <p className="text-gray-700 whitespace-pre-line">{items}</p>
                    //                 </div>
                    //             ))}
                    //     </div>

                    //     {recommendations.recommendations["Pro Tips"] &&
                    //         recommendations.recommendations["Pro Tips"] !== "No specific recommendations for this category." && (
                    //             <div className="pro-tips mt-6">
                    //                 <h3 className="text-lg font-semibold">Pro Tips</h3>
                    //                 <p className="text-gray-800 whitespace-pre-line">{recommendations.recommendations["Pro Tips"]}</p>
                    //             </div>
                    //         )}

                    //     {recommendations.recommendations["Specific Location Considerations"] &&
                    //         recommendations.recommendations["Specific Location Considerations"] !== "No specific recommendations for this category." && (
                    //             <div className="specific-considerations mt-6">
                    //                 <h3 className="text-lg font-semibold">Specific Location Considerations</h3>
                    //                 <p className="text-gray-800 whitespace-pre-line">
                    //                     {recommendations.recommendations["Specific Location Considerations"]}
                    //                 </p>
                    //             </div>
                    //         )}
                    // </div>
                    <section className="recommendations">
                        <h2 className="text-xl font-bold mb-4">Packing Recommendations for {recommendations.location}</h2>
                        {Object.entries(recommendations.recommendations).map(([category, items]) => (
                            <div key={category} className="mb-4">
                                <h3 className="font-semibold text-lg">{category}</h3>
                                <p className="text-gray-700 whitespace-pre-line">{items}</p>
                            </div>
                        ))}
                    </section>
                )}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </section>
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
                    {isChecklistDialogOpen && selectedChecklistId && user && (
                        <ChecklistDetails
                            id={selectedChecklistId}
                            user={user}
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

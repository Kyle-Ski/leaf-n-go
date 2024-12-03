"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { withAuth } from "@/lib/withAuth";
import EditTripModal, { UpdateTripPayload } from "@/components/editTripModal";
import { FrontendTrip, Checklist } from "@/types/projectTypes";
import { useAuth } from "@/lib/auth-Context";
import Link from "next/link";

const TripPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const [trip, setTrip] = useState<FrontendTrip | null>(null);
    const [allChecklists, setAllChecklists] = useState<Checklist[]>([]);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && id) {
            fetchTripDetails();
            fetchAllChecklists();
        }
    }, [user, id]);

    const fetchTripDetails = async () => {
        try {
            const response = await fetch(`/api/trips/${id}`, {
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch trip details.");
            }

            const data: FrontendTrip = await response.json();
            setTrip(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load trip details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllChecklists = async () => {
        try {
            const response = await fetch(`/api/checklists`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id || "",
                },
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

    const handleUpdateTrip = async (updatedTrip: UpdateTripPayload) => {
        try {
            const response = await fetch(`/api/trips/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id || "",
                },
                body: JSON.stringify(updatedTrip),
            });

            if (!response.ok) {
                throw new Error("Failed to update trip.");
            }

            const updatedData: FrontendTrip = await response.json();

            if (updatedData.trip_checklists) {
                // Normalize trip_checklists to ensure consistent structure
                updatedData.trip_checklists = updatedData.trip_checklists.map((tripChecklist) => {
                    const checklist = Array.isArray(tripChecklist.checklists)
                        ? tripChecklist.checklists[0]
                        : tripChecklist.checklists;

                    const totalItems = checklist?.checklist_items?.length || 0;
                    const completedItems =
                        checklist?.checklist_items?.filter((item) => item.completed).length || 0;

                    return {
                        checklist_id: tripChecklist.checklist_id,
                        checklists: [
                            {
                                title: checklist?.title || "Untitled Checklist",
                                checklist_items: checklist?.checklist_items || [],
                            },
                        ],
                        totalItems,
                        completedItems,
                    };
                });
            }

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
                {trip.trip_checklists.length === 0 ? (
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
                                                width: `${(checklist.completedItems / checklist.totalItems) * 100 || 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <Link
                                    href={`/checklists/${checklist.checklist_id}`}
                                    className="text-blue-500 border border-blue-500 rounded-lg px-4 py-2 text-sm hover:bg-blue-100 transition"
                                >
                                    View Checklist
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>


            {/* Other Sections */}
            <section className="w-full bg-white shadow-md rounded-lg p-6 sm:max-w-full md:max-w-xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Packing Insights</h2>
                <p className="text-gray-600">Placeholder for AI-assisted packing suggestions.</p>
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

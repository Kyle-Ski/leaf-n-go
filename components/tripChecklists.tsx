import { AppState, FrontendTrip } from "@/types/projectTypes";
import Link from "next/link";
import ProgressBar from "./progressBar";
import { Button } from "./ui/button";
import { EyeIcon } from "lucide-react";

interface TripChecklistsProps {
    state: AppState;
    trip: FrontendTrip;
    setSelectedChecklistId: (checklistId: string) => void;
    setIsChecklistDialogOpen: (isOpen: boolean) => void;
}

const TripChecklists = ({ state, trip, setSelectedChecklistId, setIsChecklistDialogOpen }: TripChecklistsProps) => {
    return (
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
                                    className="bg-blue-500 text-white"
                                    onClick={() => {
                                        setSelectedChecklistId(checklist.checklist_id);
                                        setIsChecklistDialogOpen(true);
                                    }}
                                >
                                    <EyeIcon /> View
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            )}

        </section>

    )
}

export default TripChecklists
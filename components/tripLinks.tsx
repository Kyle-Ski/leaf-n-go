import { useAppContext } from "@/lib/appContext";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";

/**
 * Renders a list of links to trips that include a specified checklist.
 * @param {string} checklistId - The ID of the checklist to filter trips.
 * @returns JSX.Element
 */
const TripLinks = ({ checklistId }: { checklistId: string }) => {
    const { state } = useAppContext();
    const { trips } = state;

    // Filter trips to include only those with the specified checklist ID
    const filteredTrips = trips.filter((trip) =>
        trip.trip_checklists.some(
            (checklist) => checklist.checklist_id === checklistId
        )
    );

    if (!filteredTrips || filteredTrips.length === 0) {
        return (
            <p className="text-gray-500 text-center">
                No trips using this checklist.
            </p>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Trips Using this Checklist
            </h2>
            <ul className="space-y-4">
                {filteredTrips.map((trip) => (
                    <li
                        key={trip.id}
                        className="border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                        <Link
                            href={`/trips/${trip.id}`}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center text-blue-600 hover:underline"
                        >
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <span className="font-medium text-gray-800">
                                    {trip.title}
                                </span>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center space-x-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {trip.start_date} - {trip.end_date}
                                </span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TripLinks;

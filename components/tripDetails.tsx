import { FrontendTrip } from "@/types/projectTypes"

interface TripDetailsProps {
    trip: FrontendTrip
}

const TripDetails = ({ trip }: TripDetailsProps) => {
    return (
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
    )
}

export default TripDetails
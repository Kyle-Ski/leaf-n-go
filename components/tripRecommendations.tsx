import Link from "next/link";
import { Button } from "./ui/button";

export interface TripRecommendationsProps {
    recommendations: Record<string, string[]> | null;
    loading: boolean;
    error: string | null;
    aiRecommendationFromState?: Record<string, string[]>;
    location: string;
    hasChecklist: boolean;
    setIsUpdateOpen: () => void
}

const TripRecommendations = ({
    recommendations,
    loading,
    error,
    aiRecommendationFromState,
    location,
    hasChecklist,
    setIsUpdateOpen
}: TripRecommendationsProps) => {

    // Determine which recommendations to display
    const hasValidRecommendations = (recs: Record<string, string[]> | null) =>
        recs && Object.keys(recs).length > 0;

    const displayedRecommendations = hasValidRecommendations(recommendations)
        ? recommendations // Use live-streamed recommendations if available and valid
        : aiRecommendationFromState // Otherwise, use the saved recommendation
    return (
        <section className="w-full bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Assistant Recommendations</h2>
            {hasChecklist ? <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-md shadow-md flex items-start gap-2">
                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
                <p className="text-blue-800 font-medium">
                    To save these recommendations, create or link a checklist to this trip. Head over to <Link href="/checklists" className="underline text-blue-600 hover:text-blue-800">
                        Checklists
                    </Link> or <button onClick={(e) => {
                        e.preventDefault();
                        setIsUpdateOpen();
                    }} className="underline text-blue-600 hover:text-blue-800 focus:outline-none">
                        edit
                    </button> this trip.
                </p>
            </div>

                : <></>}
            {process.env.NODE_ENV === "development" ? (<Button
                className="text-blue-500 border border-blue-500 rounded-lg px-4 py-2 text-sm hover:bg-blue-100 transition"
                variant="outline"
                onClick={() => console.log("Rec state:", recommendations)}
                disabled={loading}
            >
                {loading ? "Loading..." : "Show State"}
            </Button>) : <></>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {displayedRecommendations && (
                <div className="recommendations">
                    <h2 className="text-xl font-bold mb-4">
                        {hasValidRecommendations(displayedRecommendations) && `On your trip to ${location}, we suggest:`}
                    </h2>

                    <div className="packing-list">
                        {Object.entries(displayedRecommendations).map(([category, items]) => {
                            return (
                                <div key={category} className="mb-4">
                                    <h3 className="font-semibold text-lg">{category}</h3>
                                    <ul className="text-gray-700 list-disc pl-5 space-y-1">
                                        {items && items.length && items.map((item: string, index: number) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </section>
    )
};

export default TripRecommendations;

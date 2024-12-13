import { Button } from "./ui/button";

export interface TripRecommendationsProps {
    recommendations: {
        location: string;
        isWeatherMismatch: boolean;
        recommendations: Record<string, string>;
    } | null;
    loading: boolean;
    error: string | null;
    getAssistantHelp: () => Promise<void>;
    aiRecommendationFromState?: Record<string, string>;
    location: string;
}

const TripRecommendations = ({
    recommendations,
    loading,
    error,
    getAssistantHelp,
    aiRecommendationFromState,
    location,
}: TripRecommendationsProps) => {

    // Determine which recommendations to display
    const hasValidRecommendations = (recs?: Record<string, string>) =>
        recs && Object.keys(recs).length > 0;
    
    const displayedRecommendations = hasValidRecommendations(recommendations?.recommendations)
        ? recommendations // Use live-streamed recommendations if available and valid
        : aiRecommendationFromState // Otherwise, use the saved recommendation
            ? {
                location, // Since saved recommendations don't include location
                isWeatherMismatch: false,
                recommendations: aiRecommendationFromState,
            }
            : null;    

    return (
        <section className="w-full bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Assistant Recommendations</h2>
            <Button
                className="text-blue-500 border border-blue-500 rounded-lg px-4 py-2 text-sm hover:bg-blue-100 transition"
                variant="outline"
                onClick={getAssistantHelp}
                disabled={loading}
            >
                {loading ? "Loading..." : (hasValidRecommendations(displayedRecommendations?.recommendations) ? "Get New Recommendations" : "Get Recommendations")}
            </Button>
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
                        {hasValidRecommendations(displayedRecommendations.recommendations) && `On your trip to ${displayedRecommendations.location}, we suggest:`}
                    </h2>

                    {displayedRecommendations.isWeatherMismatch && (
                        <p className="text-red-500">
                            Note: Weather data might be inaccurate for this location, or we
                            couldn&apos;t find any data.
                        </p>
                    )}

                    <div className="packing-list">
                        {Object.entries(displayedRecommendations.recommendations).map(([category, items]) => (
                            <div key={category} className="mb-4">
                                <h3 className="font-semibold text-lg">{category}</h3>
                                <p className="text-gray-700 whitespace-pre-line">{items}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
};

export default TripRecommendations;

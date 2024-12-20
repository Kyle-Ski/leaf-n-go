interface RecommendationsListProps {
    displayedRecommendations: Record<string, string[]>;
    location: string;
    hasValidRecommendations: (recs: Record<string, string[]> | null) => boolean | null;
}

export const RecommendationsList = ({
    displayedRecommendations,
    location,
    hasValidRecommendations,
}: RecommendationsListProps) => (
    <div className="recommendations">
        <h2 className="text-xl font-bold mb-4">
            {hasValidRecommendations(displayedRecommendations) &&
                `On your trip to ${location}, we suggest:`}
        </h2>

        <div className="packing-list">
            {Object.entries(displayedRecommendations).map(([category, items]) => (
                <div key={category} className="mb-4">
                    <h3 className="font-semibold text-lg">{category}</h3>
                    <ul className="text-gray-700 list-disc pl-5 space-y-1">
                        {items &&
                            items.length > 0 &&
                            items.map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                            ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

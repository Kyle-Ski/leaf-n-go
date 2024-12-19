import { ChecklistInfoBox } from "./checklistInfoBox";
import { RecommendationInfoBox } from "./recommendationInfoBox";
import { RecommendationsError } from "./recommendationsError";
import { RecommendationsList } from "./recommendationsList";

export interface TripRecommendationsProps {
  recommendations: Record<string, string[]> | null;
  loading: boolean;
  error: string | null;
  aiRecommendationFromState?: Record<string, string[]>;
  location: string;
  hasChecklist: boolean;
  setIsUpdateOpen: () => void;
}

const TripRecommendations = ({
  recommendations,
  loading,
  error,
  aiRecommendationFromState,
  location,
  hasChecklist,
  setIsUpdateOpen,
}: TripRecommendationsProps) => {
  // Determine which recommendations to display
  const hasValidRecommendations = (recs: Record<string, string[]> | null) =>
    recs && Object.keys(recs).length > 0;

  const displayedRecommendations = hasValidRecommendations(recommendations)
    ? recommendations // Use live-streamed recommendations if available and valid
    : aiRecommendationFromState; // Otherwise, use the saved recommendation

  return (
    <section className="w-full bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Assistant Recommendations</h2>

      {hasChecklist && (
        <ChecklistInfoBox />
      )}

      {hasChecklist && (displayedRecommendations
        ? hasValidRecommendations(displayedRecommendations)
        : hasValidRecommendations(recommendations)) && (
        <RecommendationInfoBox setIsUpdateOpen={setIsUpdateOpen} />
      )}

      <RecommendationsError error={error} />

      {displayedRecommendations && (
        <RecommendationsList
          displayedRecommendations={displayedRecommendations}
          location={location}
          hasValidRecommendations={hasValidRecommendations}
        />
      )}
    </section>
  );
};

export default TripRecommendations;

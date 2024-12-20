interface RecommendationsErrorProps {
    error: string | null;
}

export const RecommendationsError = ({ error }: RecommendationsErrorProps) => {
    if (!error) return null;
    return <p className="text-red-500 mt-4">{error}</p>;
};

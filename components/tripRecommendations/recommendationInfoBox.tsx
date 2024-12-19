import Link from "next/link";
import InfoBox from "../informationBox";

interface RecommendationInfoBoxProps {
    setIsUpdateOpen: () => void;
}

export const RecommendationInfoBox = ({ setIsUpdateOpen }: RecommendationInfoBoxProps) => (
    <InfoBox
        message={
            <>
                To save these recommendations, create or link a checklist to this trip.
                Head over to{" "}
                <Link
                    href="/checklists"
                    className="underline text-blue-600 hover:text-blue-800"
                >
                    Checklists
                </Link>{" "}
                or{" "}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsUpdateOpen();
                    }}
                    className="underline text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                    edit
                </button>{" "}
                this trip.
            </>
        }
    />
);

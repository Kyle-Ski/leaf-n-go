import Link from "next/link";
import InfoBox from "../informationBox";

export const ChecklistInfoBox = () => (
    <InfoBox
        message={
            <>
                It looks like you don&apos;t have any checklists linked to this trip yet.
                Head over to{" "}
                <Link
                    href="/checklists"
                    className="underline text-blue-600 hover:text-blue-800"
                >
                    Checklists
                </Link>{" "}
                to add a checklist and unlock more features on this page.
            </>
        }
    />
);

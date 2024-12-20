"use client";

import { useParams } from "next/navigation";
import { withAuth } from "@/lib/withAuth";
import { useAppContext } from "@/lib/appContext";
import ChecklistDetails from "@/components/checklistDetails";

function ChecklistDetailsPage() {
  const { id } = useParams();
  const { state } = useAppContext();

  // Pass all required props down to the reusable component
  return (
    <ChecklistDetails
      id={id as string}
      state={state}
      currentPage="checklists"
    />
  );
}

export default withAuth(ChecklistDetailsPage);

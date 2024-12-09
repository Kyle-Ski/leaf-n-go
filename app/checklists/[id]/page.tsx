"use client";

import { useParams } from "next/navigation";
import { withAuth } from "@/lib/withAuth";
import { useAuth } from "@/lib/auth-Context";
import { useAppContext } from "@/lib/appContext";
import ChecklistDetails from "@/components/checklistDetails";

function ChecklistDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { state } = useAppContext();

  // Pass all required props down to the reusable component
  return (
    <ChecklistDetails
      id={id as string}
      user={user}
      state={state}
    />
  );
}

export default withAuth(ChecklistDetailsPage);

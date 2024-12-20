"use client"

import ChecklistForm from "@/components/checklist/checklistForm";
import { withAuth } from "@/lib/withAuth";
import { useAppContext } from "@/lib/appContext";
import { useRouter } from "next/navigation";

const NewChecklistPage = () => {
    const router = useRouter();
    const { state, dispatch } = useAppContext();

    const handleSubmit = async (data: { title: string; category: string; items: Record<string, number> }) => {
        try {
            const response = await fetch("/api/checklists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: data.title,
                    category: data.category,
                    items: Object.entries(data.items).map(([id, quantity]) => ({
                        id,
                        quantity,
                    })),
                }),
            });

            if (!response.ok) throw new Error("Failed to create checklist.");
            const newChecklist = await response.json();
            dispatch({ type: "ADD_CHECKLIST", payload: newChecklist });
            router.push("/checklists");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6">
            <ChecklistForm onSubmit={handleSubmit} items={state.items} weightUnit={state.user_settings.weight_unit} />
        </div>
    );
};

export default withAuth(NewChecklistPage);

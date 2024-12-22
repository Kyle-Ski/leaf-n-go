"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Suppose you’re using shadcn button
import { CameraScanner } from "@/components/camera/cameraSweep";
import { useParams } from "next/navigation";
import { useAppContext } from "@/lib/appContext";
import ChecklistDetails from "@/components/checklistDetails";

// This might come from Supabase data
const SAMPLE_CHECKLIST_ITEMS = [
    { id: "item-1", name: "banana" },
    { id: "item-2", name: "cup" },
    { id: "item-3", name: "spoon" },
];

export default function ChecklistScannerPage() {
    const { id } = useParams();
    const { state } = useAppContext();
    const items = state.checklists.find((c) => c.id === id)?.items
    const itemNames = items && items.map((item) => item.items.name)
    const [recognizedItems, setRecognizedItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    console.log("ITEMS:", itemNames)
    // Construct an array of the names from the known items
    const knownItemNames = SAMPLE_CHECKLIST_ITEMS.map((item) => item.name.toLowerCase());

    // Map recognized item names back to IDs in the actual checklist
    const recognizedItemIds = SAMPLE_CHECKLIST_ITEMS
        .filter((item) => recognizedItems.includes(item.name.toLowerCase()))
        .map((item) => item.id);

    const handleBulkCheckOff = async () => {
        setLoading(true);
        try {
            // const response = await fetch("/api/checklist-items/bulk-complete", {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         checklistId: "12345", // The real ID from your DB
            //         itemIds: recognizedItemIds,
            //     }),
            // });
            // const data = await response.json();
            // if (!data.success) {
            //     console.error("Bulk check-off failed", data.error);
            // } else {
            //     console.log("Bulk check-off succeeded", data.updatedItems);
            // }
        } catch (err) {
            console.error("Error calling bulk update endpoint", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Checklist Scanner</h1>
            <CameraScanner
                knownItems={knownItemNames}
                onItemsDetected={(items) => {
                    // Update recognized items in state
                    setRecognizedItems(items);
                }}
            />
            <div className="mt-4">
                <Button onClick={handleBulkCheckOff} disabled={loading}>
                    {loading ? "Submitting..." : "Finish Sweep & Check Off"}
                </Button>
            </div>
            {(id && !Array.isArray(id)) && <ChecklistDetails
                id={id}
                state={state}
            />}
            
        </div>
    );
}

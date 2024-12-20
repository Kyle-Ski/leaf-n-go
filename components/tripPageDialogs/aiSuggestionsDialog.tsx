"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpandableCategoryTable from "@/components/expandableAiCategoryTable";
import { ItemDetails, FrontendTrip } from "@/types/projectTypes";

interface AiSuggestionsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    trip: FrontendTrip;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addAiItemToChecklist: (checklistId: string, item: ItemDetails) => Promise<any>;
}

const AiSuggestionsDialog = ({
    isOpen,
    onOpenChange,
    trip,
    addAiItemToChecklist
}: AiSuggestionsDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-2 sm:p-4 rounded-lg">
                <DialogHeader>
                    <DialogTitle>Add Suggestions To Checklist and Inventory</DialogTitle>
                    <DialogDescription>
                        You can choose to add the AI&apos;s recommendations to your inventory and trip checklist.
                    </DialogDescription>
                </DialogHeader>
                <ExpandableCategoryTable
                    data={trip.ai_recommendation}
                    tripChecklists={trip.trip_checklists}
                    onAddToChecklist={addAiItemToChecklist}
                />
            </DialogContent>
        </Dialog>
    );
};

export default AiSuggestionsDialog;

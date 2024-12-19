"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChecklistDetails from "@/components/checklistDetails";
import { useAppContext } from "@/lib/appContext";

interface ChecklistDetailsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedChecklistId: string | null;
}

const ChecklistDetailsDialog = ({ isOpen, onOpenChange, selectedChecklistId }: ChecklistDetailsDialogProps) => {
    const { state } = useAppContext();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-2 sm:p-4 rounded-lg">
                <DialogHeader>
                    <DialogTitle>Checklist</DialogTitle>
                    <DialogDescription>Viewing Checklist Details.</DialogDescription>
                </DialogHeader>
                {isOpen && selectedChecklistId && (
                    <ChecklistDetails
                        id={selectedChecklistId}
                        state={state}
                        currentPage="trips"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ChecklistDetailsDialog;

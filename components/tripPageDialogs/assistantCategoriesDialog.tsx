"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CategorySelector from "@/components/categorySelector";
import { BotIcon } from "lucide-react";

interface AssistantCategoriesDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    displayedRecommendations: Record<string, string[]> | null;
    hasValidRecommendations: (recs: Record<string, string[]> | null) => boolean | null;

    categories: string[];
    customCategory: string;
    setCustomCategory: (val: string) => void;
    handleAddCustomCategory: () => void;
    handleAddCategory: (category: string) => void;
    handleRemoveCategory: (category: string) => void;
    getAssistantHelp: () => void;
}

const AssistantCategoriesDialog = ({
    isOpen,
    onOpenChange,
    loading,
    displayedRecommendations,
    hasValidRecommendations,
    categories,
    customCategory,
    setCustomCategory,
    handleAddCustomCategory,
    handleAddCategory,
    handleRemoveCategory,
    getAssistantHelp
}: AssistantCategoriesDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-2 sm:p-4 rounded-lg">
                <DialogHeader>
                    <DialogTitle>Categories The Assistant Will Respond With</DialogTitle>
                    <DialogDescription className="whitespace-pre-line">
                        {`Select the categories you'd like the assistant to focus on for recommendations.

We have the 10 essentials already picked, feel free to remove them and add your own!

The assistant will always give recommendations for the following: "Specific Location Considerations", "Additional Recommendations", "Pro Tips", and "Weather Forecast Insights"

For example: "I'm going on a road trip to the Grand Canyon and need help with: Flight Considerations, Clothing & Layers, Snacks, Electronics & Personal Items, and Health & Hygiene."

*We're always working on the assistant's recommendations, so some categories you add might not be populated. Please give us feedback in the about page!
`}
                    </DialogDescription>
                </DialogHeader>
                <CategorySelector
                    handleAddCategory={handleAddCategory}
                    customCategory={customCategory}
                    setCustomCategory={setCustomCategory}
                    handleAddCustomCategory={handleAddCustomCategory}
                    categories={categories}
                    handleRemoveCategory={handleRemoveCategory}
                />
                <Button
                    onClick={() => {
                        getAssistantHelp();
                        onOpenChange(false);
                    }}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2"
                >
                    <BotIcon /> {loading ? "Loading Recommendations..." : (hasValidRecommendations(displayedRecommendations) ? "Get New Recommendations" : "Get Recommendations")}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default AssistantCategoriesDialog;

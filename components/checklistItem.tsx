import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChecklistItem, ChecklistItem as ChecklistItemType } from "@/types/projectTypes";
import { CheckedState } from "@radix-ui/react-checkbox";
import { formatWeight } from "@/utils/convertWeight";
import { useAppContext } from "@/lib/appContext";
import { EyeIcon, MapPinMinusInsideIcon } from "lucide-react";

interface ChecklistItemProps {
    item: ChecklistItemType;
    onToggle: (value: CheckedState, item: ChecklistItem) => void;
    onRemove: () => void;
    onViewItem: () => void;
}

const ChecklistItemComponent = ({ item, onToggle, onRemove, onViewItem }: ChecklistItemProps) => {
    const { state } = useAppContext();
    return (
        <li key={item.id} className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
            <div>
                {/* Checkbox for marking item as completed */}
                <Checkbox
                    checked={item.completed}
                    onCheckedChange={(value) => onToggle(value, item)}
                />

                {/* Item Name */}
                <span
                    className={`ml-2 ${item.completed ? "line-through text-gray-500" : ""}`}
                >
                    {item.items.name}
                </span>

                {/* Display category if available */}
                {item.items.item_categories?.name && (
                    <div className="ml-2 text-sm text-gray-500 italic">
                        Category: {item.items.item_categories.name}
                    </div>
                )}

                {/* Display weight if available */}
                {item.items.weight !== undefined && item.items.weight > 0 && (
                    <div className="ml-2 text-sm text-gray-500">
                        Weight: {formatWeight(item.items.weight, state.user_settings.weight_unit)} {state.user_settings.weight_unit}
                    </div>
                )}

                {/* Display notes if available */}
                {item.items.notes && item.items.notes.trim().length > 0 && (
                    <div className="ml-2 mt-1 text-sm text-gray-500 italic">
                        {item.items.notes}
                    </div>
                )}
            </div>

            <div className="flex space-x-2">
                {/* View Button */}
                <Button
                    className="bg-blue-500 text-white"
                    size="sm"
                    onClick={() => onViewItem()}
                >
                    <EyeIcon /> View
                </Button>

                {/* Remove Button */}
                <Button
                    className="bg-yellow-600 text-white"
                    size="sm"
                    onClick={() => onRemove()}
                >
                    <MapPinMinusInsideIcon /> Remove
                </Button>
            </div>
        </li>
    );
};

export default ChecklistItemComponent;

import React, { useState, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Input } from "./ui/input";
import { ItemDetails, UpdatedAiRecommendedItem } from "@/types/projectTypes";
import { toast } from "react-toastify";

interface ExpandableCategoryTableProps {
    data: Record<string, string>; // Categories with items
    onAddToChecklist: (checklistId: string, item: ItemDetails) => Promise<UpdatedAiRecommendedItem>; // Updated to return a Promise
    tripChecklists: {
        checklist_id: string;
        checklists: {
            title: string;
            checklist_items: {
                id: string;
                completed: boolean;
                item_id: string;
            }[];
        }[];
        totalItems: number;
        completedItems: number;
        totalWeight: number;
        currentWeight: number;
    }[];
}

const ExpandableCategoryTable: React.FC<ExpandableCategoryTableProps> = ({
    data,
    onAddToChecklist,
    tripChecklists,
}) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [itemsState, setItemsState] = useState<Record<string, Record<string, any>>>({});
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [buttonsLeft, setButtonsLeft] = useState<Record<string, Set<string>>>({}); // Track buttons per row
    const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const toggleCategory = (category: string) => {
        setExpandedCategory((prev) => (prev === category ? null : category));
    };

    const handleFieldChange = (
        category: string,
        index: number,
        field: string,
        value: string | number
    ) => {
        setItemsState((prevState) => ({
            ...prevState,
            [category]: {
                ...prevState[category],
                [index]: {
                    ...prevState[category]?.[index],
                    [field]: value,
                },
            },
        }));
    };

    const handleAddToChecklist = async (
        checklistId: string,
        currentItem: ItemDetails,
        categoryKey: string,
        itemKey: string
    ) => {
        const uniqueKey = `${itemKey}-${checklistId}`;

        // Set uploading state
        setUploading((prev) => {
            const updated = { ...prev, [uniqueKey]: true };
            return updated;
        });

        try {
            await onAddToChecklist(checklistId, currentItem);

            // Remove button from buttonsLeft
            setButtonsLeft((prev) => {
                const updated = { ...prev };
                updated[itemKey]?.delete(checklistId);

                // If no buttons are left for this item, remove the row
                if (updated[itemKey]?.size === 0) {
                    delete updated[itemKey];
                }
                return updated;
            });
        } catch (error) {
            toast.error(
                "Failed to add item to inventory and checklist. Please try again soon."
            );
            console.error("Failed to add item to checklist:", error);
        } finally {
            // Toast success message
            const checklistName =
                tripChecklists.find((tc) => tc.checklist_id === checklistId)?.checklists[0].title ??
                "Unknown Checklist";
            toast.success(
                `Successfully added ${currentItem.name} to inventory and ${checklistName} checklist!`
            );
            // Remove uploading state
            setUploading((prev) => {
                const updated = { ...prev };
                delete updated[uniqueKey];
                return updated;
            });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white shadow rounded-lg">
            {process.env.NODE_ENV === "development" ? (
                <button onClick={() => console.log("State:", itemsState)}>Show state</button>
            ) : null}
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr>
                        <th className="text-left p-4 border-b">Category</th>
                        <th className="p-4 border-b text-right">Expand</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data).map(([category, items]) => {
                        const itemList = items
                            .split("\n")
                            .filter((item) => item.trim())
                            .map((item) => item.replace(/^- /, "").trim()); // Normalize items
                        const categoryState = itemsState[category] || {};
                        const isExpanded = expandedCategory === category;

                        return buttonsLeft[category]?.size || !buttonsLeft[category] ? ( // Render row if buttons are left
                            <React.Fragment key={category}>
                                {/* Category Row */}
                                <tr>
                                    <td
                                        className="p-4 border-b cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleCategory(category)}
                                    >
                                        <div className="flex items-center">{category}</div>
                                    </td>
                                    <td
                                        className="p-4 border-b text-right cursor-pointer"
                                        onClick={() => toggleCategory(category)}
                                    >
                                        {isExpanded ? (
                                            <ChevronUpIcon className="w-6 h-6 text-gray-600" />
                                        ) : (
                                            <ChevronDownIcon className="w-6 h-6 text-gray-600" />
                                        )}
                                    </td>
                                </tr>

                                {/* Expanded Row */}
                                <tr>
                                    <td colSpan={2} className="p-0">
                                        <div
                                            ref={(el) => {
                                                if (el) contentRefs.current[category] = el;
                                            }}
                                            className={`overflow-hidden transition-all duration-300 ${isExpanded ? "min-h-[4rem] opacity-100" : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            {isExpanded && (
                                                <ul className="p-4 bg-gray-50 space-y-2">
                                                    {itemList.map((item, index) => {
                                                        const currentItem = categoryState[index] || {
                                                            name: item,
                                                            quantity: 1,
                                                            weight: 0,
                                                            notes: "",
                                                        };

                                                        const itemKey = `${category}-${index}`;
                                                        if (!buttonsLeft[itemKey]) {
                                                            // Initialize buttons for this item
                                                            const checklistIds = new Set(
                                                                tripChecklists.map((checklist) => checklist.checklist_id)
                                                            );
                                                            setButtonsLeft((prev) => ({ ...prev, [itemKey]: checklistIds }));

                                                            // Initialize the uploading state for all buttons in this item
                                                            checklistIds.forEach((checklistId) => {
                                                                const uniqueKey = `${itemKey}-${checklistId}`;
                                                                setUploading((prev) => ({ ...prev, [uniqueKey]: false }));
                                                            });
                                                        }

                                                        return buttonsLeft[itemKey]?.size ? (
                                                            <li
                                                                key={index}
                                                                className="grid grid-cols-12 gap-4 items-center bg-white border rounded-md p-4"
                                                            >
                                                                {/* Name */}
                                                                <div className="col-span-6">
                                                                    <Input
                                                                        type="text"
                                                                        value={currentItem.name || ""}
                                                                        onChange={(e) =>
                                                                            handleFieldChange(category, index, "name", e.target.value)
                                                                        }
                                                                        className="w-full p-2 border rounded-md text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Item name"
                                                                    />
                                                                </div>

                                                                {/* Quantity */}
                                                                <div className="col-span-2">
                                                                    <Input
                                                                        type="number"
                                                                        value={currentItem.quantity || 0}
                                                                        onChange={(e) =>
                                                                            handleFieldChange(
                                                                                category,
                                                                                index,
                                                                                "quantity",
                                                                                parseInt(e.target.value, 10) || 0
                                                                            )
                                                                        }
                                                                        className="w-full p-2 border rounded-md text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Qty"
                                                                    />
                                                                </div>

                                                                {/* Weight */}
                                                                <div className="col-span-2">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={currentItem.weight || 0}
                                                                        onChange={(e) =>
                                                                            handleFieldChange(
                                                                                category,
                                                                                index,
                                                                                "weight",
                                                                                parseFloat(e.target.value) || 0
                                                                            )
                                                                        }
                                                                        className="w-full p-2 border rounded-md text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Weight"
                                                                    />
                                                                </div>

                                                                {/* Notes */}
                                                                <div className="col-span-12 mt-2">
                                                                    <Input
                                                                        type="text"
                                                                        value={currentItem.notes || ""}
                                                                        onChange={(e) =>
                                                                            handleFieldChange(category, index, "notes", e.target.value)
                                                                        }
                                                                        className="w-full p-2 border rounded-md text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Notes"
                                                                    />
                                                                </div>

                                                                {/* Add to Checklist Buttons */}
                                                                <div className="col-span-12 mt-4 flex flex-col gap-2">
                                                                    {tripChecklists.map((checklist) => {
                                                                        const uniqueKey = `${itemKey}-${checklist.checklist_id}`;

                                                                        // Check if the button should still be displayed
                                                                        if (!buttonsLeft[itemKey]?.has(checklist.checklist_id)) {
                                                                            return null;
                                                                        }

                                                                        return (
                                                                            <button
                                                                                key={checklist.checklist_id}
                                                                                onClick={() =>
                                                                                    handleAddToChecklist(
                                                                                        checklist.checklist_id,
                                                                                        {
                                                                                            ...currentItem,
                                                                                            item_categories: expandedCategory,
                                                                                        },
                                                                                        category,
                                                                                        itemKey
                                                                                    )
                                                                                }
                                                                                disabled={uploading[uniqueKey]}
                                                                                className={`px-6 py-2 rounded-md ${uploading[uniqueKey]
                                                                                    ? "bg-gray-500 text-white"
                                                                                    : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400"
                                                                                    }`}
                                                                            >
                                                                                {uploading[uniqueKey] ? "Uploading..." : `Add to ${checklist.checklists[0]?.title || "Checklist"}`}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </li>
                                                        ) : null;
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ) : null;
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ExpandableCategoryTable;

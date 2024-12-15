import React, { useState, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Input } from "./ui/input";
import { ItemDetails } from "@/types/projectTypes";

interface ExpandableCategoryTableProps {
    data: Record<string, string>; // Categories with items
    onAddToChecklist: (checklistId: string, item: ItemDetails) => void; // Updated to include checklistId
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
    }[]; // Array of checklists attached to the trip
}

const ExpandableCategoryTable: React.FC<ExpandableCategoryTableProps> = ({
    data,
    onAddToChecklist,
    tripChecklists,
}) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [itemsState, setItemsState] = useState<Record<string, Record<string, any>>>({});
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

                        return (
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
                                            className={`overflow-hidden transition-all duration-300 ${isExpanded ? "min-h-[4rem] opacity-100" : "max-h-0 opacity-0"}`}
                                        >
                                            {isExpanded && (
                                                <ul className="p-4 bg-gray-50 space-y-2">
                                                    {itemList.map((item, index) => {
                                                        // Ensure currentItem always has default values
                                                        const currentItem = categoryState[index] || {
                                                            name: item,
                                                            quantity: 1, // Default quantity
                                                            weight: 0,   // Default weight
                                                            notes: "",   // Default notes
                                                        };

                                                        return (
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
                                                                        value={currentItem.quantity || 0} // Ensure quantity is always a number
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
                                                                        value={currentItem.weight || 0} // Ensure weight is always a number
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
                                                                        value={currentItem.notes || ""} // Ensure notes is always a string
                                                                        onChange={(e) =>
                                                                            handleFieldChange(category, index, "notes", e.target.value)
                                                                        }
                                                                        className="w-full p-2 border rounded-md text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Notes"
                                                                    />
                                                                </div>

                                                                {/* Add to Checklist Buttons */}
                                                                <div className="col-span-12 mt-4 flex flex-col gap-2">
                                                                    {tripChecklists.map((checklist) => (
                                                                        <button
                                                                            key={checklist.checklist_id}
                                                                            onClick={() =>{
                                                                                console.log("checklist.checklist_id")
                                                                                onAddToChecklist(checklist.checklist_id, {
                                                                                    ...currentItem,
                                                                                    item_categories: expandedCategory,
                                                                                })}
                                                                            }
                                                                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                        >
                                                                            Add to {checklist.checklists[0]?.title || "Checklist"}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}

                                                </ul>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ExpandableCategoryTable;

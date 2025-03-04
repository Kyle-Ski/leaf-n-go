"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { ChecklistWithItems, ChecklistItem, ItemDetails, AppState } from "@/types/projectTypes";
import NewItemModal from "@/components/newItemModal";
import { Input } from "@/components/ui/input";
import ConfirmDeleteModal from "@/components/confirmDeleteModal";
import { useAppContext } from "@/lib/appContext";
import ProgressBar from "./progressBar";
import { CheckedState } from "@radix-ui/react-checkbox";
import ChecklistItemComponent from "@/components/checklistItem"
import { formatWeight } from "@/utils/convertWeight";
import { toast } from "react-toastify";
import FloatingActionButton from "./floatingActionButton";
import { PackagePlusIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import DetailedItemView from "./itemDetails";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import ChecklistForm from "./checklist/checklistForm";
import TripLinks from "./tripLinks";

const dontShowDelete = ['trips'];

interface ChecklistDetailsProps {
    id: string;
    state: AppState;
    currentPage?: string
}


function ChecklistDetails({ id, state, currentPage }: ChecklistDetailsProps) {
    const { dispatch } = useAppContext();
    const [checklist, setChecklist] = useState<ChecklistWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("alphabetical-asc");
    const [checklistSearchQuery, setChecklistSearchQuery] = useState<string>("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
    const [isItemModalOpen, setIsViewItemModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const showErrorToast = (error: string | null) => {
        if (error) {
            toast.error(error, {
                position: "top-right",
                autoClose: 5000, // Adjust as needed
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };

    // Example usage in your component
    useEffect(() => {
        if (error) {
            showErrorToast(error);
            setError(null); // Clear the error after displaying
        }
    }, [error]);

    // Determine if any items have been selected
    const hasSelectedItems = Object.keys(selectedItems).length > 0;

    // Handle the "Add Items" button click
    const handleAddItems = async () => {
        // Prepare the payload for the API
        const itemsToAdd = Object.entries(selectedItems).map(([id, quantity]) => ({
            item_id: id, // Aligns with API expectations
            quantity,
            completed: false, // Assuming new items are added as incomplete
        }));

        try {
            // Make the API call to add multiple items
            const response = await fetch(`/api/checklists/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: itemsToAdd }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error('Failed to add items:', errorResponse);
                throw new Error(errorResponse.error || 'Failed to add items');
            }

            // Parse the response data
            const addedItems: ChecklistItem[] = await response.json();

            // Dispatch each added item to the state
            dispatch({ type: "ADD_ITEM_TO_CHECKLIST", payload: addedItems });

            // Update the local checklist state
            setChecklist((prev) =>
                prev
                    ? { ...prev, items: [...prev.items, ...addedItems] }
                    : prev
            );

        } catch (err) {
            console.error("Error adding items:", err);
            setError("Error adding items, try again soon.")
        } finally {
            // Close the modal after adding
            setIsAddModalOpen(false);

            // Reset the selected items
            setSelectedItems({});
        }
    };

    // Handle change event for the number input
    const onNumberInputChange = (value: string, itemId: string) => {
        const quantity = parseInt(value, 10);
        if (!isNaN(quantity)) {
            handleQuantityChange(itemId, quantity);
        }
    };

    // Handle changes in the number input
    const handleQuantityChange = (itemId: string, quantity: number) => {
        setSelectedItems((prevSelected) => {
            const newSelected = { ...prevSelected };
            if (quantity > 0) {
                newSelected[itemId] = quantity;
            } else {
                delete newSelected[itemId];
            }
            return newSelected;
        });
    };

    const deleteChecklist = async () => {
        if (!id) return;

        try {
            const response = await fetch(`/api/checklists/${id}/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to delete checklist.");
            }
            dispatch({
                type: "REMOVE_CHECKLIST",
                payload: id,
            });
            // Redirect to the checklists page after deletion
            window.location.href = "/checklists";
        } catch (err) {
            console.error("Error deleting checklist:", err);
            setError("Failed to delete checklist, try again soon.")
        }
    };

    const calculateCompletion = () => {
        if (!checklist || !checklist.items.length) return { completed: 0, total: 0 };

        const totalItems = checklist.items.length;
        const completedItems = checklist.items.filter((item) => item.completed).length;
        return { completed: completedItems, total: totalItems };
    };

    const { completed, total } = calculateCompletion();
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

    // **New Weight Calculation Function**
    const calculateWeight = () => {
        if (!checklist || !checklist.items.length) return { currentWeight: 0, totalWeight: 0 };

        const totalWeight = checklist.items.reduce((sum, item) => sum + (item.items.weight || 0), 0);
        const currentWeight = checklist.items
            .filter((item) => item.completed)
            .reduce((sum, item) => sum + (item.items.weight || 0), 0);
        const weightPercentage = totalWeight > 0 ? (currentWeight / totalWeight) * 100 : 0;

        return { currentWeight, totalWeight, weightPercentage };
    };

    const { currentWeight, totalWeight, weightPercentage } = calculateWeight();

    // Filter items for Add Item modal based on the search query
    const filteredItems = state.items.filter((item) => {
        const query = searchQuery.toLowerCase();

        const nameMatch = item.name.toLowerCase().includes(query);
        const notesMatch = item.notes?.toLowerCase().includes(query) ?? false;
        const categoryMatch = item.item_categories?.name?.toLowerCase().includes(query) ?? false;

        return nameMatch || notesMatch || categoryMatch;
    });

    const fetchChecklistDetails = async () => {
        setLoading(true);
        if (state.items.length === 0) {
            const fetchItems = async () => {
                try {
                    const response = await fetch(`/api/items`, {
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!response.ok) throw new Error("Failed to fetch items.");
                    const data: ItemDetails[] = await response.json();
                    dispatch({ type: "SET_ITEMS", payload: data });
                } catch (err) {
                    console.error("Failed to fetch items:", err);
                    setError("Failed to get items, try again soon.")
                }
            };
            await fetchItems();
        }

        try {
            const response = await fetch(`/api/checklists/${id}`, {
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Failed to fetch checklist details.");

            const data: ChecklistWithItems = await response.json();
            setChecklist(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load checklist. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchChecklistDetails = async () => {
            setLoading(true);
            if (state.items.length === 0) {
                const fetchItems = async () => {
                    try {
                        const response = await fetch(`/api/items`, {
                            headers: { "Content-Type": "application/json" },
                        });
                        if (!response.ok) throw new Error("Failed to fetch items.");
                        const data: ItemDetails[] = await response.json();
                        dispatch({ type: "SET_ITEMS", payload: data });
                    } catch (err) {
                        console.error("Failed to fetch items:", err);
                        setError("Failed to get items, try again soon.")
                    }
                };
                await fetchItems();
            }

            try {
                const response = await fetch(`/api/checklists/${id}`, {
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) throw new Error("Failed to fetch checklist details.");

                const data: ChecklistWithItems = await response.json();
                setChecklist(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load checklist. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchChecklistDetails();
    }, [id, state.items, dispatch]);

    const calculateRemainingQuantity = (itemId: string): number => {
        if (!checklist) return 0;
        const checklistItems = checklist.items.filter((item) => item.item_id === itemId);
        const totalInChecklist = checklistItems.reduce((sum, item) => sum + item.quantity, 0);
        const item = state.items.find((i) => i.id === itemId) as ItemDetails;

        // Subtract the currently selected quantity from the remaining quantity
        const selectedQuantity = selectedItems[itemId] || 0;
        return item ? item.quantity - totalInChecklist - selectedQuantity : 0;
    };

    const handleRemoveItem = async (itemId: string) => {
        try {
            if (!id) throw new Error("No checklist id");
            const response = await fetch(`/api/checklists/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: itemId }),
            });

            if (!response.ok) throw new Error("Failed to remove item from checklist.");
            toast.success("Successfully removed item from checklist.")
            dispatch({ type: "REMOVE_ITEM_FROM_CHECKLIST", payload: { checklistId: id, itemId } });
            setChecklist((prev) =>
                prev
                    ? { ...prev, items: prev.items.filter((item) => item.id !== itemId) }
                    : prev
            );
        } catch (err) {
            console.error("Error removing item:", err);
            setError("Error removing item, please try again soon.")
        } finally {
            setIsRemoveModalOpen(false);
        }
    };

    const handleSubmit = async (data: { title: string; category: string; items: Record<string, number> }) => {
        try {
            // Transform `items` to the expected API format
            const formattedItems = Object.entries(data.items).map(([item_id, quantity]) => ({
                item_id,
                quantity,
                completed: false, // Assuming all items are incomplete initially
            }));

            // Prepare the payload
            const payload = {
                title: data.title,
                category: data.category,
                items: formattedItems,
            };

            // Make the PUT request
            const response = await fetch(`/api/checklists/${checklist?.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                toast.error(errorResponse.error || "Error Updating Checklist, please try again soon.");
                throw new Error("Failed to update checklist.");
            }

            // Parse the updated checklist
            const updatedChecklist = await response.json();

            // Update the state
            dispatch({ type: "UPDATE_CHECKLIST", payload: updatedChecklist });
            toast.success("Checklist updated successfully!");
            fetchChecklistDetails();
        } catch (err) {
            console.error("Error updating checklist:", err);
        }
    };


    const handleToggleItem = async (value: CheckedState, item: ChecklistItem) => {
        if (!id) {
            setError("Error updating checklist, try again later.");
            return;
        }

        // Optimistically update the checklist state
        const previousChecklist = checklist; // Keep a copy for rollback
        setChecklist((prev) => {
            if (!prev || !prev.items) return prev;
            return {
                ...prev,
                items: prev.items.map((i) =>
                    i.id === item.id ? { ...i, completed: Boolean(value) } : i
                ),
            };
        });

        try {
            // Make the API call
            const response = await fetch(
                `/api/checklists/${id}/items/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        checklistId: id,
                        itemId: item.item_id,
                        completed: value,
                        id: item.id,
                    }),
                }
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Failed to update item status: ${errorMessage}`);
            }

            // Update the checklist in the global state after a successful API call
            dispatch({
                type: "CHECK_ITEM_IN_CHECKLIST",
                payload: { checkedState: value, checklistId: id, itemId: item.id },
            });
        } catch (error) {
            console.error("Error updating item:", error);

            // Revert the optimistic update on error
            setChecklist(previousChecklist);
            setError("Error updating checklist item. Changes reverted.");
        }
    };

    const handleBulkRemoveCompletedItems = async () => {
        try {
            if (!id) throw new Error("No checklist id provided");

            // Get all completed items
            const completedItems = checklist?.items.filter((item) => item.completed);

            if (!completedItems || completedItems.length === 0) {
                toast.info("No completed items to remove.");
                return;
            }

            // Prepare API payload
            const itemIdsToRemove = completedItems.map((item) => item.id);
            // Make API call to remove items from the checklist
            const response = await fetch(`/api/checklists/${id}/bulk-remove`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_ids: itemIdsToRemove }),
            });

            if (!response.ok) {
                throw new Error("Failed to remove completed items from the checklist.");
            }
            // Update the checklist state after removal
            dispatch({
                type: "REMOVE_ITEMS_FROM_CHECKLIST",
                payload: { checklistId: id, itemIds: itemIdsToRemove },
            });

            setChecklist((prev) =>
                prev
                    ? { ...prev, items: prev.items.filter((item) => !itemIdsToRemove.includes(item.id)) }
                    : prev
            );
            toast.success("Successfully removed items from checklist.")

        } catch (err) {
            console.error("Error removing completed items:", err);
            setError("Error removing completed items, please try again soon.");
        }
    };


    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader className="h-12 w-12 text-blue-500" />
        </div>
    );

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">{checklist?.title}</h1>
            {currentPage === "trips" && (
                <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0 mb-2">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="p-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <PackagePlusIcon /> Add Existing Item
                    </Button>
                    <Button
                        onClick={handleBulkRemoveCompletedItems}
                        className="p-2 bg-yellow-600 text-white rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        Remove ✔ed Item(s) From Checklist
                    </Button>
                </div>

            )}
            {currentPage !== "trips" && (<TripLinks  checklistId={id}/>)}
            {!(currentPage && dontShowDelete.includes(currentPage)) && (<FloatingActionButton>
                {!(currentPage && dontShowDelete.includes(currentPage)) && (
                    <Button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="p-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        <TrashIcon /> Delete Checklist
                    </Button>
                )}
                <Button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <PencilIcon /> Edit Checklist
                </Button>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <PackagePlusIcon /> Add Existing Item
                </Button>

                <Button
                    onClick={() => setIsCreateItemModalOpen(true)}
                    className="p-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                    <PlusIcon /> Create New Item
                </Button>

                <Button
                    onClick={handleBulkRemoveCompletedItems}
                    className="p-2 bg-yellow-600 text-white rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                    Remove ✔ed Item(s) From Checklist
                </Button>
            </FloatingActionButton>)}


            {/* **Completion Progress Bar** */}
            <ProgressBar label="Completion" percentage={completionPercentage} color="green" description={total > 0 ? `${completed}/${total} items completed` : "No items in checklist"} />

            {/* **Weight Progress Bar** */}
            <ProgressBar label="Weight Progress" percentage={weightPercentage ? weightPercentage : 0} color="blue" description={totalWeight > 0
                ? `${formatWeight(currentWeight.toFixed(1), state.user_settings.weight_unit)}/${formatWeight(totalWeight.toFixed(1), state.user_settings.weight_unit)} ${state.user_settings.weight_unit}`
                : "No weight data available"} />

            <div className="mb-6 space-y-4">
                {/* Sort Dropdown */}
                <div className="flex flex-col items-center space-y-2">
                    <label
                        htmlFor="sort-options"
                        className="text-sm font-medium text-gray-700"
                    >
                        Sort Items
                    </label>
                    <Select
                        value={sortOption}
                        onValueChange={(e) => setSortOption(e)}
                    >
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select A Sort Option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alphabetical-asc">Alphabetical (A-Z)</SelectItem>
                            <SelectItem value="alphabetical-desc">Alphabetical (Z-A)</SelectItem>
                            <SelectItem value="completed-first">Completed First</SelectItem>
                            <SelectItem value="not-completed-first">Not Completed First</SelectItem>
                            <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                            <SelectItem value="category-desc">Category (Z-A)</SelectItem>
                            <SelectItem value="weight-asc">Weight (Low - High)</SelectItem>
                            <SelectItem value="weight-desc">Weight (High - Low)</SelectItem>
                        </SelectContent>
                    </Select>

                </div>

                {/* Search Bar */}
                <div className="flex flex-col items-center space-y-2">
                    <label
                        htmlFor="search-items"
                        className="text-sm font-medium text-gray-700"
                    >
                        Search Items
                    </label>
                    <input
                        id="search-items"
                        type="text"
                        placeholder="Search items..."
                        value={checklistSearchQuery}
                        onChange={(e) => setChecklistSearchQuery(e.target.value)}
                        className="p-2 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[75%]"
                    />
                </div>
            </div>
            <p className="text-gray-600 mb-4">Category: {checklist?.category}</p>

            <ul className="space-y-4">
                {checklist?.items
                    .filter((item) => {
                        if (!checklistSearchQuery) return true; // Return all items if no query
                        const query = checklistSearchQuery.toLowerCase();
                        const nameMatch = item.items.name.toLowerCase().includes(query);
                        const notesMatch = item.items.notes?.toLowerCase().includes(query) ?? false;
                        const categoryMatch = item.items.item_categories?.name?.toLowerCase().includes(query) ?? false;
                        return nameMatch || notesMatch || categoryMatch;
                    })
                    .sort((a, b) => {
                        // Extract category names
                        const aCategory = a.items.item_categories?.name?.toLowerCase() || "";
                        const bCategory = b.items.item_categories?.name?.toLowerCase() || "";

                        switch (sortOption) {
                            case "alphabetical-asc":
                                return a.items.name.localeCompare(b.items.name);
                            case "alphabetical-desc":
                                return b.items.name.localeCompare(a.items.name);
                            case "completed-first":
                                return Number(b.completed) - Number(a.completed);
                            case "not-completed-first":
                                return Number(a.completed) - Number(b.completed);
                            case "category-asc":
                                return aCategory.localeCompare(bCategory);
                            case "category-desc":
                                return bCategory.localeCompare(aCategory);
                            case "weight-asc":
                                return (a.items.weight || 0) - (b.items.weight || 0);
                            case "weight-desc":
                                return (b.items.weight || 0) - (a.items.weight || 0);
                            default:
                                return 0;
                        }
                    })
                    .map((item) => (
                        <ChecklistItemComponent
                            key={item.id}
                            item={item}
                            onToggle={handleToggleItem}
                            onViewItem={() => {
                                setSelectedItem(item)
                                setIsViewItemModalOpen(true)
                            }} onRemove={() => {
                                setSelectedItem(item);
                                setIsRemoveModalOpen(true);
                            }} />
                    ))}
            </ul>

            {/* Create New Item Modal */}
            <Dialog open={isCreateItemModalOpen} onOpenChange={setIsCreateItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                        <DialogDescription>Create a new item to add to your checklist.</DialogDescription>
                    </DialogHeader>
                    <NewItemModal />
                </DialogContent>
            </Dialog>

            {/* Edit Checklist Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Checklist</DialogTitle>
                        <DialogDescription>Edit the Current Checklist.</DialogDescription>
                    </DialogHeader>
                    {checklist && (<div className="min-h-screen flex flex-col items-center p-6">
                        <ChecklistForm
                            initialData={{
                                title: checklist.title,
                                category: checklist.category,
                                items: checklist.items,
                            }}
                            onSubmit={handleSubmit}
                            items={state.items}
                            weightUnit={state.user_settings.weight_unit}
                        />
                    </div>)}
                </DialogContent>
            </Dialog>

            {/* Detailed Item View Modal */}
            {selectedItem && (
                <Dialog
                    open={isItemModalOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsViewItemModalOpen(false);
                            setSelectedItem(null);
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-center">Item Details</DialogTitle>
                            <DialogDescription className="text-center">
                                View and manage the details of this item. You can edit or delete the item below.
                            </DialogDescription>
                        </DialogHeader>
                        <DetailedItemView
                            itemId={selectedItem.item_id}
                            isOpen={isItemModalOpen}
                            onClose={() => setIsViewItemModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}


            {/* Add Item Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="min-h-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Item to Checklist</DialogTitle>
                        <DialogDescription>Select items to add with specified quantities.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                        <div className="max-h-[500px] overflow-y-auto space-y-2">
                            {filteredItems.map((item) => {
                                const remainingQuantity = calculateRemainingQuantity(item.id);
                                const selectedQuantity = selectedItems[item.id] || 0;

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-md border flex items-center justify-between ${remainingQuantity <= 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            {item.item_categories?.name && (
                                                <span className="block text-xs text-gray-500 italic">
                                                    Category: {item.item_categories.name}
                                                </span>
                                            )}
                                            <div className="text-sm text-gray-600">
                                                Remaining: {calculateRemainingQuantity(item.id)}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {/* Decrement Button */}
                                            <button
                                                type="button"
                                                onClick={() => onNumberInputChange(String(selectedQuantity - 1), item.id)}
                                                disabled={selectedQuantity <= 0}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full 
                                                            bg-red-500 text-white font-bold 
                                                            ${selectedQuantity > 0 ? 'hover:bg-red-600' : 'opacity-50 cursor-not-allowed'}
                                                            transition-all duration-200
                                                          `}
                                            >
                                                -
                                            </button>

                                            {/* Number Input */}
                                            <input
                                                type="number"
                                                min="0"
                                                max={remainingQuantity}
                                                value={selectedQuantity}
                                                onChange={(e) => onNumberInputChange(e.target.value, item.id)}
                                                disabled={remainingQuantity <= 0}
                                                className="w-12 text-center p-1 border rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />

                                            {/* Increment Button */}
                                            <button
                                                type="button"
                                                onClick={() => onNumberInputChange(String(selectedQuantity + 1), item.id)}
                                                disabled={remainingQuantity <= 0}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full 
                                                            bg-green-500 text-white font-bold 
                                                            ${remainingQuantity > 0 ? 'hover:bg-green-600' : 'opacity-50 cursor-not-allowed'}
                                                            transition-all duration-200
                                                          `}
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                        {/* Conditionally render the "Add Items" button */}
                        {hasSelectedItems && (
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleAddItems}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add Items
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Remove Item Modal */}
            <ConfirmDeleteModal
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
                onDelete={() => handleRemoveItem(selectedItem?.id || "")}
                title="Remove Item"
                description={`Are you sure you want to remove ${selectedItem?.items.name} from the checklist?`} deleteButtonText="Remove"
            />

            {/*Delete Dialog*/}
            <ConfirmDeleteModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onDelete={deleteChecklist}
                title="Confirm Deletion of Checklist"
                description="Are you sure you want to delete this checklist? This action cannot be undone."
            />
        </div>
    )
}

export default ChecklistDetails;

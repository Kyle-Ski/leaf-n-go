"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/appContext";
import ConfirmDeleteModal from "@/components/confirmDeleteModal";
import { ItemDetails, Item } from "@/types/projectTypes";
import { formatWeight, kgToLbs, lbsToKg } from "@/utils/convertWeight";
import { toast } from "react-toastify";
import { PencilIcon, TrashIcon } from "lucide-react";

interface DetailedItemViewProps {
    itemId: string;
    isOpen?: boolean;
    onClose?: () => void;
}

const DetailedItemView: React.FC<DetailedItemViewProps> = ({ itemId }) => {
    const router = useRouter();
    const { state, dispatch } = useAppContext();
    const item = state.items.find((i) => i.id === itemId);
    const [loading, setLoading] = useState(!item);
    const [error, setError] = useState<string | null>(null);

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

    // Local state for editing
    const [editItem, setEditItem] = useState({
        name: item?.name || "",
        quantity: item?.quantity || 0,
        weight: item?.weight || 0,
        notes: item?.notes || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category_id: (item as any)?.category_id || null,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    // Update editItem when item changes in global state
    useEffect(() => {
        if (item) {
            const { weight_unit } = state.user_settings;
            const convertedWeight =
                weight_unit === "kg" ? lbsToKg(item.weight) ?? 0 : item.weight;

            setEditItem({
                name: item.name || "",
                quantity: item.quantity || 0,
                weight: convertedWeight,
                notes: item.notes || "",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                category_id: (item as any).category_id || null,
            });
        }
    }, [item, state.user_settings]);

    // Fetch item details if not available in the global state
    useEffect(() => {
        if (item || !itemId || isDeleted) return;

        const fetchItem = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/items/${itemId}`, {
                    headers: { "Content-Type": "application/json", },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch item details.");
                }
                const fetchedItem: ItemDetails = await response.json();
                dispatch({ type: "SET_ITEMS", payload: [...state.items, fetchedItem] }); // Update global state
            } catch (err) {
                console.error(err);
                setError("Unable to load item. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [item, itemId, isDeleted, dispatch, state.items]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setEditItem((prev) => ({
            ...prev,
            [name]: name === "quantity" || name === "weight" ? parseFloat(value) : value,
        }));
    };

    const handleSave = async () => {
        setError(null);
        try {
            const { weight_unit } = state.user_settings;
            let weightInLbs: number;

            if (weight_unit === "kg") {
                const converted = kgToLbs(editItem.weight);
                if (converted === null) {
                    throw new Error("Invalid weight input.");
                }
                weightInLbs = converted;
            } else {
                weightInLbs = editItem.weight;
            }

            const updatedItemData = { ...editItem, weight: weightInLbs };
            setLoading(true)
            const response = await fetch(`/api/items/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedItemData),
            });
            setLoading(false)
            if (!response.ok) {
                throw new Error("Failed to save item.");
            }
            const updatedItem: Item = await response.json();
            toast.success(`Updated ${updatedItem.name} successfully!`);
            dispatch({
                type: "UPDATE_ITEM",
                payload: updatedItem,
            }); // Update global state
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError("Failed to save item. Please try again.");
        }
    };

    const handleDelete = async () => {
        setError(null);
        try {
            const response = await fetch(`/api/items/${itemId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete item.");
            }
            toast.success("Deleted item successfully.")
            dispatch({
                type: "SET_ITEMS",
                payload: state.items.filter((i) => i.id !== itemId),
            }); // Update global state

            setIsDeleted(true);
            router.push("/items");
        } catch (err) {
            console.error(err);
            setError("Failed to delete item. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    if (!item) {
        return <p className="text-gray-600">Item not found.</p>;
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">{item.name}</h1>
            {item.item_categories?.name && (
                <p className="text-sm text-gray-500 italic mb-4">
                    Category: {item.item_categories.name}
                </p>
            )}
            <p className="text-gray-600 mb-4">Notes: {item.notes || "N/A"}</p>
            <p className="text-gray-600 mb-4">Quantity: {item.quantity}</p>
            <p className="text-gray-600 mb-4">Weight: {formatWeight(item.weight, state.user_settings.weight_unit)}{state.user_settings.weight_unit}</p>

            {/* Environmental Insights Placeholder */}
            <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h2 className="font-semibold text-lg mb-2">Environmental Insights</h2>
                <p className="text-gray-600">Coming Soon: Learn about the environmental impact of this item.</p>
            </div>

            {/* Image Placeholder */}
            <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h2 className="font-semibold text-lg mb-2">Item Image</h2>
                <p className="text-gray-600">Coming Soon: Add an image for this item.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <Button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white">
                   <PencilIcon /> Edit Item
                </Button>
                <Button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-500 text-white">
                   <TrashIcon /> Delete Item
                </Button>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                            <DialogDescription>
                                Update the details for this item. Make sure all fields are correct before saving.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <Input
                                    id="edit-name"
                                    type="text"
                                    name="name"
                                    value={editItem.name}
                                    onChange={handleInputChange}
                                    placeholder="Item Name"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700">
                                    Quantity
                                </label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    name="quantity"
                                    value={editItem.quantity}
                                    onChange={handleInputChange}
                                    placeholder="Quantity"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-weight" className="block text-sm font-medium text-gray-700">
                                    Weight ({state.user_settings.weight_unit})
                                </label>
                                <Input
                                    id="edit-weight"
                                    type="number"
                                    name="weight"
                                    value={editItem.weight}
                                    onChange={handleInputChange}
                                    placeholder={`Weight (${state.user_settings.weight_unit})`}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">
                                    Notes
                                </label>
                                <textarea
                                    id="edit-notes"
                                    name="notes"
                                    value={editItem.notes}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md bg-white"
                                    placeholder="Notes"
                                />
                            </div>
                            {/* Display and optionally edit category_id if you have a list of categories */}
                            <div>
                                <label htmlFor="edit-category_id" className="block text-sm font-medium text-gray-700">
                                    Item Category
                                </label>
                                <select
                                    id="edit-category_id"
                                    name="category_id"
                                    value={editItem.category_id || ""}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                >
                                    <option value="">No Category</option>
                                    {state.item_categories?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <div className="flex justify-end space-x-4 mt-4">
                                <Button type="submit" className="bg-blue-500 text-white">
                                    {loading ? `Saving...` : `Save Changes`}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
                title="Confirm Delete Item"
                description="Are you sure you want to delete this item? This action cannot be undone."
            />

        </div>
    );
}
export default DetailedItemView;
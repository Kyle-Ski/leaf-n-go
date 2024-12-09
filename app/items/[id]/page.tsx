"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { useAppContext } from "@/lib/appContext"; // Access shared state
import { withAuth } from "@/lib/withAuth";
import { Input } from "@/components/ui/input";
import ConfirmDeleteModal from "@/components/confirmDeleteModal";

const ItemDetailsPage = () => {
    const router = useRouter();
    const params = useParams();
    const itemId = params?.id;

    const { state, dispatch } = useAppContext(); // Access global state
    const item = state.items.find((i) => i.id === itemId); // Find item in context

    const [loading, setLoading] = useState(!item); // Skip loading if item exists in state
    const [error, setError] = useState<string | null>(null);

    // Local state for editing
    const [editItem, setEditItem] = useState({
        name: item?.name || "",
        quantity: item?.quantity || 0,
        weight: item?.weight || 0,
        notes: item?.notes || "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    // Fetch item details if not available in the global state
    useEffect(() => {
        if (item || !itemId || isDeleted) return;

        const fetchItem = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/items/${itemId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch item details.");
                }
                const fetchedItem = await response.json();
                dispatch({ type: "SET_ITEMS", payload: [...state.items, fetchedItem] }); // Update global state
                setEditItem(fetchedItem); // Set local state for editing
            } catch (err) {
                console.error(err);
                setError("Unable to load item. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [item, itemId, isDeleted, dispatch, state.items]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditItem((prev) => ({
            ...prev,
            [name]: name === "quantity" || name === "weight" ? parseFloat(value) : value,
        }));
    };

    const handleSave = async () => {
        setError(null);
        try {
            const response = await fetch(`/api/items/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editItem),
            });

            if (!response.ok) {
                throw new Error("Failed to save item.");
            }

            const updatedItem = await response.json();
            dispatch({
                type: "SET_ITEMS",
                payload: state.items.map((i) => (i.id === itemId ? updatedItem : i)),
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
            });

            if (!response.ok) {
                throw new Error("Failed to delete item.");
            }

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

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {item ? (
                <>
                    <h1 className="text-2xl font-semibold mb-4">{item.name}</h1>
                    <p className="text-gray-600 mb-4">Notes: {item.notes || "N/A"}</p>
                    <p className="text-gray-600 mb-4">Quantity: {item.quantity}</p>
                    <p className="text-gray-600 mb-4">Weight: {item.weight}kg</p>
                </>
            ) : (
                <p className="text-gray-600">Loading item details...</p>
            )}

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
                    Edit Item
                </Button>
                <Button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-500 text-white">
                    Delete Item
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
                        <form onSubmit={handleSave} className="space-y-4">
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
                                    Weight (kg)
                                </label>
                                <Input
                                    id="edit-weight"
                                    type="number"
                                    name="weight"
                                    value={editItem.weight}
                                    onChange={handleInputChange}
                                    placeholder="Weight (kg)"
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
                            <div className="flex justify-end space-x-4 mt-4">
                                <Button type="submit" className="bg-blue-500 text-white">
                                    Save Changes
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
};

export default withAuth(ItemDetailsPage);

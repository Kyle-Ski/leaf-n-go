"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { withAuth } from "@/lib/withAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewItemModal from "@/components/newItemModal";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/appContext";
import { useAuth } from "@/lib/auth-Context";
import DetailedItemView from "@/components/itemDetails";
import { formatWeight } from "@/utils/convertWeight";
import Link from "next/link";
import { toast } from "react-toastify";

const ItemsPage = () => {
    const { state, dispatch } = useAppContext();
    const { user } = useAuth();
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("name-asc");

    // State to manage the selected item for the modal
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    useEffect(() => {
        if (!state.noItems && state.items.length === 0) {
            // Fetch items only if noItems is false and items array is empty
            const fetchItems = async () => {
                try {
                    const response = await fetch("/api/items", {
                        headers: {
                            "Content-Type": "application/json",
                            "x-user-id": user?.id || "",
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();

                        if (Array.isArray(data) && data.length === 0) {
                            // No items found; set the noItems flag to true
                            dispatch({ type: "SET_NO_ITEMS_FOR_USER", payload: true });
                        } else {
                            // Items found; update the AppState with fetched items
                            dispatch({ type: "SET_ITEMS", payload: data });
                            dispatch({ type: "SET_NO_ITEMS_FOR_USER", payload: false }); // Reset noItems if items exist
                        }
                    } else {
                        toast.error("Failed to load items.");
                        console.error("Failed to fetch items:", response.statusText);
                    }
                } catch (err) {
                    console.error("Failed to fetch items:", err);
                    toast.error("An error occurred while fetching items.");
                }
            };

            fetchItems();
        }
    }, [dispatch, state.items, state.noItems, user?.id]);

    const items = state.items;

    // Filter items based on the search query (name and notes)
    const filteredItems = items
        .filter((item) => {
            const query = searchQuery.toLowerCase();

            const nameMatch = item.name.toLowerCase().includes(query);
            const notesMatch = item.notes?.toLowerCase().includes(query) ?? false;
            const categoryMatch = item.item_categories?.name?.toLowerCase().includes(query) ?? false;

            return nameMatch || notesMatch || categoryMatch;
        })
        .sort((a, b) => {
            // Extract category names, defaulting to empty string if none
            const aCategory = a.item_categories?.name?.toLowerCase() || "";
            const bCategory = b.item_categories?.name?.toLowerCase() || "";

            switch (sortOption) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "weight-asc":
                    return (a.weight || 0) - (b.weight || 0);
                case "weight-desc":
                    return (b.weight || 0) - (a.weight || 0);
                case "quantity-asc":
                    return (a.quantity || 0) - (b.quantity || 0);
                case "quantity-desc":
                    return (b.quantity || 0) - (a.quantity || 0);
                case "category-asc":
                    return aCategory.localeCompare(bCategory);
                case "category-desc":
                    return bCategory.localeCompare(aCategory);
                default:
                    return 0;
            }
        });

    // If there are no items in state, show a loading state
    if (!state.noItems && (!items || items.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader className="h-12 w-12 mb-4 text-blue-500" />
                <p className="text-gray-600 text-lg">Loading Items...</p>
            </div>
        );
    }

    return (
        <>
            {state.noItems ? (
                <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                    <p className="text-gray-600 text-lg">You don’t have any items yet. Try creating your first item!</p>
                    <Button
                        onClick={() => setIsCreateItemModalOpen(true)}
                        className="bg-green-500 text-white"
                    >
                        Create New Item
                    </Button>
                    <Link href="/items/bulk" passHref>
                        <Button className="bg-blue-500 text-white">
                            Bulk Upload Items
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="p-4 max-w-4xl mx-auto space-y-8">
                    <h1 className="text-2xl font-semibold">Your Items</h1>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center">
                        <Button
                            onClick={() => setIsCreateItemModalOpen(true)}
                            className="bg-green-500 text-white"
                        >
                            Create New Item
                        </Button>
                        <Link href="/items/bulk" passHref>
                            <Button className="bg-blue-500 text-white">
                                Bulk Upload Items
                            </Button>
                        </Link>
                        <div className="flex flex-col space-y-1 sm:space-y-0">
                            <label htmlFor="sort-options" className="text-sm font-medium text-gray-700">
                                Sort By
                            </label>
                            <select
                                id="sort-options"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="p-2 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="weight-asc">Weight (Low-High)</option>
                                <option value="weight-desc">Weight (High-Low)</option>
                                <option value="quantity-asc">Quantity (Low-High)</option>
                                <option value="quantity-desc">Quantity (High-Low)</option>
                                <option value="category-asc">Category (A-Z)</option>
                                <option value="category-desc">Category (Z-A)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
                        <label htmlFor="search-bar" className="text-sm font-medium text-gray-700">
                            Search Items
                        </label>
                        <Input
                            id="search-bar"
                            type="text"
                            placeholder="Search by name or notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full lg:w-auto lg:flex-grow p-2 border rounded-md"
                        />
                    </div>

                    <ul className="space-y-4">
                        {filteredItems.map((item) => (
                            <li
                                key={item.id}
                                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    setSelectedItemId(item.id);
                                    setIsItemModalOpen(true);
                                }}
                            >
                                <div className="flex justify-between items-start md:items-center">
                                    <div className="flex flex-col space-y-1">
                                        <p className="font-semibold">{item.name}</p>
                                        {item.item_categories?.name && (
                                            <p className="text-xs text-gray-500 italic">
                                                Category: {item.item_categories.name}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">Notes: {item.notes || "N/A"}</p>
                                    </div>
                                    <div className="flex flex-col text-right space-y-1">
                                        <p className="text-sm">Quantity: {item.quantity}</p>
                                        <p className="text-sm">Weight: {formatWeight(item.weight, state.user_settings.weight_unit)}{state.user_settings.weight_unit}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* Create New Item Modal */}
            <Dialog open={isCreateItemModalOpen} onOpenChange={setIsCreateItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">Create Item</DialogTitle>
                        <DialogDescription className="text-center">Add a new item to your gear list.</DialogDescription>
                    </DialogHeader>
                    <NewItemModal
                        userId={user?.id || ""}
                    />
                </DialogContent>
            </Dialog>

            {/* Detailed Item View Modal */}
            {selectedItemId && (
                <Dialog
                    open={isItemModalOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsItemModalOpen(false);
                            setSelectedItemId(null);
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
                            itemId={selectedItemId}
                            isOpen={isItemModalOpen}
                            onClose={() => setIsItemModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
export default withAuth(ItemsPage);
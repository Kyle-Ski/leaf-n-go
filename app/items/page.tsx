"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { withAuth } from "@/lib/withAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewItemModal from "@/components/newItemModal";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/appContext";
import { useAuth } from "@/lib/auth-Context";

const ItemsPage = () => {
    const { state, dispatch } = useAppContext();
    const { user } = useAuth();
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("name-asc");

    useEffect(() => {
        if (state.items.length === 0) {
            const fetchItems = async () => {
                try {
                    const response = await fetch("/api/items", { headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" } });
                    if (response.ok) {
                        const data = await response.json();
                        dispatch({ type: "SET_ITEMS", payload: data });
                    }
                } catch (err) {
                    console.error("Failed to fetch items:", err);
                }
            };

            fetchItems();
        }
    }, [dispatch, state.items]);

    const items = state.items;

    // Filter items based on the search query (name and notes)
    const filteredItems = items
        .filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            switch (sortOption) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "weight-asc":
                    return a.weight - b.weight;
                case "weight-desc":
                    return b.weight - a.weight;
                case "quantity-asc":
                    return a.quantity - b.quantity;
                case "quantity-desc":
                    return b.quantity - a.quantity;
                default:
                    return 0;
            }
        });

    // If there are no items in state, show a message or loading spinner
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader className="h-12 w-12 mb-4 text-blue-500" />
                <p className="text-gray-600 text-lg">Loading Items...</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-semibold">Your Items</h1>
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center">
                <Button
                    onClick={() => setIsCreateItemModalOpen(true)}
                    className="bg-green-500 text-white"
                >
                    Create New Item
                </Button>
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
                    placeholder="Search by name, or notes.."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full lg:w-auto lg:flex-grow p-2 border rounded-md"
                />
            </div>

            <ul className="space-y-4">
                {filteredItems.map((item) => (
                    <li
                        key={item.id}
                        className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                        <Link href={`/items/${item.id}`} className="flex justify-between items-start md:items-center">
                            <div className="flex flex-col space-y-1">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-500">Notes: {item.notes || "N/A"}</p>
                            </div>
                            <div className="flex flex-col text-right space-y-1">
                                <p className="text-sm">Quantity: {item.quantity}</p>
                                <p className="text-sm">Weight: {item.weight}kg</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Create New Item Modal */}
            <Dialog open={isCreateItemModalOpen} onOpenChange={setIsCreateItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                    </DialogHeader>
                    <NewItemModal
                        userId={user?.id || ""} // User ID is no longer needed here
                        onItemAdded={(newItem) => {
                            dispatch({ type: "ADD_ITEM", payload: newItem });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default withAuth(ItemsPage);

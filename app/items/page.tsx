"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-Context";
import { Loader } from "@/components/ui/loader";
import { withAuth } from "@/lib/withAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewItemForm from "@/components/newItemForm";
import { Input } from "@/components/ui/input";

interface Item {
    id: string;
    name: string;
    quantity: number;
    weight: number;
    notes: string;
}

const ItemsPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState<string>("")

    // Filter items based on the search query
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (!user) return;

        const fetchItems = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/items", {
                    headers: {
                        "x-user-id": user.id,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch items.");
                }

                const data = await response.json();
                setItems(data);
            } catch (err) {
                console.error("Error fetching items:", err);
                setError("Unable to load items. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [user]);


    return (
        <div className="p-4 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-semibold">Your Items</h1>
            <Button
                onClick={() => setIsCreateItemModalOpen(true)}
                className="bg-green-500 text-white"
            >
                Create New Item
            </Button>
            <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded-md"
            />
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <Loader className="h-12 w-12 mb-4 text-blue-500" />
                    <p className="text-gray-600 text-lg">Loading Items...</p>
                </div>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <ul className="space-y-4">
                    {items.map((item) => (
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
            )}

            {/* Create New Item Modal */}
            <Dialog open={isCreateItemModalOpen} onOpenChange={setIsCreateItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                    </DialogHeader>
                    <NewItemForm
                        userId={user?.id || ""}
                        onItemAdded={(newItem) => {
                            setItems((prev) => [...prev, newItem]);
                        }}
                    />

                </DialogContent>
            </Dialog>

        </div>
    );
}

export default withAuth(ItemsPage);
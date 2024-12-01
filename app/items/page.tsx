"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-Context";
import { Loader } from "@/components/ui/loader";

interface Item {
    id: string;
    name: string;
    quantity: number;
    weight: number;
    notes: string;
}

export default function ItemsPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newItem, setNewItem] = useState({
        name: "",
        quantity: 1,
        weight: 0,
        notes: "",
    });

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewItem((prev) => ({
            ...prev,
            [name]: name === "quantity" || name === "weight" ? parseFloat(value) : value,
        }));
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError("User is not authenticated.");
            return;
        }

        try {
            const response = await fetch("/api/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user.id,
                },
                body: JSON.stringify(newItem),
            });

            if (!response.ok) {
                throw new Error("Failed to add new item.");
            }

            const addedItem = await response.json();
            setItems((prev) => [...prev, addedItem]);
            setNewItem({ name: "", quantity: 1, weight: 0, notes: "" });
        } catch (err) {
            console.error("Error adding item:", err);
            setError("Unable to add item. Please try again later.");
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-semibold">Your Items</h1>

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

            <h2 className="text-xl font-semibold">Add a New Item</h2>
            <form
                onSubmit={handleAddItem}
                className="space-y-4 p-4 bg-gray-100 rounded-lg shadow-md"
            >
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        value={newItem.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                        Quantity
                    </label>
                    <Input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={newItem.quantity}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                        Weight (kg)
                    </label>
                    <Input
                        type="number"
                        id="weight"
                        name="weight"
                        value={newItem.weight}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={newItem.notes}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Enter any additional notes..."
                    />
                </div>
                <Button type="submit" className="bg-blue-500 text-white">
                    Add Item
                </Button>
            </form>
        </div>
    );
}

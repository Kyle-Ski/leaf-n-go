"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-Context";
import { useRouter } from "next/navigation";
import { withAuth } from "@/lib/withAuth";
import NewItemForm from "@/components/newItemForm";
import { ItemDetails } from "@/types/projectTypes";

const NewChecklistPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [items, setItems] = useState<ItemDetails[]>([]);
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const newItemFormRef = useRef<HTMLDivElement>(null); // Reference for scrolling to the form

    const categories = ["Day Trip", "Overnight", "Weekend Trip"];

    useEffect(() => {
        if (user) {
            fetchItems();
        }
    }, [user]);

    const fetchItems = async () => {
        setError(null); // Reset error before fetching
        try {
            const response = await fetch("/api/items", {
                method: "GET",
                headers: {
                    "x-user-id": user?.id || "",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to fetch items.");
                return;
            }

            const fetchedItems: ItemDetails[] = await response.json();
            setItems(fetchedItems);
        } catch (err) {
            console.error("Network error while fetching items:", err);
            setError("Unable to load items. Please check your network connection.");
        }
    };

    const handleItemQuantityChange = (itemId: string, quantity: number) => {
        setSelectedItems((prev) => {
            const updated = { ...prev };
            if (quantity > 0) {
                updated[itemId] = quantity;
            } else {
                delete updated[itemId];
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError("User is not authenticated.");
            return;
        }

        if (!title || !category) {
            setError("Title and category are required.");
            return;
        }

        try {
            const response = await fetch("/api/checklists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    title,
                    category,
                    items: Object.entries(selectedItems).map(([id, quantity]) => ({
                        id,
                        quantity,
                    })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to create checklist.");
                return;
            }

            router.push("/checklists");
        } catch (err) {
            console.error("Error creating checklist:", err);
            setError("An unexpected error occurred. Please try again later.");
        }
    };

    const scrollToNewItemForm = () => {
        newItemFormRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center space-y-8 p-6">
            {/* Checklist Form */}
            <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 text-center">Create New Checklist</h1>
                {/* Add New Item Button */}
                <button
                    onClick={scrollToNewItemForm}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                    Add New Item
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block font-semibold text-gray-700">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="Enter a checklist title"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block font-semibold text-gray-700">
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            required
                        >
                            <option value="" disabled>
                                Select a category
                            </option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold text-gray-700">Add Items</label>
                        <div className="space-y-4">
                            {error ? (
                                <p className="text-red-500">{error}</p>
                            ) : items.length === 0 ? (
                                <p className="text-gray-500">No items found. Add items to your inventory first.</p>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between space-x-4">
                                        <label htmlFor={`item-${item.id}`} className="text-gray-700 flex-grow">
                                            {item.name} (Available: {item.quantity})
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            {/* Decrement Button */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleItemQuantityChange(
                                                        item.id,
                                                        Math.max((selectedItems[item.id] || 0) - 1, 0)
                                                    )
                                                }
                                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                            >
                                                -
                                            </button>
                                            {/* Number Input */}
                                            <input
                                                id={`item-${item.id}`}
                                                type="text"
                                                value={selectedItems[item.id] || 0}
                                                readOnly
                                                className="w-16 bg-gray-100 text-center border border-gray-300 rounded-md text-gray-700"
                                            />
                                            {/* Increment Button */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleItemQuantityChange(
                                                        item.id,
                                                        Math.min((selectedItems[item.id] || 0) + 1, item.quantity)
                                                    )
                                                }
                                                className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Create Checklist
                    </button>
                </form>
            </div>

            {/* New Item Form */}
            <div ref={newItemFormRef} className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Add a New Item</h2>
                <NewItemForm
                    userId={user?.id || ""}
                    onItemAdded={(newItem) => {
                        setItems((prev) => [...prev, newItem]);
                    }}
                />
            </div>
        </div>
    );
};

export default withAuth(NewChecklistPage);

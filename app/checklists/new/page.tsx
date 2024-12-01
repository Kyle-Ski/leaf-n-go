"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-Context';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';

interface Item {
    id: string;
    name: string;
    quantity: number;
    weight: string;
    notes: string;
}

const NewChecklistPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const categories = ['Day Trip', 'Overnight', 'Weekend Trip'];

    useEffect(() => {
        if (user) {
            fetchItems();
        }
    }, [user]);

    const fetchItems = async () => {
        setError(null); // Reset error before fetching
        try {
            const response = await fetch('/api/items', {
                method: 'GET',
                headers: {
                    'x-user-id': user?.id || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch items.');
                return;
            }

            const fetchedItems: Item[] = await response.json();
            setItems(fetchedItems);
        } catch (err) {
            console.error('Network error while fetching items:', err);
            setError('Unable to load items. Please check your network connection.');
        }
    };

    const handleItemToggle = (itemId: string) => {
        setSelectedItems((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError('User is not authenticated.');
            return;
        }

        if (!title || !category) {
            setError('Title and category are required.');
            return;
        }

        try {
            const response = await fetch('/api/checklists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    title,
                    category,
                    items: selectedItems.map((id) => ({ id, quantity: 1 })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to create checklist.');
                return;
            }

            router.push('/checklists');
        } catch (err) {
            console.error('Error creating checklist:', err);
            setError('An unexpected error occurred. Please try again later.');
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 text-center">Create New Checklist</h1>
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
                        <div className="space-y-2">
                            {error ? (
                                <p className="text-red-500">{error}</p>
                            ) : items.length === 0 ? (
                                <p className="text-gray-500">No items found. Add items to your inventory first.</p>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id={item.id}
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleItemToggle(item.id)}
                                            className="w-5 h-5 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <label htmlFor={item.id} className="text-gray-700">
                                            {item.name}
                                        </label>
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
        </div>
    );
};

export default withAuth(NewChecklistPage);

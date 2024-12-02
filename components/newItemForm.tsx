"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { ItemDetails } from "@/types/projectTypes";

interface NewItemFormProps {
  userId: string;
  onItemAdded: (newItem: ItemDetails) => void;
}

const NewItemForm: React.FC<NewItemFormProps> = ({ userId, onItemAdded }) => {
  const [name, setName] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [weight, setWeight] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          name,
          quantity,
          weight,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create item.");
      }

      const newItem: ItemDetails = await response.json();
      onItemAdded(newItem);

      // Reset form fields
      setName("");
      setQuantity(1);
      setWeight(0);
      setNotes("");

      // Set success message
      setSuccess("Item created successfully!");
    } catch (err) {
      console.error("Error creating item:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[300px] flex items-center justify-center">
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full">
          <Loader className="h-12 w-12 mb-4 text-blue-500" />
          <p className="text-gray-600 text-lg">Creating Item...</p>
        </div>
      ) : (
        <form onSubmit={handleCreateItem} className="space-y-4 w-full">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <Input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              min={1}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (kg)
            </label>
            <Input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              required
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-md bg-white text-gray-700"
              placeholder="Add any notes about this item"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"}`}
          >
            {loading ? "Creating..." : "Create Item"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default NewItemForm;
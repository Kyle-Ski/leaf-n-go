"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { withAuth } from "@/lib/withAuth";
import { useAuth } from "@/lib/auth-Context";
import { Loader } from "@/components/ui/loader";
import {
  ChecklistWithItems,
  ChecklistItem,
  ItemDetails,
} from "@/types/projectTypes";

function ChecklistDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<ChecklistWithItems | null>(null);
  const [items, setItems] = useState<ItemDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);

  useEffect(() => {
    if (!user || !id) return;

    const fetchChecklistDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/checklists/${id}`, {
          headers: { "x-user-id": user.id },
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

    const fetchItems = async () => {
      try {
        const response = await fetch(`/api/items`, {
          headers: { "x-user-id": user?.id },
        });
        if (!response.ok) throw new Error("Failed to fetch items.");
        const data: ItemDetails[] = await response.json();
        setItems(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChecklistDetails();
    fetchItems();
  }, [user, id]);

  const calculateRemainingQuantity = (itemId: string): number => {
    if (!checklist) return 0;
    const checklistItems = checklist.items.filter((item) => item.item_id === itemId);
    const totalInChecklist = checklistItems.reduce((sum, item) => sum + item.quantity, 0);
    const item = items.find((i) => i.id === itemId);
    return item ? item.quantity - totalInChecklist : 0;
  };

  const handleAddItem = async (item: ItemDetails) => {
    try {
      const remainingQuantity = calculateRemainingQuantity(item.id);
      if (remainingQuantity <= 0) return;

      const response = await fetch(`/api/checklists/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          checklist_id: id,
          item_id: item.id,
          quantity: 1,
          completed: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to add item to checklist.");
      const addedItem: ChecklistItem = await response.json();
      setChecklist((prev) =>
        prev
          ? { ...prev, items: [...prev.items, addedItem] }
          : prev
      );
    } catch (err) {
      console.error("Error adding item:", err);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": user?.id || "" },
        body: JSON.stringify({ item_id: itemId }),
      });

      if (!response.ok) throw new Error("Failed to remove item from checklist.");
      setChecklist((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((item) => item.id !== itemId) }
          : prev
      );
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setIsRemoveModalOpen(false);
    }
  };

  if (loading) return <Loader className="h-12 w-12 text-blue-500" />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{checklist?.title}</h1>
      <p className="text-gray-600 mb-4">Category: {checklist?.category}</p>

      <ul className="space-y-4">
        {checklist?.items.map((item) => (
          <li
            key={item.id}
            className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <Checkbox
                checked={item.completed}
                onCheckedChange={async (value) => {
                  const response = await fetch(`/api/checklists/${id}/items/${item.id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      "x-user-id": user?.id || "",
                    },
                    body: JSON.stringify({
                      checklistId: id,
                      itemId: item.item_id,
                      completed: value,
                      id: item.id
                    }),
                  })
                  if (!response.ok) {
                    const errorMessage = await response.text(); // Capture detailed API error
                    throw new Error(`Failed to update item status: ${errorMessage}`);
                  }

                  // Optimistically update the checklist UI
                  setChecklist((prev) => {
                    if (!prev || !prev.items) return prev; // Handle null or undefined state
                  
                    return {
                      ...prev,
                      items: prev.items.map((i) =>
                        i.id === item.id ? { ...i, completed: Boolean(value) } : i
                      ),
                    };
                  });                  
                }
                }
              />
              <span
                className={`ml-2 ${item.completed ? "line-through text-gray-500" : ""
                  }`}
              >
                {item.items.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItem(item);
                setIsRemoveModalOpen(true);
              }}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 text-white">
          Add Item
        </Button>
      </div>

      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Checklist</DialogTitle>
            <DialogDescription>Select an item to add.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {items.map((item) => {
              const remainingQuantity = calculateRemainingQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-2 rounded-md cursor-pointer ${remainingQuantity <= 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  onClick={() =>
                    remainingQuantity > 0 && handleAddItem(item)
                  }
                >
                  {item.name} (Remaining: {remainingQuantity})
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Item Modal */}
      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedItem?.items.name} from the checklist?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => handleRemoveItem(selectedItem?.id || "")}
              className="bg-red-500 text-white"
            >
              Remove
            </Button>
            <Button onClick={() => setIsRemoveModalOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuth(ChecklistDetailsPage);

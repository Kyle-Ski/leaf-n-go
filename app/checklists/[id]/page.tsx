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
  Item,
} from "@/types/projectTypes";
import NewItemModal from "@/components/newItemModal";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/appContext";

function ChecklistDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { state, dispatch } = useAppContext();
  const [checklist, setChecklist] = useState<ChecklistWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("alphabetical-asc");
  const [checklistSearchQuery, setChecklistSearchQuery] = useState<string>("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteChecklist = async () => {
    if (!id || !user) return;

    try {
      const response = await fetch(`/api/checklists/${id}/delete`, {
        method: "DELETE",
        headers: { "x-user-id": user.id },
      });

      if (!response.ok) {
        throw new Error("Failed to delete checklist.");
      }
      dispatch({
        type: "REMOVE_CHECKLIST",
        payload: id,
      });
      // Redirect to the checklists page after deletion
      window.location.href = "/checklists";
    } catch (err) {
      console.error("Error deleting checklist:", err);
      alert("Failed to delete checklist. Please try again.");
    }
  };

  const calculateCompletion = () => {
    if (!checklist || !checklist.items.length) return { completed: 0, total: 0 };

    const totalItems = checklist.items.length;
    const completedItems = checklist.items.filter((item) => item.completed).length;

    return { completed: completedItems, total: totalItems };
  };

  const { completed, total } = calculateCompletion();
  const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

  // Filter items based on the search query
  const filteredItems = state.items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!user || !id) return;

    const fetchChecklistDetails = async () => {
      setLoading(true);
      if (state.items.length === 0) {
        const fetchItems = async () => {
          try {
            const response = await fetch(`/api/items`, {
              headers: { "x-user-id": user?.id },
            });
            if (!response.ok) throw new Error("Failed to fetch items.");
            const data: ItemDetails[] = await response.json();
            dispatch({ type: "SET_ITEMS", payload: data });
          } catch (err) {
            console.error("Failed to fetch items:", err);
          }
        };
        fetchItems();
      }

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
    fetchChecklistDetails();
  }, [user, id, state.items, dispatch]);

  const calculateRemainingQuantity = (itemId: string): number => {
    if (!checklist) return 0;
    const checklistItems = checklist.items.filter((item) => item.item_id === itemId);
    const totalInChecklist = checklistItems.reduce((sum, item) => sum + item.quantity, 0);
    const item = state.items.find((i) => i.id === itemId) as ItemDetails;
    return item ? item.quantity - totalInChecklist : 0;
  };

  const handleAddItem = async (item: ItemDetails | Item ) => {
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

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="bg-red-500 text-white"
        >
          Delete Checklist
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-gray-700">Completion</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500 mt-2 block">
          {total > 0 ? `${completed}/${total} items completed` : "No items in checklist"}
        </span>
      </div>
      <div className="mb-6 space-y-4">
        {/* Sort Dropdown */}
        <div className="flex flex-col items-center space-y-2">
          <label
            htmlFor="sort-options"
            className="text-sm font-medium text-gray-700"
          >
            Sort Items
          </label>
          <select
            id="sort-options"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="alphabetical-asc">Alphabetical (A-Z)</option>
            <option value="alphabetical-desc">Alphabetical (Z-A)</option>
            <option value="completed-first">Completed First</option>
            <option value="not-completed-first">Not Completed First</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col items-center space-y-2">
          <label
            htmlFor="search-items"
            className="text-sm font-medium text-gray-700"
          >
            Search Items
          </label>
          <input
            id="search-items"
            type="text"
            placeholder="Search items..."
            value={checklistSearchQuery}
            onChange={(e) => setChecklistSearchQuery(e.target.value)}
            className="p-2 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[75%]"
          />
        </div>
      </div>
      <p className="text-gray-600 mb-4">Category: {checklist?.category}</p>

      <ul className="space-y-4">
        {checklist?.items
          .filter((item) =>
            item.items.name.toLowerCase().includes(checklistSearchQuery.toLowerCase())
          )
          .sort((a, b) => {
            if (sortOption === "alphabetical-asc") {
              return a.items.name.localeCompare(b.items.name);
            } else if (sortOption === "alphabetical-desc") {
              return b.items.name.localeCompare(a.items.name);
            } else if (sortOption === "completed-first") {
              return Number(b.completed) - Number(a.completed);
            } else if (sortOption === "not-completed-first") {
              return Number(a.completed) - Number(b.completed);
            }
            return 0;
          })
          .map((item) => (
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

      <div className="mt-6 space-x-4">
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 text-white">
          Add Existing Item
        </Button>
        <Button
          onClick={() => setIsCreateItemModalOpen(true)}
          className="bg-green-500 text-white"
        >
          Create New Item
        </Button>
      </div>

      {/* Create New Item Modal */}
      <Dialog open={isCreateItemModalOpen} onOpenChange={setIsCreateItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          <NewItemModal
            userId={user?.id || ""}
            onItemAdded={(newItem) => {
              dispatch({ type: "ADD_ITEM", payload: newItem });
            }}
          />

        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Checklist</DialogTitle>
            <DialogDescription>Select an item to add.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredItems.map((item) => {
                const remainingQuantity = calculateRemainingQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-2 rounded-md cursor-pointer ${remainingQuantity <= 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    onClick={() => remainingQuantity > 0 && handleAddItem(item)}
                  >
                    {item.name} (Remaining: {remainingQuantity})
                  </div>
                );
              })}
            </div>
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

      {/*Delete Dialog*/}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this checklist? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={deleteChecklist}
              className="bg-red-500 text-white"
            >
              Delete
            </Button>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuth(ChecklistDetailsPage);

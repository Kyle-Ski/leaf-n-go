import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackagePlusIcon, PlusIcon, SaveIcon } from "lucide-react";
import { formatWeight } from "@/utils/convertWeight";
import { toast } from "react-toastify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import NewItemModal from "../newItemModal";
import FloatingActionButton from "../floatingActionButton";
import { ChecklistItem } from "@/types/projectTypes";

interface ChecklistFormProps {
    initialData?: {
        title: string;
        category: string;
        items: ChecklistItem[];
    };
    onSubmit: (data: { title: string; category: string; items: Record<string, number> }) => void;
    items: Array<{ id: string; name: string; weight: number; quantity: number }>;
    weightUnit: "kg" | "lbs";
}

const ChecklistForm = ({ initialData, onSubmit, items, weightUnit }: ChecklistFormProps) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
        initialData?.items.reduce((acc, checklistItem) => {
            const currentQuantity = acc[checklistItem.item_id] || 0;
            acc[checklistItem.item_id] = currentQuantity + checklistItem.quantity;
            return acc;
        }, {} as Record<string, number>) || {}
    );
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);

    const totalWeight = useMemo(() => {
        return Object.entries(selectedItems).reduce((sum, [itemId, quantity]) => {
            const item = items.find((item) => item.id === itemId);
            return item?.weight ? sum + item.weight * quantity : sum;
        }, 0);
    }, [selectedItems, items]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category) {
            return toast.error("Title and category are required.");
        }
        onSubmit({ title, category, items: selectedItems });
    };

    return (
        <div>
            <form id="checklist-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block font-semibold text-gray-700">
                        Checklist Title
                    </label>
                    <Input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border rounded-lg p-3"
                        placeholder="Enter a checklist title"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category" className="block font-semibold text-gray-700">
                        Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a Category">
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {["Day Trip", "Overnight", "Weekend Trip"].map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <div className="p-4 bg-gray-50 rounded-md">
                        <label className="font-semibold text-gray-800">Weight of Items Selected</label>
                        <p className="text-gray-700">
                            Total: <span className="font-bold">{formatWeight(totalWeight, weightUnit)}</span> {weightUnit}
                        </p>
                    </div>
                    {initialData && (
                        <div className="flex justify-between items-center mt-4">
                            <Button
                                form="checklist-form"
                                type="submit"
                                className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center"
                            >
                                <SaveIcon className="mr-2" /> Update Checklist
                            </Button>
                        </div>
                    )}
                    <div className="space-y-4 mt-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                                <label>{item.name} (Available: {item.quantity})</label>
                                <div className="flex items-center space-x-2">
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
                                    <Input
                                        type="number"
                                        value={selectedItems[item.id] || 0}
                                        readOnly
                                        className="w-16 text-center border rounded-md"
                                    />
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
                        ))}
                    </div>
                </div>
            </form>
            {!initialData && (
                <FloatingActionButton>
                    <Button
                        onClick={() => setIsCreateItemModalOpen(true)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg"
                    >
                        <PackagePlusIcon /> Create New Item
                    </Button>
                    <Button form="checklist-form" type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg">
                        <PlusIcon /> Create Checklist
                    </Button>
                </FloatingActionButton>
            )}
            {/* Create New Item Modal */}
            <Dialog open={isCreateItemModalOpen} onOpenChange={setIsCreateItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                        <DialogDescription>Create a new item to add to your checklist.</DialogDescription>
                    </DialogHeader>
                    <NewItemModal />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChecklistForm;

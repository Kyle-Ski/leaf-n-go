import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    title?: string;
    description?: string;
    deleteButtonText?: string;
    cancelButtonText?: string;
    thingsToDelete?: { name: string }[];
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onDelete,
    title = "Confirm Delete",
    description = "Are you sure you want to delete this? This action cannot be undone.",
    deleteButtonText = "Delete",
    cancelButtonText = "Cancel",
    thingsToDelete
}) => {
    console.log("things to delete",thingsToDelete)
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                    <DialogDescription>{thingsToDelete && thingsToDelete.map((t) => `${t.name}, `)}</DialogDescription>
                </DialogHeader>
                <div className="flex space-x-4 mt-4">
                    <Button onClick={onDelete} className="bg-red-500 text-white">
                        {deleteButtonText}
                    </Button>
                    <Button onClick={onClose} className="bg-gray-300 text-black">
                        {cancelButtonText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDeleteModal;

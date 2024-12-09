import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FrontendTrip } from "@/types/projectTypes";
import Link from "next/link";
import { useAppContext } from "@/lib/appContext";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: FrontendTrip;
  onUpdate: (updatedTrip: UpdateTripPayload) => void;
}

export interface UpdateTripPayload {
  title?: string;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  notes?: string | null;
  trip_checklists?: { checklist_id: string }[]; // Only `checklist_id` is required for updates
}

const EditTripModal = ({ isOpen, onClose, trip, onUpdate }: EditTripModalProps) => {
  const { state } = useAppContext();
  const [title, setTitle] = useState(trip.title || "");
  const [startDate, setStartDate] = useState<Date | null>(trip.start_date ? new Date(trip.start_date) : null);
  const [endDate, setEndDate] = useState<Date | null>(trip.end_date ? new Date(trip.end_date) : null);
  const [location, setLocation] = useState(trip.location || "");
  const [notes, setNotes] = useState(trip.notes || "");
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>(
    trip?.trip_checklists?.map((c) => c.checklist_id) || []
  );
  const [modalError, setModalError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle(trip.title || "");
    setStartDate(trip.start_date ? new Date(trip.start_date) : null);
    setEndDate(trip.end_date ? new Date(trip.end_date) : null);
    setLocation(trip.location || "");
    setNotes(trip.notes || "");
    setSelectedChecklists(trip.trip_checklists?.map((c) => c.checklist_id) || []);
    setModalError(null);
  };

  useEffect(() => {
    if (isOpen && trip) {
      resetForm();
    }
  }, [isOpen, trip, resetForm]);

  const handleChecklistToggle = (checklistId: string) => {
    setSelectedChecklists((prev) =>
      prev.includes(checklistId) ? prev.filter((id) => id !== checklistId) : [...prev, checklistId]
    );
  };

  const handleSubmit = () => {
    if (!title) {
      setModalError("Title is required.");
      return;
    }

    const updatedTrip: UpdateTripPayload = {
      title,
      start_date: startDate ? startDate.toISOString() : null,
      end_date: endDate ? endDate.toISOString() : null,
      location,
      notes,
      trip_checklists: selectedChecklists.map((id) => ({ checklist_id: id })), // Only checklist_id
    };

    onUpdate(updatedTrip);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trip</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="space-y-4">
            {modalError && <p className="text-red-500 text-sm">{modalError}</p>}

            <label htmlFor="trip-title" className="block text-sm font-medium text-gray-700">
              Trip Title
            </label>
            <Input
              id="trip-title"
              type="text"
              placeholder="Trip Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />

            <label htmlFor="trip-start" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <DatePicker
              id="trip-start"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Select start date"
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label htmlFor="trip-end" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <DatePicker
              id="trip-end"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="Select end date"
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label htmlFor="trip-location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <Input
              id="trip-location"
              type="text"
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />

            <label htmlFor="trip-notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="trip-notes"
              placeholder="Additional notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />

            <label className="block text-sm font-medium text-gray-700">Checklists</label>
            <div className="space-y-2">
              {state.noChecklists ? (
                <div className="flex flex-col items-center">
                  <p className="text-gray-600 text-sm mb-2">You have no checklists created yet.</p>
                  <Link href="/checklists/new">
                    <Button className="bg-blue-500 text-white">
                      Create a New Checklist
                    </Button>
                  </Link>
                  <p className="text-red-500 text-xs mt-2">
                    Note: All unsaved changes will be lost.
                  </p>
                </div>
              ) : (
                state.checklists.map((checklist) => (
                  <div key={checklist.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`checklist-${checklist.id}`}
                      checked={selectedChecklists.includes(checklist.id)}
                      onChange={() => handleChecklistToggle(checklist.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`checklist-${checklist.id}`} className="text-sm text-gray-700">
                      {checklist.title}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogDescription>
        <div className="mt-4 flex justify-end space-x-4">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-green-500 text-white">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripModal;

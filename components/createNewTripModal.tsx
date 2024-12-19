"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CreateTripPayload } from "@/types/projectTypes";
import { useAppContext } from "@/lib/appContext";
import Link from "next/link";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (tripData: CreateTripPayload) => void;
}

const CreateTripModal = ({ isOpen, onClose, onCreate }: CreateTripModalProps) => {
  const { state } = useAppContext();
  const [modalError, setModalError] = useState<string | null>(null);
  const [newTripTitle, setNewTripTitle] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState<Date | null>(null);
  const [newTripEndDate, setNewTripEndDate] = useState<Date | null>(null);
  const [newTripLocation, setNewTripLocation] = useState("");
  const [newTripNotes, setNewTripNotes] = useState("");
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [categoryOption, setCategoryOption] = useState(
    state.trip_categories && state.trip_categories.length > 0
      ? state.trip_categories[0].id
      : "CREATE_NEW"
  );
  const [newCategory, setNewCategory] = useState("");

  // Ensure end date is never before start date
  useEffect(() => {
    if (newTripStartDate && newTripEndDate && newTripEndDate < newTripStartDate) {
      setNewTripEndDate(newTripStartDate);
    }
  }, [newTripStartDate, newTripEndDate]);

  const handleChecklistToggle = (checklistId: string) => {
    setSelectedChecklists((prev) =>
      prev.includes(checklistId) ? prev.filter((id) => id !== checklistId) : [...prev, checklistId]
    );
  };

  const handleCreate = () => {
    if (!newTripTitle) {
      setModalError("Trip title is required.");
      return;
    }

    onCreate({
      title: newTripTitle,
      start_date: newTripStartDate ? newTripStartDate.toISOString() : null,
      end_date: newTripEndDate ? newTripEndDate.toISOString() : null,
      location: newTripLocation || null,
      notes: newTripNotes || null,
      checklists: selectedChecklists,
      trip_category: categoryOption,
      new_trip_category: newCategory === "" ? undefined : newCategory,
    });

    setModalError(null);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNewTripTitle("");
    setNewTripStartDate(null);
    setNewTripEndDate(null);
    setNewTripLocation("");
    setNewTripNotes("");
    setSelectedChecklists([]);
    setCategoryOption(
      state.trip_categories && state.trip_categories.length > 0
        ? state.trip_categories[0].id
        : "CREATE_NEW"
    );
    setNewCategory("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-4 rounded-lg">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
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
              value={newTripTitle}
              onChange={(e) => setNewTripTitle(e.target.value)}
              className="w-full"
            />
            <label htmlFor="trip-categories" className="block text-sm font-medium text-gray-700">
              Trip Category
            </label>
            <select
              value={categoryOption}
              onChange={(e) => setCategoryOption(e.target.value)}
              id="trip-categories"
              className="p-2 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {state.trip_categories && state.trip_categories.length ? (
                state.trip_categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <></>
              )}
              <option value="CREATE_NEW">Create New Category</option>
            </select>
            {categoryOption === "CREATE_NEW" && (
              <>
                <label htmlFor="create-new-trip-category" className="block text-sm font-medium text-gray-700">
                  Create New Trip Category
                </label>
                <Input
                  id="create-new-trip-category"
                  type="text"
                  placeholder="New Trip Type"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full"
                />
              </>
            )}

            <div className="relative">
              <label htmlFor="trip-start" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <DatePicker
                id="trip-start"
                selected={newTripStartDate}
                onChange={(date) => setNewTripStartDate(date)}
                placeholderText="Select start date"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxDate={newTripEndDate || undefined}
                popperPlacement="right-end"
              />
            </div>

            <div className="relative">
              <label htmlFor="trip-end" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <DatePicker
                id="trip-end"
                selected={newTripEndDate}
                onChange={(date) => setNewTripEndDate(date)}
                placeholderText="Select end date"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                minDate={newTripStartDate || undefined}
                popperPlacement="right-end"
              />
            </div>

            <label htmlFor="trip-location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <Input
              id="trip-location"
              type="text"
              placeholder="Location (optional)"
              value={newTripLocation}
              onChange={(e) => setNewTripLocation(e.target.value)}
              className="w-full"
            />
            <label htmlFor="trip-notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="trip-notes"
              placeholder="Additional notes (optional)"
              value={newTripNotes}
              onChange={(e) => setNewTripNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </DialogDescription>
        <div className="space-y-2 mt-4">
          {state.noChecklists ? (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 text-sm mb-2">You have no checklists created yet.</p>
              <Link href="/checklists/new">
                <Button className="bg-blue-500 text-white">Create a New Checklist</Button>
              </Link>
              <p className="text-red-500 text-xs mt-2">Note: All unsaved changes will be lost.</p>
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
        <div className="mt-4 flex justify-end space-x-4">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-green-500 text-white">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripModal;

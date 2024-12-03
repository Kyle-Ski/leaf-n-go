"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CreateTripPayload } from "@/types/projectTypes";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (tripData: CreateTripPayload) => void;
}

const CreateTripModal = ({ isOpen, onClose, onCreate }: CreateTripModalProps) => {
  const [modalError, setModalError] = useState<string | null>(null);
  const [newTripTitle, setNewTripTitle] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState<Date | null>(null);
  const [newTripEndDate, setNewTripEndDate] = useState<Date | null>(null);
  const [newTripLocation, setNewTripLocation] = useState("");
  const [newTripNotes, setNewTripNotes] = useState("");

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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
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
            <label htmlFor="trip-start" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <DatePicker
              id="trip-start"
              selected={newTripStartDate}
              onChange={(date) => setNewTripStartDate(date)}
              placeholderText="Select start date"
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="trip-end" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <DatePicker
              id="trip-end"
              selected={newTripEndDate}
              onChange={(date) => setNewTripEndDate(date)}
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

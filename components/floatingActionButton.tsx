import React, { useState } from "react";
import { PencilIcon, XIcon } from "lucide-react";

interface FloatingActionButtonProps {
  children: React.ReactNode;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 sm:bottom-8">
      {/* FAB Button */}
      <button
        onClick={toggleMenu}
        className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Toggle Menu"
      >
        <span className="sr-only">Toggle Menu</span>
        {isOpen ? (
          <XIcon className="h-6 w-6" />
        ) : (
          <PencilIcon className="h-6 w-6" />
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className="absolute bottom-20 right-0 bg-white shadow-lg rounded-lg p-4 flex flex-col space-y-3 min-w-[12rem] max-w-sm"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;

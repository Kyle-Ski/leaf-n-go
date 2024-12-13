import React from "react";

export const CheckMark = () => (
  <svg
    className="w-4 h-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => {
  return (
    <div
      className={`relative flex items-center justify-center h-5 w-5 border rounded cursor-pointer ${
        checked ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
      }`}
      onClick={() => onChange(!checked)}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {checked && (
        <div className="flex items-center justify-center">
          <CheckMark />
        </div>
      )}
    </div>
  );
};

export default Checkbox;

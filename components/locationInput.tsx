import React, { useEffect, useState, useRef } from "react";
import { Input } from "./ui/input";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, placeholder }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            value
          )}&format=json&addressdetails=1&limit=5`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location suggestions");
        }

        const data = await response.json();

        setSuggestions(data.map((item: any) => `${item.display_name}`));
      } catch (err: any) {
        setError(err.message || "Failed to fetch location suggestions");
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchSuggestions, 300); // Debounce API calls
    return () => clearTimeout(debounceFetch);
  }, [value]);

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]); // Clear suggestions on select
    setIsFocused(false); // Close dropdown
  };

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Check if the blur event is outside the dropdown
    if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
      setIsFocused(false); // Close dropdown when losing focus
    }
  };

  return (
    <div
      className="relative w-full"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter a location"}
        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isFocused && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10"
        >
          {loading ? (
            <p className="px-4 py-2 text-sm text-gray-500">Loading...</p>
          ) : error ? (
            <p className="px-4 py-2 text-sm text-red-500">{error}</p>
          ) : (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;

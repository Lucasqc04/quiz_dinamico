import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, ChevronDown } from 'lucide-react';

interface NumberInputProps {
  label: string;
  value: number | null;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  required?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  suggestions?: { value: number; label: string }[];
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  placeholder,
  required,
  onFocus,
  suggestions = [],
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIncrement = () => {
    if (value === null) {
      onChange(min?.toString() || '1');
      return;
    }
    if (max !== undefined && value >= max) return;
    onChange((value + 1).toString());
  };

  const handleDecrement = () => {
    if (value === null) return;
    if (min !== undefined && value <= min) return;
    onChange((value - 1).toString());
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div className="flex">
          <button
            type="button"
            onClick={handleDecrement}
            className="p-3 rounded-l-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 
                     border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 
                     focus:ring-primary-500 dark:focus:ring-primary-500 transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              onFocus={(e) => {
                setShowSuggestions(true);
                onFocus?.(e);
              }}
              min={min}
              max={max}
              placeholder={placeholder}
              required={required}
              className="w-full h-full text-center p-3 text-lg border-y border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 
                       dark:focus:ring-primary-500 transition-shadow"
            />
            {suggestions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full
                         hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleIncrement}
            className="p-3 rounded-r-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 
                     border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 
                     focus:ring-primary-500 dark:focus:ring-primary-500 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Sugestões */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 py-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
                       border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onChange(suggestion.value.toString());
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                         focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

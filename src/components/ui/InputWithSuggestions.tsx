import React, { useState, useRef, useEffect } from 'react';
import { Input } from './Input';

interface InputWithSuggestionsProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  suggestions?: { value: string | number; label: string }[];
  type?: 'text' | 'number';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

export const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({
  label,
  value,
  onChange,
  suggestions = [],
  type = 'text',
  placeholder,
  required,
  min,
  max,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        label={label}
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? e.target.value : e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
              onClick={() => {
                onChange(suggestion.value);
                setIsOpen(false);
              }}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

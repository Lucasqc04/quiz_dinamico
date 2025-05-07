import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  const id = `switch-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative inline-block">
        <input
          type="checkbox"
          id={id}
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label
          htmlFor={id}
          className={`block h-6 w-11 cursor-pointer rounded-full 
                    ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}
                    transition-colors duration-200 
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    peer-focus:outline-none peer-focus:ring-2 
                    peer-focus:ring-primary-500 peer-focus:ring-offset-2`}
        >
          <span 
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white 
                      transform transition-transform duration-200
                      ${checked ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </label>
      </div>
      {label && (
        <label htmlFor={id} className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};
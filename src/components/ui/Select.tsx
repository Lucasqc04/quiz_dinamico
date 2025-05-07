import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: Option[];
  label?: string;
  error?: string;
  helper?: string;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, label, error, helper, onChange, className = '', ...props }, ref) => {
    const id = props.id || props.name || Math.random().toString(36).substring(2, 9);
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          onChange={handleChange}
          className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-900 px-3 py-2 text-sm 
                     shadow-sm 
                     focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
                     disabled:cursor-not-allowed disabled:opacity-50
                     ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}
                     ${className}`}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helper && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helper}</p>
        )}
        {error && (
          <p className="text-xs text-danger-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
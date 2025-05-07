import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = '', ...props }, ref) => {
    const id = props.id || props.name || Math.random().toString(36).substring(2, 9);
    
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
        <input
          id={id}
          ref={ref}
          className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-900 px-3 py-2 text-sm 
                     placeholder-gray-400 shadow-sm 
                     focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500
                     disabled:cursor-not-allowed disabled:opacity-50
                     ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}
                     ${className}`}
          {...props}
        />
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

Input.displayName = 'Input';
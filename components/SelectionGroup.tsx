import React from 'react';

interface SelectionGroupProps {
  label: string;
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const SelectionGroup: React.FC<SelectionGroupProps> = ({ label, options, selectedValue, onValueChange, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            onClick={() => onValueChange(option)}
            disabled={disabled}
            className={`text-center text-sm font-medium py-2 px-4 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-indigo-500 ${
              selectedValue === option
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            aria-pressed={selectedValue === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

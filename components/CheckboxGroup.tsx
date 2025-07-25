
import React from 'react';

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, options, selectedOptions, onChange, disabled }) => {
  const handleCheckboxChange = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    onChange(newSelection);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {options.map(option => (
          <label key={option} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              disabled={disabled}
              className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 bg-slate-100 dark:bg-slate-800 focus:ring-indigo-500 disabled:opacity-50"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

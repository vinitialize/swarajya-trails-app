import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex items-center w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 hover:bg-slate-300 dark:hover:bg-slate-600"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            type="button"
        >
            {/* Background track */}
            <span className="sr-only">Toggle theme</span>
            
            {/* Sliding circle with icon */}
            <span
                className={`inline-flex items-center justify-center w-5 h-5 bg-white dark:bg-slate-800 rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${
                    theme === 'dark' 
                        ? 'translate-x-8' 
                        : 'translate-x-1'
                }`}
            >
                {theme === 'light' ? (
                    <Sun className="w-3 h-3 text-amber-500" />
                ) : (
                    <Moon className="w-3 h-3 text-blue-400" />
                )}
            </span>
            
            {/* Background icons */}
            <Sun className={`absolute left-1.5 top-1.5 w-4 h-4 text-amber-500 transition-opacity duration-300 ${
                theme === 'dark' ? 'opacity-0' : 'opacity-100'
            }`} />
            <Moon className={`absolute right-1.5 top-1.5 w-4 h-4 text-blue-400 transition-opacity duration-300 ${
                theme === 'dark' ? 'opacity-100' : 'opacity-0'
            }`} />
        </button>
    );
};

export default ThemeToggle;

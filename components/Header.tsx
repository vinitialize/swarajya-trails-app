
import React from 'react';
import { MountainIcon, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle }) => {
  return (
    <header className="py-4 sm:py-6">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center justify-center gap-3">
          <MountainIcon className="h-8 w-8 text-indigo-500" />
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Swarajya Trails
          </h1>
        </div>
        <button
          onClick={onThemeToggle}
          className="relative inline-flex items-center h-8 w-14 p-1 rounded-full bg-slate-200 dark:bg-slate-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle theme"
        >
          <span
            className={`absolute top-1 left-1 flex items-center justify-center h-6 w-6 rounded-full bg-white dark:bg-slate-700 shadow-md transform transition-transform duration-300 ease-in-out ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
            }`}
          >
             {theme === 'dark' 
                ? <MoonIcon className="h-4 w-4 text-indigo-400"/> 
                : <SunIcon className="h-4 w-4 text-amber-500"/>
             }
          </span>
        </button>
      </div>
    </header>
  );
};
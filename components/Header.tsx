import React from 'react';
import ThemeToggle from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-2xl shadow-lg border-b border-slate-200/10 dark:border-slate-700/10 transition-all duration-300"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <img 
                src="/icon.png" 
                alt="Swarajya Trails Logo" 
                className="logo-icon h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain drop-shadow-md"
              />
            </div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                <span className="hidden sm:inline">Swarajya Trails</span>
                <span className="sm:hidden">Swarajya</span>
              </h1>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Route, Castle, MapPin } from 'lucide-react';
import metadata from '../metadata.json';

const AppDescription: React.FC = () => {
  return (
    <div className="relative p-6 sm:p-8 rounded-3xl shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-300 overflow-hidden border border-blue-100/50 dark:border-slate-700/50 backdrop-blur-sm">
      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent dark:from-indigo-600/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-transparent dark:from-purple-600/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Explore Maharashtra's Heritage</h2>
          <p className="max-w-2xl mx-auto leading-relaxed text-sm sm:text-base text-slate-700 dark:text-slate-300">
            {metadata.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100/50 dark:border-slate-700/50 hover:shadow-md transition-all duration-300">
            <div className="inline-flex p-3 bg-blue-500/20 rounded-xl mb-3">
              <Route className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base text-blue-800 dark:text-blue-300">Detailed Routes</h3>
            <p className="text-xs sm:text-sm opacity-80">Transportation & paths</p>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100/50 dark:border-slate-700/50 hover:shadow-md transition-all duration-300">
            <div className="inline-flex p-3 bg-amber-500/20 rounded-xl mb-3">
              <Castle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base text-amber-800 dark:text-amber-300">Fort Heritage</h3>
            <p className="text-xs sm:text-sm opacity-80">Maratha history</p>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100/50 dark:border-slate-700/50 hover:shadow-md transition-all duration-300">
            <div className="inline-flex p-3 bg-emerald-500/20 rounded-xl mb-3">
              <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base text-emerald-800 dark:text-emerald-300">Local Insights</h3>
            <p className="text-xs sm:text-sm opacity-80">Pro trek tips</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDescription;

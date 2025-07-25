import React from 'react';
import { SelectionGroup } from './SelectionGroup';
import { CheckboxGroup } from './CheckboxGroup';
import { ItineraryFilters } from '../services/geminiService';
import { XIcon } from './icons';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  filters: ItineraryFilters;
  setters: {
    setDifficulty: (value: string) => void;
    setRegions: (value: string[]) => void;
    setProximity: (value: string) => void;
    setMountainRange: (value: string) => void;
    setTrekDuration: (value: string) => void;
    setTrailTypes: (value: string[]) => void;
    setHistoricalSignificance: (value: string) => void;
    setFortType: (value: string) => void;
    setKeyFeatures: (value: string[]) => void;
  };
}

const geographyOptions = {
    regions: ['Pune', 'Raigad', 'Satara', 'Kolhapur', 'Nashik', 'Ahmednagar'],
    proximity: ['Any', 'Near Pune', 'Near Mumbai'],
    mountainRanges: ['Any', 'Sahyadri', 'Satmala', 'Harishchandragad'],
};

const trekOptions = {
    difficulty: ['Any', 'Easy', 'Medium', 'Hard'],
    duration: ['Any', '< 3 hours', '3-6 hours', '> 6 hours'],
    trailTypes: ['Well-marked', 'Jungle Trail', 'Rock Patches', 'Scree Slope', 'Ridge Walk'],
};

const fortOptions = {
    history: ['Any', 'Maratha Empire', 'Yadava Dynasty', 'Bahmani Sultanate', 'Ancient'],
    types: ['Any', 'Hill', 'Sea', 'Land'],
    features: ['Caves', 'Water Cisterns', 'Temples', 'Fortifications', 'Inscriptions'],
};


export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onReset, filters, setters }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl m-4 flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{animationDuration: '300ms'}}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <h2 id="filter-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">Advanced Trail Filters</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close filters">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
            {/* Geography & Location */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Geography & Location</h3>
                <CheckboxGroup label="Region / District" options={geographyOptions.regions} selectedOptions={filters.regions} onChange={setters.setRegions} />
                <SelectionGroup label="Proximity to Major City" options={geographyOptions.proximity} selectedValue={filters.proximity} onValueChange={setters.setProximity} />
                <SelectionGroup label="Mountain Range" options={geographyOptions.mountainRanges} selectedValue={filters.mountainRange} onValueChange={setters.setMountainRange} />
            </section>
            
            {/* Trek Characteristics */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Trek Characteristics</h3>
                <SelectionGroup label="Trek Difficulty Level" options={trekOptions.difficulty} selectedValue={filters.difficulty} onValueChange={setters.setDifficulty} />
                <SelectionGroup label="Trek Duration (in hours)" options={trekOptions.duration} selectedValue={filters.trekDuration} onValueChange={setters.setTrekDuration} />
                <CheckboxGroup label="Trail Type" options={trekOptions.trailTypes} selectedOptions={filters.trailTypes} onChange={setters.setTrailTypes} />
            </section>

            {/* Fort Attributes */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Fort Attributes</h3>
                <SelectionGroup label="Historical Significance" options={fortOptions.history} selectedValue={filters.historicalSignificance} onValueChange={setters.setHistoricalSignificance} />
                <SelectionGroup label="Fort Type" options={fortOptions.types} selectedValue={filters.fortType} onValueChange={setters.setFortType} />
                <CheckboxGroup label="Key Features" options={fortOptions.features} selectedOptions={filters.keyFeatures} onChange={setters.setKeyFeatures} />
            </section>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <button
                onClick={() => { onReset(); }}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
                Reset Filters
            </button>
            <button
                onClick={onClose}
                className="py-2 px-6 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};
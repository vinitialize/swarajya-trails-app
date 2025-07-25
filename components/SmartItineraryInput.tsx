import React, { useState } from 'react';
import { ItineraryFilters } from '../services/geminiService';

interface SmartItineraryInputProps {
    filters: ItineraryFilters;
    onFiltersChange: (filters: ItineraryFilters) => void;
    onGenerateItinerary: () => void;
    isLoading?: boolean;
}

interface FortSuggestion {
    name: string;
    region: string;
    difficulty: 'Easy' | 'Moderate' | 'Difficult';
    category: string;
}

const POPULAR_FORTS: FortSuggestion[] = [
    { name: 'Raigad', region: 'Raigad', difficulty: 'Moderate', category: 'Historical Capital' },
    { name: 'Shivneri', region: 'Pune', difficulty: 'Easy', category: 'Birthplace of Shivaji' },
    { name: 'Lohagad', region: 'Pune', difficulty: 'Easy', category: 'Popular Weekend Trek' },
    { name: 'Sinhagad', region: 'Pune', difficulty: 'Moderate', category: 'Historic Battle Site' },
    { name: 'Pratapgad', region: 'Satara', difficulty: 'Moderate', category: 'Famous Victory Site' },
    { name: 'Rajgad', region: 'Pune', difficulty: 'Difficult', category: 'Former Capital' },
    { name: 'Purandar', region: 'Pune', difficulty: 'Moderate', category: 'Twin Fort Complex' },
    { name: 'Torna', region: 'Pune', difficulty: 'Difficult', category: 'First Maratha Conquest' },
    { name: 'Kalsubai', region: 'Ahmednagar', difficulty: 'Difficult', category: 'Highest Peak in Maharashtra' },
    { name: 'Harishchandragad', region: 'Ahmednagar', difficulty: 'Difficult', category: 'Ancient Temple Complex' }
];


const SmartItineraryInput: React.FC<SmartItineraryInputProps> = ({
    filters,
    onFiltersChange,
    onGenerateItinerary,
    isLoading = false
}) => {
    const [inputMode, setInputMode] = useState<'suggestions' | 'custom'>('suggestions');
    const [customInput, setCustomInput] = useState(filters.fortsList);
    const [inputError, setInputError] = useState<string>('');

    const getFilteredSuggestions = (): FortSuggestion[] => {
        return POPULAR_FORTS.filter(fort => {
            if (filters.difficulty !== 'Any' && fort.difficulty !== filters.difficulty) return false;
            if (filters.regions.length > 0 && !filters.regions.includes(fort.region)) return false;
            return true;
        });
    };

    const handleFortSuggestionClick = (fortName: string) => {
        const newFilters = { ...filters, fortsList: fortName };
        onFiltersChange(newFilters);
        setCustomInput(fortName);
        setInputError('');
    };


    const handleCustomInputChange = (value: string) => {
        setCustomInput(value);
        setInputError('');
        
        if (value.length > 500) {
            setInputError('Input too long. Maximum 500 characters allowed.');
            return;
        }
        
        const suspiciousPatterns = [
            /system|prompt|instruction|ignore|bypass/gi,
            /\b(api|key|token|secret|password)\b/gi,
            /<script|javascript:|data:/gi,
            /\{\{.*\}\}|\$\{.*\}/g
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(value)) {
                setInputError('Input contains invalid content. Please use plain text only.');
                return;
            }
        }

        const nonFortPatterns = [
            /\b(recipe|cooking|food|restaurant|hotel|menu|dish|meal|cuisine)\b/gi,
            /\b(movie|song|music|video|entertainment|game|sport)\b/gi,
            /\b(shopping|market|mall|store|buy|sell|price)\b/gi,
            /\b(medical|doctor|medicine|hospital|health|treatment)\b/gi
        ];
        const fortKeywords = [
            /\b(fort|forts|qila|gad|garh|killa)\b/gi,
            /\b(trek|trekking|hiking|climb|climbing)\b/gi
        ];

        const hasNonFortContent = nonFortPatterns.some(pattern => pattern.test(value));
        const hasFortContent = fortKeywords.some(pattern => pattern.test(value));

        if (hasNonFortContent && !hasFortContent) {
            setInputError('Please enter fort names or trekking-related requests.');
            return;
        }

        if (!hasFortContent && value.length > 20) {
            const travelKeywords = /\b(trip|travel|visit|explore|adventure|weekend|day|getaway|tour|journey|beginners|easy|difficult|moderate)\b/gi;
            if (!travelKeywords.test(value)) {
                setInputError('Please specify fort names or describe your trekking adventure.');
                return;
            }
        }

        onFiltersChange({ ...filters, fortsList: value });
    };

    const handleModeSwitch = (mode: 'suggestions' | 'custom') => {
        setInputMode(mode);
        if (mode === 'suggestions') {
            setCustomInput('');
            onFiltersChange({ ...filters, fortsList: '' });
            setInputError('');
        }
    };

    const canGenerate = inputMode === 'suggestions' ? 
        filters.fortsList.trim().length > 0 : 
        customInput.trim().length > 0 && !inputError;

    const filteredForts = getFilteredSuggestions();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">
                🎯 Choose Your Adventure
            </h3>
            
            {/* Mode Toggle */}
            <div className="flex mb-4 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                    onClick={() => handleModeSwitch('suggestions')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'suggestions'
                            ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                >
                    📍 Suggestions
                </button>
                <button
                    onClick={() => handleModeSwitch('custom')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        inputMode === 'custom'
                            ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                >
                    ✏️ Custom Request
                </button>
            </div>

            {inputMode === 'suggestions' ? (
                <div className="space-y-4">
                    {/* Fort Suggestions */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Popular Forts {filteredForts.length !== POPULAR_FORTS.length && 
                            `(${filteredForts.length} matching your filters)`}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {filteredForts.map((fort, index) => (
                                <div key={index} className="relative flex items-center gap-2">
                                    <button
                                        onClick={() => handleFortSuggestionClick(fort.name)}
                                        className={`flex-1 p-3 text-left rounded-lg border transition-all ${
                                            filters.fortsList === fort.name
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="font-medium text-gray-800 dark:text-slate-200">{fort.name}</div>
                                        <div className="text-xs text-gray-600 dark:text-slate-400">
                                            {fort.region} • {fort.difficulty} • {fort.category}
                                        </div>
                                    </button>
                                    {filters.fortsList === fort.name && (
                                        <button
                                            onClick={onGenerateItinerary}
                                            disabled={isLoading}
                                            className="ml-2 px-3 py-1 text-sm bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50"
                                        >
                                            {isLoading ? 'Generating...' : 'Generate Itinerary'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {filteredForts.length === 0 && (
                            <p className="text-gray-500 dark:text-slate-400 text-sm italic">
                                No forts match your current filters. Try adjusting your preferences above.
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Describe Your Trip</h4>
                    <textarea
                        value={customInput}
                        onChange={(e) => handleCustomInputChange(e.target.value)}
                        placeholder="Example: I want to visit Raigad and Torna forts over a weekend..."
                        className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 ${
                            inputError ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                        }`}
                        rows={3}
                        maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                            {customInput.length}/500 characters
                        </div>
                        {inputError && (
                            <div className="text-xs text-red-500">{inputError}</div>
                        )}
                    </div>
                </div>
            )}


            {inputMode === 'custom' && canGenerate && (
                <button
                    onClick={onGenerateItinerary}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : '🚀 Generate Itinerary'}
                </button>
            )}

        </div>
    );
};

export default SmartItineraryInput;

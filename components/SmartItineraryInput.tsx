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
    elevation: string;
    description: string;
    keyFeatures: string[];
    trekDuration: string;
}

interface RegionalForts {
    region: string;
    displayName: string;
    description: string;
    forts: FortSuggestion[];
}

const REGIONAL_FORTS: RegionalForts[] = [
    {
        region: 'Pune',
        displayName: 'Pune & Western Ghats',
        description: 'Popular weekend treks near Pune with rich Maratha history',
        forts: [
            { 
                name: 'Lohagad', 
                region: 'Pune', 
                difficulty: 'Easy', 
                category: 'Popular Weekend Trek',
                elevation: '3,389 ft',
                description: 'An easily accessible fort with stunning monsoon views and historical significance. Perfect for beginners and families.',
                keyFeatures: ['Scenic monsoon trek', 'Ancient caves', 'Bhaja and Karla caves nearby'],
                trekDuration: '2-3 hours'
            },
            { 
                name: 'Sinhagad', 
                region: 'Pune', 
                difficulty: 'Moderate', 
                category: 'Historic Battle Site',
                elevation: '4,300 ft',
                description: 'Famous for the brave Tanaji Malusare\'s conquest in service of Chhatrapati Shivaji Maharaj. Offers panoramic views of Pune city and surrounding valleys.',
                keyFeatures: ['Historical significance', 'City views', 'Tanaji memorial'],
                trekDuration: '3-4 hours'
            },
            { 
                name: 'Shivneri', 
                region: 'Pune', 
                difficulty: 'Easy', 
                category: 'Birthplace of Chhatrapati Shivaji Maharaj',
                elevation: '2,200 ft',
                description: 'The birthplace of Chhatrapati Shivaji Maharaj. A sacred fort with ancient water cisterns and temples.',
                keyFeatures: ['Birthplace of Chhatrapati Shivaji Maharaj', 'Water cisterns', 'Ancient architecture'],
                trekDuration: '2-3 hours'
            },
            { 
                name: 'Rajgad', 
                region: 'Pune', 
                difficulty: 'Difficult', 
                category: 'Former Maratha Capital',
                elevation: '4,600 ft',
                description: 'The former capital of the Maratha Empire for 26 years. Challenging trek with multiple peaks and rich history.',
                keyFeatures: ['Former Maratha capital', 'Multiple peaks', 'Sambhaji tomb'],
                trekDuration: '6-8 hours'
            },
            { 
                name: 'Purandar', 
                region: 'Pune', 
                difficulty: 'Moderate', 
                category: 'Twin Fort Complex',
                elevation: '4,472 ft',
                description: 'Twin forts (Purandar and Vajragad) with stunning valley views. Connected by ancient pathways.',
                keyFeatures: ['Twin fort complex', 'Valley views', 'Ancient pathways'],
                trekDuration: '4-5 hours'
            },
            { 
                name: 'Torna', 
                region: 'Pune', 
                difficulty: 'Difficult', 
                category: 'First Maratha Conquest',
                elevation: '4,603 ft',
                description: 'The first fort captured by young Chhatrapati Shivaji Maharaj at age 16. Challenging trek with historical significance.',
                keyFeatures: ['First Maratha conquest', 'Historical significance', 'Challenging terrain'],
                trekDuration: '5-6 hours'
            }
        ]
    },
    {
        region: 'Raigad',
        displayName: 'Raigad & Konkan',
        description: 'Coastal and hill forts with imperial Maratha heritage',
        forts: [
            { 
                name: 'Raigad', 
                region: 'Raigad', 
                difficulty: 'Moderate', 
                category: 'Maratha Capital',
                elevation: '2,700 ft',
                description: 'The coronation place of Chhatrapati Shivaji Maharaj. Accessible by ropeway with magnificent ruins and palace remains.',
                keyFeatures: ['Coronation site', 'Ropeway access', 'Palace ruins', 'Royal tombs'],
                trekDuration: '3-4 hours'
            },
            { 
                name: 'Mahuli', 
                region: 'Raigad', 
                difficulty: 'Difficult', 
                category: 'Highest Peak in Thane',
                elevation: '2,815 ft',
                description: 'The highest peak in Thane district. Rock climbing and rappelling opportunities with dense forest cover.',
                keyFeatures: ['Highest in Thane', 'Rock climbing', 'Dense forests'],
                trekDuration: '4-5 hours'
            }
        ]
    },
    {
        region: 'Satara',
        displayName: 'Satara & Mahabaleshwar',
        description: 'Hill station forts with pleasant climate and scenic beauty',
        forts: [
            { 
                name: 'Pratapgad', 
                region: 'Satara', 
                difficulty: 'Moderate', 
                category: 'Famous Victory Site',
                elevation: '3,500 ft',
                description: 'Site of the famous battle where Chhatrapati Shivaji Maharaj defeated Afzal Khan. Beautiful architecture and mountain views.',
                keyFeatures: ['Victory memorial', 'Afzal Khan tomb', 'Mountain views'],
                trekDuration: '3-4 hours'
            },
            { 
                name: 'Vasota', 
                region: 'Satara', 
                difficulty: 'Difficult', 
                category: 'Wildlife Sanctuary Fort',
                elevation: '3,100 ft',
                description: 'Located in Koyna Wildlife Sanctuary. Accessible by boat ride across Shivsagar lake followed by jungle trek.',
                keyFeatures: ['Wildlife sanctuary', 'Boat ride', 'Jungle trek'],
                trekDuration: '6-8 hours'
            }
        ]
    },
    {
        region: 'Ahmednagar',
        displayName: 'Ahmednagar & Nashik',
        description: 'Challenging high-altitude forts with ancient temples',
        forts: [
            { 
                name: 'Kalsubai', 
                region: 'Ahmednagar', 
                difficulty: 'Difficult', 
                category: 'Highest Peak in Maharashtra',
                elevation: '5,400 ft',
                description: 'The highest peak in Maharashtra with a temple at the summit. Challenging climb with spectacular 360-degree views.',
                keyFeatures: ['Highest peak', 'Summit temple', '360-degree views'],
                trekDuration: '5-6 hours'
            },
            { 
                name: 'Harishchandragad', 
                region: 'Ahmednagar', 
                difficulty: 'Difficult', 
                category: 'Ancient Temple Complex',
                elevation: '4,671 ft',
                description: 'Ancient fort with Kedareshwar temple featuring a hanging pillar. Famous for Konkan Kada cliff and cave exploration.',
                keyFeatures: ['Hanging pillar temple', 'Konkan Kada cliff', 'Ancient caves'],
                trekDuration: '6-8 hours'
            },
            { 
                name: 'Ratangad', 
                region: 'Ahmednagar', 
                difficulty: 'Moderate', 
                category: 'Jewel of Sahyadris',
                elevation: '4,255 ft',
                description: 'Known as the "Jewel of Sahyadris" for its natural beauty. Features ancient caves and a needle-like pinnacle.',
                keyFeatures: ['Natural beauty', 'Ancient caves', 'Needle pinnacle'],
                trekDuration: '4-5 hours'
            }
        ]
    }
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
    const [expandedFort, setExpandedFort] = useState<string | null>(null);
    const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

    const getFilteredRegions = (): RegionalForts[] => {
        return REGIONAL_FORTS.map(region => ({
            ...region,
            forts: region.forts.filter(fort => {
                if (filters.difficulty !== 'Any' && fort.difficulty !== filters.difficulty) return false;
                if (filters.regions.length > 0 && !filters.regions.includes(fort.region)) return false;
                return true;
            })
        })).filter(region => region.forts.length > 0);
    };

    const toggleFortExpansion = (fortName: string) => {
        setExpandedFort(expandedFort === fortName ? null : fortName);
    };

    const toggleRegionExpansion = (regionName: string) => {
        setExpandedRegion(expandedRegion === regionName ? null : regionName);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
            case 'Moderate': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
            case 'Difficult': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
        }
    };

    const handleFortSuggestionClick = (fortName: string) => {
        // Allow deselection if the same fort is clicked
        const newFortName = filters.fortsList === fortName ? '' : fortName;
        const newFilters = { ...filters, fortsList: newFortName };
        onFiltersChange(newFilters);
        setCustomInput(newFortName);
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

    const filteredRegions = getFilteredRegions();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">
                Choose Your Adventure
            </h3>
            
            {/* Mode Toggle */}
            <div className="flex mb-6 bg-gray-50 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                <button
                    onClick={() => handleModeSwitch('suggestions')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        inputMode === 'suggestions'
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 shadow-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500'
                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50'
                    }`}
                >
                    🏰 Explore Forts
                </button>
                <button
                    onClick={() => handleModeSwitch('custom')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        inputMode === 'custom'
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600 shadow-sm text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500'
                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50'
                    }`}
                >
                    ✈️ Plan a Trek
                </button>
            </div>

            {inputMode === 'suggestions' ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-base font-medium text-gray-900 dark:text-slate-100">
                            Popular Forts by Region
                        </h4>
                        {filters.fortsList && (
                            <button
                                onClick={() => handleFortSuggestionClick('')}
                                className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
                            >
                                Clear selection
                            </button>
                        )}
                    </div>
                    
                    {filteredRegions.length === 0 ? (
                        <p className="text-gray-500 dark:text-slate-400 text-sm italic">
                            No forts match your current filters. Try adjusting your preferences above.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {filteredRegions.map((region) => (
                                <div key={region.region} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                    {/* Region Header */}
                                    <button
                                        onClick={() => toggleRegionExpansion(region.region)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                                    >
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-gray-900 dark:text-slate-100 text-lg">{region.displayName}</h5>
                                            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{region.description}</p>
                                            <div className="text-xs text-gray-500 dark:text-slate-500 mt-2 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                {region.forts.length} forts available
                                            </div>
                                        </div>
                                        <div className="text-gray-400 dark:text-slate-500 ml-4">
                                            <svg className={`w-5 h-5 transition-transform duration-200 ${expandedRegion === region.region ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </button>
                                    
                                    {/* Region Forts */}
                                    {expandedRegion === region.region && (
                                        <div className="border-t border-gray-200 dark:border-slate-700">
                                            <div className="p-4 space-y-3">
                                                {region.forts.map((fort) => (
                                                    <div key={fort.name} className={`bg-white dark:bg-slate-800 border rounded-lg overflow-hidden transition-all duration-200 ${
                                                        filters.fortsList === fort.name 
                                                            ? 'border-blue-300 dark:border-blue-600 shadow-md' 
                                                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-sm'
                                                    }`}>
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <h6 className="font-semibold text-gray-900 dark:text-slate-100 text-base">{fort.name}</h6>
                                                                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{fort.category}</p>
                                                                    <div className="flex items-center gap-3 mt-2">
                                                                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(fort.difficulty)}`}>
                                                                            {fort.difficulty}
                                                                        </span>
                                                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                            </svg>
                                                                            {fort.elevation}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                            </svg>
                                                                            {fort.trekDuration}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 ml-4">
                                                                    <button
                                                                        onClick={() => handleFortSuggestionClick(fort.name)}
                                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                                            filters.fortsList === fort.name
                                                                                ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-600'
                                                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                                                        }`}
                                                                    >
                                                                        {filters.fortsList === fort.name ? 'Selected' : 'Select'}
                                                                    </button>
                                                                    {filters.fortsList === fort.name && (
                                                                        <button
                                                                            onClick={onGenerateItinerary}
                                                                            disabled={isLoading}
                                                                            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                                                                        >
                                                                            {isLoading ? 'Planning...' : 'Create Plan'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Fort Details - Always show when fort is selected */}
                                                        {filters.fortsList === fort.name && (
                                                            <div className="border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/30 p-6">
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <h7 className="text-sm font-semibold text-gray-900 dark:text-slate-200 mb-2 block">Description</h7>
                                                                        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{fort.description}</p>
                                                                    </div>
                                                                    
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                        <div>
                                                                            <h7 className="text-sm font-semibold text-gray-900 dark:text-slate-200 mb-3 block">Fort Details</h7>
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    <span className="font-medium">Region:</span> {fort.region}
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    <span className="font-medium">Elevation:</span> {fort.elevation}
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    <span className="font-medium">Trek Duration:</span> {fort.trekDuration}
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    <span className="font-medium">Category:</span> {fort.category}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div>
                                                                            <h7 className="text-sm font-semibold text-gray-900 dark:text-slate-200 mb-3 block">Key Features</h7>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {fort.keyFeatures.map((feature, idx) => (
                                                                                    <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800">
                                                                                        {feature}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Describe Your Trek</h4>
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

import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { Castle } from 'lucide-react';
import { ItineraryFilters } from '../services/geminiService';
import ProtectedComponent from './ProtectedComponent';
import { useAuth } from '../contexts/AuthContext';

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
            },
            { 
                name: 'Karnala', 
                region: 'Raigad', 
                difficulty: 'Easy', 
                category: 'Bird Sanctuary Trek',
                elevation: '1,440 ft',
                description: 'A short trek known for its fort and bird sanctuary, offering stunning views.',
                keyFeatures: ['Bird sanctuary', 'Fort views', 'Nature trails'],
                trekDuration: '1-2 hours'
            },
            { 
                name: 'Sudhagad', 
                region: 'Raigad', 
                difficulty: 'Moderate', 
                category: 'Historic Fort',
                elevation: '3,550 ft',
                description: 'A historic fort with a large plateau and fantastic views of the Sahyadri ranges.',
                keyFeatures: ['Historical walls', 'Temple', 'Panoramic views'],
                trekDuration: '3-4 hours'
            },
            { 
                name: 'Korigad', 
                region: 'Raigad', 
                difficulty: 'Easy', 
                category: 'Scenic Hill Fort',
                elevation: '3,049 ft',
                description: 'A scenic fort with a large plateau and amazing views, especially in monsoon.',
                keyFeatures: ['Lush greenery', 'Large plateau', 'Scenic views'],
                trekDuration: '2-3 hours'
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
            },
            { 
                name: 'Sajjangad', 
                region: 'Satara', 
                difficulty: 'Easy', 
                category: 'Spiritual Fortress',
                elevation: '3,380 ft',
                description: 'Known as a spiritual site with a fort and temple dedicated to Saint Ramdas.',
                keyFeatures: ['Spiritual site', 'Temple', 'Panoramic views'],
                trekDuration: '2-3 hours'
            },
            { 
                name: 'Ajinkyatara', 
                region: 'Satara', 
                difficulty: 'Moderate', 
                category: 'Strategic Hill Fort',
                elevation: '3,300 ft',
                description: 'Famous for its strategic significance and stunning views of Satara city.',
                keyFeatures: ['Strategic significance', 'Scenic views', 'Historical site'],
                trekDuration: '3-4 hours'
            },
            { 
                name: 'Pandavgad', 
                region: 'Satara', 
                difficulty: 'Moderate', 
                category: 'Historical Trek',
                elevation: '4,177 ft',
                description: 'A trek that combines history and adventure with ancient structures.',
                keyFeatures: ['Historical trek', 'Scenic routes', 'Ancient structures'],
                trekDuration: '4-5 hours'
            },
            { 
                name: 'Koraigad', 
                region: 'Satara', 
                difficulty: 'Easy', 
                category: 'Scenic Valley Fort',
                elevation: '2,100 ft',
                description: 'A beautiful fort surrounded by lush valleys and scenic landscapes.',
                keyFeatures: ['Valley views', 'Scenic landscapes', 'Easy access'],
                trekDuration: '2-3 hours'
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
            },
            { 
                name: 'Alang', 
                region: 'Ahmednagar', 
                difficulty: 'Difficult', 
                category: 'Tough Hill Fort',
                elevation: '4,850 ft',
                description: 'One of the toughest treks with steep climbs, perfect for thrill-seekers.',
                keyFeatures: ['Challenging terrain', 'Steep climbs', 'Thrilling experience'],
                trekDuration: '5-7 hours'
            },
            { 
                name: 'Kulanggad', 
                region: 'Ahmednagar', 
                difficulty: 'Moderate', 
                category: 'Fort with a View',
                elevation: '4,750 ft',
                description: 'Offers breathtaking views and a good challenge for trekkers.',
                keyFeatures: ['Breathtaking views', 'Challenging paths', 'Rich history'],
                trekDuration: '4-5 hours'
            },
            { 
                name: 'Ajoba', 
                region: 'Ahmednagar', 
                difficulty: 'Difficult', 
                category: 'Sacred Hill',
                elevation: '4,500 ft',
                description: 'A trek with steep ascents and spiritual significance.',
                keyFeatures: ['Spiritual journey', 'Steep ascents', 'Sacred caves'],
                trekDuration: '5-6 hours'
            },
            { 
                name: 'Bhandardara', 
                region: 'Ahmednagar', 
                difficulty: 'Easy', 
                category: 'Lake Side Trek',
                elevation: '2,500 ft',
                description: 'A beautiful lake-side trek with scenic waterfalls and pleasant weather.',
                keyFeatures: ['Lake views', 'Waterfalls', 'Scenic beauty'],
                trekDuration: '2-3 hours'
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
    const regionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
    
    // Swipe functionality
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [swipeOffset, setSwipeOffset] = useState<number>(0);

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
        setSwipeOffset(0); // Reset swipe offset when switching modes
        if (mode === 'suggestions') {
            setCustomInput('');
            onFiltersChange({ ...filters, fortsList: '' });
            setInputError('');
        }
    };
    
    // Touch handling for swipe functionality
    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        setTouchStartX(e.touches[0].clientX);
    };
    
    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (touchStartX === null) return;
        
        const touchCurrentX = e.touches[0].clientX;
        const diff = touchCurrentX - touchStartX;
        
        // Get the width of the container to calculate the maximum swipe distance
        const containerWidth = e.currentTarget.getBoundingClientRect().width;
        const maxSwipeDistance = containerWidth / 2;
        
        // Limit the swipe offset to half the container width
        let newOffset = 0;
        if (inputMode === 'suggestions') {
            // When in 'suggestions' mode, allow swiping left (negative direction)
            newOffset = Math.max(-maxSwipeDistance, Math.min(0, diff));
        } else {
            // When in 'custom' mode, allow swiping right (positive direction)
            newOffset = Math.min(maxSwipeDistance, Math.max(0, diff));
        }
        
        setSwipeOffset(newOffset);
    };
    
    const handleTouchEnd = () => {
        if (touchStartX === null) return;
        
        // Determine if the swipe was significant enough to switch tabs
        // If swipe distance is more than 1/4 of the container width, switch tabs
        const threshold = 50; // Minimum pixels to trigger a tab switch
        
        if ((inputMode === 'suggestions' && swipeOffset < -threshold) ||
            (inputMode === 'custom' && swipeOffset > threshold)) {
            // Switch to the other mode
            handleModeSwitch(inputMode === 'suggestions' ? 'custom' : 'suggestions');
        }
        
        // Reset touch tracking and swipe offset
        setTouchStartX(null);
        setSwipeOffset(0);
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
            
            {/* Adventure Mode Selector - with swipe support */}
            <div className="relative mb-8">
                <div 
                    className="flex bg-gradient-to-r from-slate-100/80 to-gray-100/80 dark:from-slate-800/80 dark:to-slate-700/80 rounded-2xl p-1.5 sm:p-2 border border-gray-200/60 dark:border-slate-600/60 shadow-inner backdrop-blur-sm relative overflow-hidden"
                    onTouchStart={(e) => handleTouchStart(e)}
                    onTouchMove={(e) => handleTouchMove(e)}
                    onTouchEnd={() => handleTouchEnd()}
                >
                    {/* Sliding indicator - moves with swipe and animation */}
                    <div 
                        className="absolute top-1.5 sm:top-2 bottom-1.5 sm:bottom-2 rounded-xl transition-all duration-300 ease-in-out"
                        style={{
                            left: '6px', // 1.5 * 4px = 6px padding on mobile, matches container padding
                            width: 'calc(50% - 6px)', // Half width minus left padding
                            background: inputMode === 'suggestions' 
                                ? 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))' 
                                : 'linear-gradient(to right, rgb(5, 150, 105), rgb(13, 148, 136))',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            transform: inputMode === 'suggestions' 
                                ? `translateX(${swipeOffset}px)` 
                                : `translateX(calc(100% + ${swipeOffset}px))`
                        }}
                    ></div>

                    <button
                        onClick={() => handleModeSwitch('suggestions')}
                        className={`relative flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-colors duration-300 ease-in-out group overflow-hidden z-10 ${inputMode === 'suggestions' ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                        <div className="flex items-center justify-center gap-3 relative z-10">
                            <span className={`text-xl transition-all duration-300 ${inputMode === 'suggestions' ? 'scale-110 rotate-3' : ''}`}>🏰</span>
                            <span className="font-bold tracking-wide">Explore Forts</span>
                        </div>
                    </button>
                    <button
                        onClick={() => handleModeSwitch('custom')}
                        className={`relative flex-1 py-4 px-6 rounded-xl text-sm font-bold transition-colors duration-300 ease-in-out group overflow-hidden z-10 ${inputMode === 'custom' ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                        <div className="flex items-center justify-center gap-3 relative z-10">
                            <span className={`text-xl transition-all duration-300 ${inputMode === 'custom' ? 'scale-110 rotate-3' : ''}`}>🥾</span>
                            <span className="font-bold tracking-wide">Plan a Trek</span>
                        </div>
                    </button>
                </div>
                
                {/* Tab Description */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                        {inputMode === 'suggestions' 
                            ? '🌟 Explore curated fort destinations across Maharashtra with detailed insights'
                            : '✍️ Describe your perfect trekking adventure and let us craft your journey'
                        }
                    </p>
                </div>
            </div>

            {inputMode === 'suggestions' ? (
                <div className="space-y-4 animate-fade-in-up" style={{animationDuration: '400ms'}}>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                            Popular Forts by Region
                        </h4>
                    </div>
                    
                    {filteredRegions.length === 0 ? (
                        <p className="text-gray-500 dark:text-slate-400 text-sm italic animate-fade-in" style={{animationDuration: '300ms'}}>
                            No forts match your current filters. Try adjusting your preferences above.
                        </p>
                    ) : (
                        <Accordion.Root
                            type="single"
                            collapsible
                            className="space-y-4"
                        >
                            {filteredRegions.map((region, regionIndex) => (
                                <Accordion.Item 
                                    key={region.region}
                                    value={region.region}
                                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                                    style={{animationDelay: `${regionIndex * 100}ms`, animationDuration: '500ms'}}
                                >
                                    {/* Region Header */}
                                    <Accordion.Header className="w-full">
                                        <Accordion.Trigger className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 group [&[data-state=open]>div>svg]:rotate-180">
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-gray-900 dark:text-slate-100 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{region.displayName}</h5>
                                                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors duration-200">{region.description}</p>
                                <div className="text-xs text-gray-600 dark:text-slate-400 font-medium mt-2 flex items-center gap-1">
                                                    <Castle className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                                                    {region.forts.length} {region.forts.length === 1 ? 'fort' : 'forts'} to explore
                                                </div>
                                            </div>
                                            <div className="text-gray-400 dark:text-slate-500 ml-4">
                                                <svg className="w-5 h-5 transition-transform duration-300 ease-in-out group-hover:text-gray-600 dark:group-hover:text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </Accordion.Trigger>
                                    </Accordion.Header>
                                    
                                    {/* Region Forts - Animated Accordion Content */}
                                    <Accordion.Content className="border-t border-gray-200 dark:border-slate-700 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                                        <div className="p-4 space-y-3">
                                            {region.forts.map((fort, fortIndex) => (
                                                <div
                                                    key={fort.name}
                                                    className={`bg-white dark:bg-slate-800 border rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                                                        filters.fortsList === fort.name 
                                                            ? 'border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' 
                                                            : 'border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg'
                                                    }`}
                                                    onClick={() => handleFortSuggestionClick(fort.name)}
                                                >
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h6 className="font-semibold text-gray-900 dark:text-slate-100 text-base">{fort.name}</h6>
                                                                        {filters.fortsList === fort.name && (
                                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-600">
                                                                                ✓ Selected
                                                                            </span>
                                                                        )}
                                                                    </div>
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
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Inline Create Itinerary Button - Shows when this fort is selected */}
                                                        {filters.fortsList === fort.name && (
                                                            <div className="border-t border-gray-200 dark:border-slate-600 bg-blue-50 dark:bg-slate-800/50 p-4">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Prevent card click when clicking button
                                                                        onGenerateItinerary();
                                                                    }}
                                                                    disabled={isLoading}
                                                                    className="w-full px-6 py-3 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                                >
                                                                    {isLoading ? (
                                                                        <React.Fragment>
                                                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                            </svg>
                                                                            Creating Your Adventure...
                                                                        </React.Fragment>
                                                                    ) : (
                                                                        <React.Fragment>
                                                                            🚀 Create Itinerary
                                                                        </React.Fragment>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                        
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
                                        </Accordion.Content>
                                    </Accordion.Item>
                            ))}
                        </Accordion.Root>
                    )}
                    
                </div>
            ) : (
                <ProtectedComponent
                    className="animate-fade-in-up"
                    requireAuth={true}
                >
                    <div style={{animationDuration: '400ms'}}>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Describe Your Trek</h4>
                        <textarea
                            value={customInput}
                            onChange={(e) => handleCustomInputChange(e.target.value)}
                            placeholder="Example: I want to visit Raigad and Torna forts over a weekend..."
                            className={`w-full p-3 border rounded-lg resize-none transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:scale-[1.02] bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 ${
                                inputError 
                                    ? 'border-red-500 focus:ring-red-500 animate-shake' 
                                    : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                            }`}
                            rows={3}
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <div className={`text-xs transition-colors duration-200 ${
                                customInput.length > 450 
                                    ? 'text-yellow-600 dark:text-yellow-400' 
                                    : customInput.length > 480 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-gray-500 dark:text-slate-400'
                            }`}>
                                {customInput.length}/500 characters
                            </div>
                            {inputError && (
                                <div className="text-xs text-red-500 animate-fade-in" style={{animationDuration: '200ms'}}>{inputError}</div>
                            )}
                        </div>
                    </div>
                </ProtectedComponent>
            )}


            {inputMode === 'custom' && canGenerate && (
                <ProtectedComponent requireAuth={true}>
                    <button
                        onClick={onGenerateItinerary}
                        disabled={isLoading}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 animate-fade-in-up flex items-center justify-center gap-2 font-semibold"
                        style={{animationDelay: '200ms', animationDuration: '300ms'}}
                    >
                        {isLoading ? (
                            <React.Fragment>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Your Adventure...
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                🚀 Create Itinerary
                            </React.Fragment>
                        )}
                    </button>
                </ProtectedComponent>
            )}

        </div>
    );
};

export default SmartItineraryInput;

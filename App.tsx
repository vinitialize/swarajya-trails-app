
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import SmartItineraryInput from './components/SmartItineraryInput';
import { generateItinerary, ItineraryFilters, getInspiration, ItineraryResult } from './services/geminiService';
import { LightbulbIcon, LocationPinIcon, SparklesIcon } from './components/icons';

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  return 'light';
};

const App: React.FC = () => {
  const [forts, setForts] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInspiring, setIsInspiring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showItinerary, setShowItinerary] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  
  const filters: ItineraryFilters = {
    fortsList: forts,
    difficulty: 'Any',
    regions: [],
    proximity: 'Any',
    mountainRange: 'Any',
    trekDuration: 'Any',
    trailTypes: [],
    historicalSignificance: 'Any',
    fortType: 'Any',
    keyFeatures: []
  };

  const isGenerateDisabled = useMemo(() => isLoading || isInspiring || !forts.trim(), [isLoading, isInspiring, forts]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleGenerateItinerary = useCallback(async () => {
    if (isGenerateDisabled) return;

    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setShowItinerary(true);

    try {
      const result = await generateItinerary(filters);
      setItinerary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setShowItinerary(false);
    } finally {
      setIsLoading(false);
    }
  }, [filters, isGenerateDisabled]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleGenerateItinerary();
    }
  };

  const handleInspireMe = async () => {
    setIsInspiring(true);
    setError(null);
    try {
      const fortName = await getInspiration(filters);
      setForts(`Trek to ${fortName}`);
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsInspiring(false);
    }
  };

  useEffect(() => {
    if (showItinerary) {
      const timer = setTimeout(() => {
        document.getElementById('itinerary-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showItinerary]);
  
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header theme={theme} onThemeToggle={handleThemeToggle} />
        <main className="container mx-auto px-4 py-8 flex-grow w-full">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            <SmartItineraryInput
              filters={filters}
              onFiltersChange={(newFilters) => {
                setForts(newFilters.fortsList);
              }}
              onGenerateItinerary={handleGenerateItinerary}
              isLoading={isLoading}
            />

            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative animate-fade-in-up" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {showItinerary && (
              <div id="itinerary-section" className="animate-fade-in-up" style={{ animationDelay: '150ms', opacity: 0 }}>
                <ItineraryDisplay 
                  content={itinerary?.itineraryText ?? null} 
                  isLoading={isLoading}
                  userLocation={userLocation}
                  fortCoordinates={itinerary?.coordinates ?? null}
                 />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default App;

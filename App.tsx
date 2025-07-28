
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import SmartItineraryInput from './components/SmartItineraryInput';
import FeatureGuard, { useFeatureFlags } from './components/FeatureGuard';
import DebugPanel from './components/DebugPanel';
import AdminPanel from './components/AdminPanel';
import { VersionDisplay } from './components/VersionDisplay';
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  
  // Get feature flags to check maintenance mode
  const { featureFlags } = useFeatureFlags();
  
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

  // Check for admin authentication status
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminAuth = localStorage.getItem('swarajya_admin_auth');
      const adminExpiry = localStorage.getItem('swarajya_admin_expiry');
      
      if (adminAuth && adminExpiry) {
        const expiryTime = parseInt(adminExpiry);
        const now = Date.now();
        
        if (now < expiryTime && adminAuth === 'authenticated') {
          setIsAdminAuthenticated(true);
        } else {
          // Clean up expired auth
          localStorage.removeItem('swarajya_admin_auth');
          localStorage.removeItem('swarajya_admin_expiry');
          setIsAdminAuthenticated(false);
        }
      } else {
        setIsAdminAuthenticated(false);
      }
    };

    checkAdminAuth();
    
    // Listen for admin auth changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'swarajya_admin_auth' || e.key === 'swarajya_admin_expiry') {
        checkAdminAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
      <FeatureGuard>
        <div className="min-h-screen flex flex-col">
          <Header theme={theme} onThemeToggle={handleThemeToggle} />
          <main className="container mx-auto px-4 py-8 flex-grow w-full">
            <div className="max-w-3xl mx-auto flex flex-col gap-8">
              
              {/* Fort Suggestions - Controlled by feature flag */}
              <FeatureGuard feature="fortSuggestionsEnabled">
                <SmartItineraryInput
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    setForts(newFilters.fortsList);
                  }}
                  onGenerateItinerary={handleGenerateItinerary}
                  isLoading={isLoading}
                />
              </FeatureGuard>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative animate-fade-in-up" role="alert">
                  <strong className="font-bold">Oops! </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Itinerary Generation - Controlled by feature flag */}
              {showItinerary && (
                <FeatureGuard feature="itineraryGenerationEnabled">
                  <div id="itinerary-section" className="animate-fade-in-up" style={{ animationDelay: '150ms', opacity: 0 }}>
                    <ItineraryDisplay 
                      content={itinerary?.itineraryText ?? null} 
                      isLoading={isLoading}
                      userLocation={userLocation}
                      fortCoordinates={itinerary?.coordinates ?? null}
                     />
                  </div>
                </FeatureGuard>
              )}
            </div>
          </main>
        </div>
        
        {/* Debug Panel - only shows in development */}
        <DebugPanel />
      </FeatureGuard>
      
      {/* Version Display - Only shown to authenticated admin users */}
      <VersionDisplay show={isAdminAuthenticated} />
      
      {/* Admin Panel - Only shown during maintenance mode */}
      {featureFlags?.maintenanceMode && <AdminPanel />}
    </>
  );
};

export default App;

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import AppDescription from './components/AppDescription';
import SmartItineraryInput from './components/SmartItineraryInput';
import FeatureGuard, { useFeatureFlags } from './components/FeatureGuard';
import DebugPanel from './components/DebugPanel';
import AdminPanel from './components/AdminPanel';
import { VersionDisplay } from './components/VersionDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { generateItinerary, ItineraryFilters, getInspiration, ItineraryResult } from './services/geminiService';


const App: React.FC = () => {
  const [forts, setForts] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInspiring, setIsInspiring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showItinerary, setShowItinerary] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);
  
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

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <ThemeProvider>
      <FeatureGuard>
        <div className="min-h-screen">
          <Header />
          
          {/* Main content with top padding to account for sticky header */}
          <main 
            className="pt-24 pb-8 transition-opacity duration-800 ease-in-out"
          >
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto flex flex-col gap-8">
                
                {/* Stacked Cards Container */}
                <div className="relative">
                  {/* App Description - Background Card (stays in place) */}
                  <div 
                    className="relative transition-all duration-300 ease-out"
                    style={{
                      zIndex: 1
                    }}
                  >
                    <AppDescription />
                  </div>
                  
                  {/* Fort Suggestions - Starts lower and slides up to cover AppDescription */}
                  <FeatureGuard feature="fortSuggestionsEnabled">
                    <div
                      className="relative transition-all duration-300 ease-out shadow-2xl"
                      style={{
                        marginTop: '40px', // Initial position below AppDescription
                        transform: `translateY(${Math.max(-scrollY * 0.8, -200)}px)`, // Slides up as user scrolls
                        zIndex: 10
                      }}
                    >
                      <SmartItineraryInput
                        filters={filters}
                        onFiltersChange={(newFilters) => {
                          setForts(newFilters.fortsList);
                        }}
                        onGenerateItinerary={handleGenerateItinerary}
                        isLoading={isLoading}
                      />
                    </div>
                  </FeatureGuard>
                </div>

                {error && (
                  <div 
                    className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative transition-all duration-400 ease-in-out" 
                    role="alert"
                  >
                    <strong className="font-bold">Oops! </strong>
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                {/* Itinerary Generation - Controlled by feature flag */}
                {showItinerary && (
                  <FeatureGuard feature="itineraryGenerationEnabled">
                    <div 
                      id="itinerary-section"
                      className="transition-transform duration-600 ease-in-out"
                    >
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
    </ThemeProvider>
  );
};

export default App;

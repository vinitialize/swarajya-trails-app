import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Calendar, Thermometer, Wind, CloudSun, Edit3, X, Info, Map, Sparkles } from 'lucide-react';
import { WeatherResult, getWeatherForecast } from '../services/geminiService';
import MiniMap from './MiniMap';
import DOMPurify from 'dompurify';

interface ItineraryDisplayProps {
  content: string | null;
  isLoading: boolean;
  userLocation: string;
  fortCoordinates: { lat: number; lng: number; } | null;
}

const SkeletonLoader: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-5/6"></div>
    </div>
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
    <div className="space-y-3 pl-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-5/6"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-4/6"></div>
    </div>
  </div>
);

const WeatherSkeleton: React.FC = () => (
    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
    </div>
);

// Generate weather warnings for trekking safety
const getWeatherWarnings = (weather: WeatherResult): { level: 'safe' | 'caution' | 'danger', warnings: string[] } => {
    const warnings: string[] = [];
    let level: 'safe' | 'caution' | 'danger' = 'safe';
    
    // Temperature warnings
    if (weather.temperatureMaxC > 35) {
        warnings.push('⚠️ Very hot conditions - carry extra water and trek early morning');
        level = 'caution';
    } else if (weather.temperatureMaxC > 30) {
        warnings.push('🌡️ Hot weather - stay hydrated and wear sun protection');
        level = level === 'safe' ? 'caution' : level;
    }
    
    if (weather.temperatureMinC < 5) {
        warnings.push('🥶 Very cold conditions - carry warm clothing and layers');
        level = 'caution';
    }
    
    // Weather condition warnings
    if (weather.icon === 'Thunderstorm') {
        warnings.push('⛈️ THUNDERSTORM ALERT - Avoid exposed ridges and peaks. Consider postponing trek');
        level = 'danger';
    } else if (weather.icon === 'Rain') {
        warnings.push('🌧️ Rainy conditions - trails may be slippery. Carry rain gear and extra grip footwear');
        level = level === 'safe' ? 'caution' : level;
    } else if (weather.icon === 'Fog') {
        warnings.push('🌫️ Poor visibility due to fog - stick to well-marked trails and carry navigation aids');
        level = level === 'safe' ? 'caution' : level;
    }
    
    // Wind warnings
    if (weather.windSpeedKmh > 40) {
        warnings.push('💨 Very strong winds - avoid exposed ridges and be extra careful near cliff edges');
        level = 'danger';
    } else if (weather.windSpeedKmh > 25) {
        warnings.push('🌬️ Strong winds expected - secure loose items and be cautious on exposed areas');
        level = level === 'safe' ? 'caution' : level;
    }
    
    // If no warnings, add a positive message
    if (warnings.length === 0) {
        warnings.push('✅ Good weather conditions for trekking - have a great adventure!');
    }
    
    return { level, warnings };
};

// Simple CSS-based weather icons that always work
const getWeatherIcon = (iconName: string, props: { className?: string }) => {
    const baseClasses = `${props.className || 'h-12 w-12'} flex items-center justify-center rounded-full font-bold text-2xl`;
    
    switch (iconName) {
        case 'Sunny': 
            return (
                <div className={`${baseClasses} bg-yellow-100 text-yellow-600 border-2 border-yellow-300`}>
                    ☀️
                </div>
            );
        case 'PartlyCloudy': 
            return (
                <div className={`${baseClasses} bg-blue-50 text-blue-600 border-2 border-blue-200`}>
                    ⛅
                </div>
            );
        case 'Cloudy': 
            return (
                <div className={`${baseClasses} bg-gray-100 text-gray-600 border-2 border-gray-300`}>
                    ☁️
                </div>
            );
        case 'Rain': 
            return (
                <div className={`${baseClasses} bg-blue-100 text-blue-700 border-2 border-blue-400`}>
                    🌧️
                </div>
            );
        case 'Thunderstorm': 
            return (
                <div className={`${baseClasses} bg-purple-100 text-purple-700 border-2 border-purple-400`}>
                    ⛈️
                </div>
            );
        case 'Snow': 
            return (
                <div className={`${baseClasses} bg-blue-50 text-blue-500 border-2 border-blue-200`}>
                    ❄️
                </div>
            );
        case 'Windy': 
            return (
                <div className={`${baseClasses} bg-green-50 text-green-600 border-2 border-green-200`}>
                    💨
                </div>
            );
        case 'Fog': 
            return (
                <div className={`${baseClasses} bg-gray-50 text-gray-500 border-2 border-gray-200`}>
                    🌫️
                </div>
            );
        default: 
            return (
                <div className={`${baseClasses} bg-slate-100 text-slate-600 border-2 border-slate-300`}>
                    🌤️
                </div>
            );
    }
}

const parseMarkdown = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const listTag = listType === 'ul' ? (
        <ul key={`ul-${elements.length}`} className="list-disc list-outside space-y-3 my-4 pl-6 text-slate-700 dark:text-slate-300">
          {listItems.map((item, index) => (
            <li key={`li-ul-${index}`} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }} />
          ))}
        </ul>
      ) : (
        <ol key={`ol-${elements.length}`} className="list-decimal list-outside space-y-3 my-4 pl-6 text-slate-700 dark:text-slate-300">
          {listItems.map((item, index) => (
            <li key={`li-ol-${index}`} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }} />
          ))}
        </ol>
      );
      elements.push(listTag);
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    if (/^Coordinates:/.test(line)) {
        return;
    }

    line = line.trim();

    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>');
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);

    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={index} className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-4 mb-6" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedLine.substring(2)) }} />);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={index} className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedLine.substring(3)) }} />);
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={index} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedLine.substring(4)) }} />);
    } else if (line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(formattedLine.substring(2));
    } else if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(olMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>'));
    } else if (line.length > 0) {
      flushList();
      elements.push(<p key={index} className="my-4 leading-relaxed text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formattedLine) }} />);
    }
  });

  flushList();
  return elements;
};


export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ content, isLoading, userLocation, fortCoordinates }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [showWeather, setShowWeather] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [showMap, setShowMap] = useState<boolean>(false);
  
  
  // Extract fort name from content title
  const getFortName = useCallback((content: string | null): string => {
    if (!content) return 'Fort Location';
    
    // Get the first line (title) and remove markdown header
    const title = content.split('\n')[0].replace(/^#\s*/, '').trim();
    
    return title || 'Fort Location';
  }, []);
  
  const loadingWords = ['Crafting... ✍️', 'Mapping... 🗺️', 'Exploring... 🧭'];
  const [animatedTitle, setAnimatedTitle] = useState(loadingWords[0]);
  
  useEffect(() => {
    if (content) {
      setEditedContent(content);
      setIsEditing(false); // Exit edit mode when new content arrives
      // Reset weather when itinerary changes
      setShowWeather(false);
      setWeather(null);
      setWeatherError(null);
    }
  }, [content]);
  
  useEffect(() => {
    if (isLoading) {
      setAnimatedTitle(loadingWords[0]); // Reset to the first word
      let wordIndex = 0;
      const intervalId = setInterval(() => {
        wordIndex = (wordIndex + 1) % loadingWords.length;
        setAnimatedTitle(loadingWords[wordIndex]);
      }, 2500); // Duration matches CSS animation
      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  const fetchWeather = useCallback(async (date?: string) => {
      if (!fortCoordinates) return;
      setIsWeatherLoading(true);
      setWeatherError(null);
      setWeather(null);
      try {
          const weatherData = await getWeatherForecast(fortCoordinates.lat, fortCoordinates.lng, date);
          setWeather(weatherData);
      } catch (err) {
          setWeatherError(err instanceof Error ? err.message : 'Could not fetch weather data.');
      } finally {
          setIsWeatherLoading(false);
      }
  }, [fortCoordinates]);
  
  const handleToggleWeather = () => {
    setShowWeather(prev => {
        const isOpening = !prev;
        // If opening for the first time and there's no weather data yet, fetch current weather.
        if (isOpening && !weather && fortCoordinates) {
            fetchWeather(); // Fetch current weather
        }
        return isOpening;
    });
  };

  const handleCopy = useCallback(() => {
    if (editedContent) {
      const plainText = editedContent
        .replace(/#+\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/[*]/g, '  -')
        .replace(/(\d+)\./g, '$1.');
        
      navigator.clipboard.writeText(plainText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [editedContent]);

  
  const handleEdit = () => setIsEditing(true);
  const handleSave = () => setIsEditing(false);
  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content || ''); // Revert changes to original content
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (fortCoordinates && showWeather) {
      fetchWeather(newDate);
    }
  };

  // Calculate date constraints for date picker
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 16); // Open-Meteo supports up to 16 days
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-6 md:p-8">
        <div className="flex justify-between items-start gap-4 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          {isLoading ? (
            <span className="animate-word-cycle inline-block">{animatedTitle}</span>
          ) : (
            'Your Trail Awaits'
          )}
        </h2>
        {!isLoading && content && (
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {fortCoordinates && (
              <>
                <button
                    onClick={handleToggleWeather}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 bg-indigo-100 hover:bg-indigo-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300"
                    aria-label="Check weather forecast"
                    aria-expanded={showWeather}
                >
                  <CloudSun className="h-4 w-4" />
                  Weather
                </button>
                <button
                    onClick={() => setShowMap(true)}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 bg-emerald-100 hover:bg-emerald-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-300"
                    aria-label="Show map location"
                >
                  <Map className="h-4 w-4" />
                  View Route
                </button>
              </>
            )}
            
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 bg-green-100 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-900/60 text-green-600 dark:text-green-300"
                  aria-label="Save changes"
                >
                  <Check className="h-4 w-4" /> Save
                </button>
                 <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                aria-label="Edit itinerary"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            )}

            <button
              onClick={handleCopy}
              disabled={isEditing}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isCopied 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {isCopied ? ( <> <Check className="h-4 w-4" /> Copied! </> ) : ( <> <Copy className="h-4 w-4" /> Copy </> )}
            </button>
          </div>
        )}
      </div>


      {showWeather && fortCoordinates && (
          <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 animate-fade-in-up" style={{animationDuration: '300ms'}}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Weather Forecast</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min={today}
                    max={maxDateString}
                  />
                </div>
              </div>
              
              {/* Weather forecast info card */}
              <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Plan Your Trek</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                      Check weather up to 16 days ahead to pick the perfect trekking day
                    </p>
                  </div>
                </div>
              </div>
              
              {isWeatherLoading && <WeatherSkeleton />}
              {weatherError && <p className="text-red-500 dark:text-red-400 text-sm">{weatherError}</p>}
              {weather && (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 shadow-inner ring-1 ring-black/5 dark:ring-white/10">
                      <div className="flex justify-between items-center gap-4">
                          <div className="flex-grow">
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{weather.locationName}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(weather.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                          </div>
                          <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-400">
                            {getWeatherIcon(weather.icon, {className: "h-12 w-12"})}
                          </div>
                      </div>
                      <p className="mt-4 text-slate-700 dark:text-slate-300">{weather.summary}</p>
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Thermometer className="h-5 w-5 text-red-500" />
                                <span>{weather.temperatureMinC}°C / <strong className="font-semibold text-slate-800 dark:text-slate-100">{weather.temperatureMaxC}°C</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Wind className="h-5 w-5 text-sky-500" />
                                <span><strong className="font-semibold text-slate-800 dark:text-slate-100">{weather.windSpeedKmh}</strong> km/h Wind</span>
                          </div>
                      </div>
                      
                      {(() => {
                          const warnings = getWeatherWarnings(weather);
                          return (
                              <div className={`mt-4 p-3 rounded-lg border-l-4 ${
                                  warnings.level === 'danger' 
                                      ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-500'
                                      : warnings.level === 'caution'
                                      ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500'
                                      : 'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-500'
                              }`}>
                                  <h4 className={`font-semibold text-sm mb-2 ${
                                      warnings.level === 'danger' 
                                          ? 'text-red-800 dark:text-red-300'
                                          : warnings.level === 'caution'
                                          ? 'text-yellow-800 dark:text-yellow-300'
                                          : 'text-green-800 dark:text-green-300'
                                  }`}>
                                      Trekking Safety
                                  </h4>
                                  <div className="space-y-1">
                                      {warnings.warnings.map((warning, index) => (
                                          <p key={index} className={`text-xs leading-relaxed ${
                                              warnings.level === 'danger' 
                                                  ? 'text-red-700 dark:text-red-400'
                                                  : warnings.level === 'caution'
                                                  ? 'text-yellow-700 dark:text-yellow-400'
                                                  : 'text-green-700 dark:text-green-400'
                                          }`}>
                                              {warning}
                                          </p>
                                      ))}
                                  </div>
                              </div>
                          );
                      })()}
                  </div>
              )}
          </div>
      )}
      
      {/* MiniMap - Shows at top when visible */}
      {showMap && fortCoordinates && (
        <div className="mb-8">
          <MiniMap
            coordinates={fortCoordinates}
            fortName={getFortName(content)}
            onClose={() => setShowMap(false)}
            isVisible={showMap}
            onDestinationChange={(newCoords, newName) => {
              // Update the fortCoordinates in parent component if needed
              console.log('Destination updated:', newName, newCoords);
            }}
          />
        </div>
      )}
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {isLoading ? <SkeletonLoader /> : (
          content ? (
            isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-300 min-h-[50vh] resize-y"
                aria-label="Edit itinerary content"
              />
            ) : parseMarkdown(editedContent)
          ) : null
        )}
      </div>
      
      {!isLoading && content && (
        <>
          {/* AI Content Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-300">AI-Generated Content</h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  This itinerary is generated by AI and may contain inaccuracies. Always verify critical details like timings, routes, and safety conditions before your trip.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

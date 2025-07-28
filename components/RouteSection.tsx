import React, { useState, useEffect } from 'react';
import { LocationPinIcon, NavigationIcon, PencilIcon, CheckIcon, XIcon } from './icons';

interface RouteSectionProps {
  isOpen: boolean;
  itineraryContent: string;
  fortCoordinates: { lat: number; lng: number };
}

export const RouteSection: React.FC<RouteSectionProps> = ({
  isOpen,
  itineraryContent,
  fortCoordinates
}) => {
  const [startingLocation, setStartingLocation] = useState('');
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [editableDestination, setEditableDestination] = useState('');

  // Extract fort name from itinerary content
  const extractFortName = (content: string): string => {
    // Pattern 1: Look for "Get ready for an exhilarating journey to 'Fort Name'"
    const journeyPattern = /Get ready for an exhilarating journey to\s+['"]?([^'"\n]+)['"]?/i;
    const journeyMatch = content.match(journeyPattern);
    
    if (journeyMatch && journeyMatch[1]) {
      const name = journeyMatch[1].trim();
      // Clean up common suffixes that might be included
      return name.replace(/,.*$/, '').trim();
    }
    
    // Pattern 2: Look for "# Fort Name" in headings
    const headingPattern = /^#\s+([^\n]+(?:Fort|Qila|Gad|Killa)[^\n]*)/mi;
    const headingMatch = content.match(headingPattern);
    
    if (headingMatch && headingMatch[1]) {
      const name = headingMatch[1].trim();
      if (!name.toLowerCase().includes('experience') && 
          !name.toLowerCase().includes('adventure') &&
          !name.toLowerCase().includes('trek')) {
        return name;
      }
    }
    
    // Pattern 3: Look for fort names in the content with various formats
    const fortPatterns = [
      // Standard format: "Name Fort", "Name Qila", etc.
      /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(Fort|Qila|Gad|Killa)\b/g,
      // Reverse format: "Fort Name", "Qila Name", etc.
      /\b(Fort|Qila|Gad|Killa)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/g,
      // With optional particles: "Fort of Name", "Qila e Name", etc.
      /\b(Fort|Qila|Gad|Killa)\s+(?:of\s+|e\s+)?([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/g
    ];
    
    for (const pattern of fortPatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex state
      
      while ((match = pattern.exec(content)) !== null) {
        let fortName;
        
        // Handle different capture group arrangements
        if (match[2] && (match[1] === 'Fort' || match[1] === 'Qila' || match[1] === 'Gad' || match[1] === 'Killa')) {
          // Reverse format: "Fort Name"
          fortName = `${match[1]} ${match[2]}`;
        } else if (match[1] && match[2]) {
          // Standard format: "Name Fort"
          fortName = `${match[1]} ${match[2]}`;
        } else {
          continue;
        }
        
        // Skip generic terms
        const lowerName = fortName.toLowerCase();
        if (!lowerName.includes('experience') && 
            !lowerName.includes('adventure') &&
            !lowerName.includes('trek') &&
            !lowerName.includes('trekking') &&
            !lowerName.includes('trail') &&
            !lowerName.includes('journey')) {
          return fortName;
        }
      }
    }
    
    // Pattern 4: Look for any capitalized words followed by common fort-related terms
    const generalPattern = /\b([A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})*)\s*(?:fort|qila|gad|killa|castle|citadel)/gi;
    let generalMatch;
    
    while ((generalMatch = generalPattern.exec(content)) !== null) {
      const name = generalMatch[1].trim();
      const lowerName = name.toLowerCase();
      
      if (name.length > 2 && 
          !lowerName.includes('experience') && 
          !lowerName.includes('adventure') &&
          !lowerName.includes('trek') &&
          !lowerName.includes('trail') &&
          !lowerName.includes('journey') &&
          !lowerName.includes('historic') &&
          !lowerName.includes('ancient')) {
        return `${name} Fort`;
      }
    }
        
    // Final fallback to coordinate-based description
    return `Fort Location (${fortCoordinates.lat.toFixed(3)}, ${fortCoordinates.lng.toFixed(3)})`;
  };

  const fortName = extractFortName(itineraryContent);
  const [currentDestination, setCurrentDestination] = useState(fortName);

  // Initialize editable destination when fort name changes
  useEffect(() => {
    setCurrentDestination(fortName);
    setEditableDestination(fortName);
  }, [fortName]);

  const handleEditDestination = () => {
    setIsEditingDestination(true);
    setEditableDestination(currentDestination);
  };

  const handleSaveDestination = () => {
    if (editableDestination.trim()) {
      setCurrentDestination(editableDestination.trim());
      setIsEditingDestination(false);
    }
  };

  const handleCancelDestinationEdit = () => {
    setEditableDestination(currentDestination);
    setIsEditingDestination(false);
  };

  const handleDestinationKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveDestination();
    } else if (e.key === 'Escape') {
      handleCancelDestinationEdit();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startingLocation.trim()) {
      openGoogleMapsDirections(startingLocation.trim(), currentDestination);
      setStartingLocation(''); // Clear the input after submission
    }
  };

  // Detect if we're in a mobile environment
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
  };

  // Detect if we're on iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  // Detect if we're on Android
  const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
  };

  // Detect if we're in an Android WebView
  const isAndroidWebView = () => {
    const ua = navigator.userAgent;
    return ua.includes('Android') && (ua.includes('wv') || ua.includes('WebView') || !ua.includes('Chrome'));
  };

  // Show navigation options modal for Android WebView
  const showNavigationOptions = (origin: string, destination: string, coordinates?: { lat: number; lng: number }) => {
    const coordsText = coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'Not available';
    const googleMapsUrl = coordinates 
      ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps/search/${encodeURIComponent(destination)}`;
    
    const directionsUrl = origin 
      ? `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`
      : googleMapsUrl;

    const message = `Navigation Information:\n\n` +
      `📍 Destination: ${destination}\n` +
      `📊 Coordinates: ${coordsText}\n` +
      (origin ? `🚗 From: ${origin}\n\n` : '\n') +
      `To navigate:\n` +
      `1. Copy this URL and open in your browser:\n${directionsUrl}\n\n` +
      `2. Or search in Google Maps for:\n"${destination}"\n\n` +
      (coordinates ? `3. Or use coordinates:\n${coordsText}` : '');

    alert(message);
  };

  // Copy text to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`${label} copied to clipboard!`);
    }
  };

  // Simple and reliable approach: direct window.open with optimized URLs
  const openMapsWithFallback = (primaryUrl: string, fallbackUrl: string, fallbackInfo?: { origin?: string; destination: string; coordinates?: { lat: number; lng: number } }) => {
    // For Android WebView, show navigation options modal
    if (isAndroidWebView() && fallbackInfo) {
      showNavigationOptions(fallbackInfo.origin || '', fallbackInfo.destination, fallbackInfo.coordinates);
      return;
    }

    try {
      // Try primary URL first (usually the more direct/app-friendly one)
      if (isMobile()) {
        // For mobile, try to trigger the app with a timeout fallback
        const startTime = Date.now();
        
        // Set a flag to track if we've already opened something
        let hasTriedFallback = false;
        
        // Try the primary URL (could be app scheme or direct Maps URL)
        window.location.href = primaryUrl;
        
        // If still on the page after a short delay, try fallback
        setTimeout(() => {
          if (!hasTriedFallback && document.hasFocus()) {
            hasTriedFallback = true;
            // Fallback to web version
            window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
          }
        }, 1500);
        
      } else {
        // For desktop, directly open web version
        const newWindow = window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          if (fallbackInfo) {
            showNavigationOptions(fallbackInfo.origin || '', fallbackInfo.destination, fallbackInfo.coordinates);
          }
        }
      }
    } catch (error) {
      console.log('Error opening maps, showing fallback options:', error);
      if (fallbackInfo) {
        showNavigationOptions(fallbackInfo.origin || '', fallbackInfo.destination, fallbackInfo.coordinates);
      }
    }
  };

  const openGoogleMapsDirections = (origin: string, destination: string) => {
    const originQuery = encodeURIComponent(origin);
    const destinationQuery = encodeURIComponent(destination);
    
    // Create optimized URLs that work reliably across platforms
    let primaryUrl;
    let fallbackUrl;
    
    if (fortCoordinates) {
      // Use coordinates for better accuracy - Google Maps URLs that work on all platforms
      primaryUrl = `https://www.google.com/maps/dir/${originQuery}/${fortCoordinates.lat},${fortCoordinates.lng}`;
      fallbackUrl = `https://maps.google.com/?saddr=${originQuery}&daddr=${fortCoordinates.lat},${fortCoordinates.lng}&directionsmode=driving`;
    } else {
      // Fallback to text-based search
      primaryUrl = `https://www.google.com/maps/dir/${originQuery}/${destinationQuery}`;
      fallbackUrl = `https://maps.google.com/?saddr=${originQuery}&daddr=${destinationQuery}&directionsmode=driving`;
    }
    
    console.log('Platform:', isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Other');
    console.log('Opening Maps - Primary URL:', primaryUrl);
    console.log('Fallback URL:', fallbackUrl);
    
    openMapsWithFallback(primaryUrl, fallbackUrl, {
      origin,
      destination,
      coordinates: fortCoordinates
    });
  };

  const handleViewDestinationOnly = () => {
    const destinationQuery = encodeURIComponent(currentDestination);
    
    // Create reliable URLs that work across all platforms
    let primaryUrl;
    let fallbackUrl;
    
    if (fortCoordinates) {
      // Use coordinates for better accuracy
      primaryUrl = `https://www.google.com/maps/search/${destinationQuery}/@${fortCoordinates.lat},${fortCoordinates.lng},15z`;
      fallbackUrl = `https://maps.google.com/?q=${fortCoordinates.lat},${fortCoordinates.lng}`;
    } else {
      // Fallback to text search
      primaryUrl = `https://www.google.com/maps/search/${destinationQuery}`;
      fallbackUrl = `https://maps.google.com/?q=${destinationQuery}`;
    }
    
    console.log('Platform:', isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Other');
    console.log('Opening Maps - Primary URL:', primaryUrl);
    console.log('Fallback URL:', fallbackUrl);
    
    openMapsWithFallback(primaryUrl, fallbackUrl, {
      destination: currentDestination,
      coordinates: fortCoordinates
    });
  };

  // Reset form when section opens
  useEffect(() => {
    if (isOpen) {
      setStartingLocation('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 animate-fade-in-up" style={{animationDuration: '300ms'}}>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <NavigationIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        Plan Your Route
      </h3>
      
      {/* Destination Info */}
      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <LocationPinIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Destination</span>
          </div>
          {!isEditingDestination && (
            <button
              onClick={handleEditDestination}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors duration-200"
              title="Edit destination name"
            >
              <PencilIcon className="h-3 w-3" />
              Edit
            </button>
          )}
        </div>
        
        {isEditingDestination ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={editableDestination}
              onChange={(e) => setEditableDestination(e.target.value)}
              onKeyDown={handleDestinationKeyPress}
              className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-600 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              autoFocus
            />
            <button
              onClick={handleSaveDestination}
              className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded transition-colors duration-200"
              title="Save changes"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancelDestinationEdit}
              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors duration-200"
              title="Cancel editing"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            {currentDestination}
          </p>
        )}
        
        {/* Info message about correcting the name */}
        {!isEditingDestination && (
          <p className="mt-2 text-xs text-indigo-500 dark:text-indigo-400 opacity-75">
            💡 If the destination name isn't quite right, you can edit it above for better navigation results.
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="starting-location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Your Starting Location
          </label>
          <div className="relative">
            <LocationPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              id="starting-location"
              type="text"
              value={startingLocation}
              onChange={(e) => setStartingLocation(e.target.value)}
              placeholder="e.g., Pune Railway Station, Mumbai, Kolhapur"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
              autoFocus
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enter your starting point to get turn-by-turn directions
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={!startingLocation.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <NavigationIcon className="h-4 w-4" />
            Get Directions
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleViewDestinationOnly}
              className="px-3 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 text-sm"
            >
              📍 View Location
            </button>
            
            <button
              type="button"
              onClick={() => {
                const coords = fortCoordinates ? `${fortCoordinates.lat},${fortCoordinates.lng}` : 'coordinates not available';
                copyToClipboard(coords, 'Coordinates');
              }}
              className="px-3 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 text-sm"
              disabled={!fortCoordinates}
            >
              📋 Copy GPS
            </button>
          </div>
        </div>
      </form>

      {/* Embedded Google Maps */}
      <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">📍 Interactive Map</h4>
        
        {/* Embedded Google Maps iframe using free method */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-green-200 dark:border-green-700">
          <iframe
            src={fortCoordinates 
              ? `https://maps.google.com/maps?q=${fortCoordinates.lat},${fortCoordinates.lng}&hl=es&z=15&output=embed`
              : `https://maps.google.com/maps?q=${encodeURIComponent(currentDestination)}&hl=es&z=15&output=embed`
            }
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Fort Location Map"
          ></iframe>
        </div>
        
        {/* Direct Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const directionsUrl = fortCoordinates 
                ? `https://www.google.com/maps/dir/?api=1&destination=${fortCoordinates.lat},${fortCoordinates.lng}&travelmode=driving`
                : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentDestination)}&travelmode=driving`;
              
              // Try to open in Google Maps app using intent for Android
              if (isAndroid()) {
                const intentUrl = fortCoordinates 
                  ? `intent://maps.google.com/maps?daddr=${fortCoordinates.lat},${fortCoordinates.lng}&directionsmode=driving#Intent;scheme=https;package=com.google.android.apps.maps;end`
                  : `intent://maps.google.com/maps?daddr=${encodeURIComponent(currentDestination)}&directionsmode=driving#Intent;scheme=https;package=com.google.android.apps.maps;end`;
                
                window.location.href = intentUrl;
                
                // Fallback to web version after a short delay
                setTimeout(() => {
                  window.open(directionsUrl, '_blank', 'noopener,noreferrer');
                }, 1000);
              } else {
                window.open(directionsUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            🧭 Navigate Now
          </button>
          
          <button
            onClick={() => {
              const mapsUrl = fortCoordinates 
                ? `https://www.google.com/maps/search/?api=1&query=${fortCoordinates.lat},${fortCoordinates.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentDestination)}`;
              
              // Try to open in Google Maps app using intent for Android
              if (isAndroid()) {
                const intentUrl = fortCoordinates 
                  ? `intent://maps.google.com/maps?q=${fortCoordinates.lat},${fortCoordinates.lng}#Intent;scheme=https;package=com.google.android.apps.maps;end`
                  : `intent://maps.google.com/maps?q=${encodeURIComponent(currentDestination)}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
                
                window.location.href = intentUrl;
                
                // Fallback to web version after a short delay
                setTimeout(() => {
                  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                }, 1000);
              } else {
                window.open(mapsUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200"
          >
            📍 View in Maps
          </button>
        </div>
        
        {/* Alternative App Links */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              const wazeUrl = fortCoordinates 
                ? `https://waze.com/ul?ll=${fortCoordinates.lat},${fortCoordinates.lng}&navigate=yes`
                : `https://waze.com/ul?q=${encodeURIComponent(currentDestination)}&navigate=yes`;
              window.open(wazeUrl, '_blank', 'noopener,noreferrer');
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md transition-colors duration-200"
            disabled={!fortCoordinates}
          >
            🚗 Waze
          </button>
          
          {isIOS() && (
            <button
              onClick={() => {
                const appleMapsUrl = fortCoordinates 
                  ? `maps://maps.google.com/maps?daddr=${fortCoordinates.lat},${fortCoordinates.lng}&dirflg=d`
                  : `maps://maps.google.com/maps?daddr=${encodeURIComponent(currentDestination)}&dirflg=d`;
                window.location.href = appleMapsUrl;
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded-md transition-colors duration-200"
            >
              🍎 Apple Maps
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>• Multiple navigation options for reliable access</p>
        <p>• 📱 Direct links work on all devices and apps</p>
        <p>• {fortCoordinates ? '🎯 Using precise GPS coordinates for accuracy' : '🔍 Using text search - edit destination name above for better results'}</p>
        <p>• Copy GPS coordinates to use in any navigation app</p>
      </div>
    </div>
  );
};

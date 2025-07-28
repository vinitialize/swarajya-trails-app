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

  // Detect if we're in an Android WebView
  const isAndroidWebView = () => {
    const ua = navigator.userAgent;
    return ua.includes('Android') && (ua.includes('wv') || ua.includes('WebView') || !ua.includes('Chrome'));
  };

  // Open maps with WebView-friendly approach
  const openMapsUrl = (url: string) => {
    try {
      if (isAndroidWebView()) {
        // For Android WebView, create a temporary link and click it
        // This approach bypasses the intent URL conversion
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (isMobile()) {
        // For other mobile devices, try to use location.href
        window.location.href = url;
      } else {
        // For desktop, use window.open with new tab
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        
        // Fallback if popup was blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = url;
        }
      }
    } catch (error) {
      // Final fallback - try creating and clicking a link
      try {
        const fallbackLink = document.createElement('a');
        fallbackLink.href = url;
        fallbackLink.target = '_blank';
        fallbackLink.rel = 'noopener noreferrer';
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        document.body.removeChild(fallbackLink);
      } catch (finalError) {
        // Last resort - show a message to user
        alert(`Please copy this URL and open it in your browser: ${url}`);
      }
    }
  };

  const openGoogleMapsDirections = (origin: string, destination: string) => {
    const originQuery = encodeURIComponent(origin);
    const destinationQuery = encodeURIComponent(destination);
    
    let mapUrl;
    
    if (isAndroidWebView()) {
      // For Android WebView, use the most basic Google Maps web URL
      // This avoids any app-specific parameters that might trigger intent conversion
      mapUrl = `https://www.google.com/maps?saddr=${originQuery}&daddr=${destinationQuery}`;
    } else {
      // For other environments, use the full-featured URL
      mapUrl = `https://maps.google.com/maps?saddr=${originQuery}&daddr=${destinationQuery}&dirflg=d`;
    }
    
    openMapsUrl(mapUrl);
  };

  const handleViewDestinationOnly = () => {
    const destinationQuery = encodeURIComponent(currentDestination);
    
    let mapUrl;
    
    if (isAndroidWebView()) {
      // For Android WebView, use basic www.google.com URLs
      if (fortCoordinates) {
        // Use coordinates for more accurate location
        mapUrl = `https://www.google.com/maps?q=${fortCoordinates.lat},${fortCoordinates.lng}`;
      } else {
        // Fallback to text search
        mapUrl = `https://www.google.com/maps?q=${destinationQuery}`;
      }
    } else {
      // For other environments, use full-featured URLs
      if (fortCoordinates) {
        // Use coordinates for more accurate location
        mapUrl = `https://maps.google.com/maps?q=${fortCoordinates.lat},${fortCoordinates.lng}+(${destinationQuery})`;
      } else {
        // Fallback to text search
        mapUrl = `https://maps.google.com/maps?q=${destinationQuery}`;
      }
    }
    
    openMapsUrl(mapUrl);
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
          
          <button
            type="button"
            onClick={handleViewDestinationOnly}
            className="w-full px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            View Destination Only
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>• Get turn-by-turn driving directions to your destination</p>
        <p>• Opens Google Maps (works on mobile devices and desktop)</p>
        <p>• Make sure to check road conditions before traveling</p>
      </div>
    </div>
  );
};

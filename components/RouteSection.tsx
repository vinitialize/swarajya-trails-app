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
    // Look for the specific pattern "Get ready for an exhilarating journey to 'Fort Name'"
    const journeyPattern = /Get ready for an exhilarating journey to\s+['"]?([^'"\n]+)['"]?/i;
    const journeyMatch = content.match(journeyPattern);
    
    if (journeyMatch && journeyMatch[1]) {
      return journeyMatch[1].trim();
    }
    
    // Fallback: Look for fort names in the entire content using pattern matching
    const fortPattern = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(Fort|Qila|Gad|Killa)\b/g;
    let match;
    
    while ((match = fortPattern.exec(content)) !== null) {
      const fortName = `${match[1]} ${match[2]}`;
      // Skip generic terms like "The Fort Experience"
      if (!fortName.toLowerCase().includes('experience') && 
          !fortName.toLowerCase().includes('adventure') &&
          !fortName.toLowerCase().includes('trek')) {
        return fortName;
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

  const openGoogleMapsDirections = (origin: string, destination: string) => {
    // Use Google Maps directions API with both origin and destination
    const originQuery = encodeURIComponent(origin);
    const destinationQuery = encodeURIComponent(destination);
    
    // Google Maps directions URL
    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destinationQuery}&travelmode=driving`;
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  const handleViewDestinationOnly = () => {
    // For users who just want to see the destination location
    const destinationQuery = encodeURIComponent(currentDestination);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${destinationQuery}`;
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
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
        <p>• Google Maps will open in a new tab with your route</p>
        <p>• Make sure to check road conditions before traveling</p>
      </div>
    </div>
  );
};

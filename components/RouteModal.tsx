import React, { useState, useEffect } from 'react';
import { LocationPinIcon, XIcon, NavigationIcon } from './icons';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryContent: string;
  fortCoordinates: { lat: number; lng: number };
}

export const RouteModal: React.FC<RouteModalProps> = ({
  isOpen,
  onClose,
  itineraryContent,
  fortCoordinates
}) => {
  const [startingLocation, setStartingLocation] = useState('');

  // Extract fort name from itinerary content
  const extractFortName = (content: string): string => {
    // Look for common patterns in the content to extract fort name
    const lines = content.split('\n');
    
    // Check for title line (usually starts with # or contains "Fort")
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for markdown headings that contain fort names
      if (trimmedLine.startsWith('#')) {
        const title = trimmedLine.replace(/^#+\s*/, '').trim();
        if (title.toLowerCase().includes('fort') || title.toLowerCase().includes('qila') || title.toLowerCase().includes('gad')) {
          return title;
        }
      }
      
      // Check for lines that explicitly mention fort names
      if (trimmedLine.toLowerCase().includes('fort') && trimmedLine.length < 100) {
        // Remove any markdown formatting
        const cleaned = trimmedLine.replace(/[*#]+/g, '').trim();
        if (cleaned.length > 0 && cleaned.length < 50) {
          return cleaned;
        }
      }
    }
    
// Fallback to coordinate-based description
const pattern = /\b(\w+(?:\s\w+)*\s(?:fort|qila|gad|killa))\b/i;

for (const line of lines) {
  const match = line.match(pattern);
  if (match) {
    return match[1].trim();
  }
}

return `Fort Location (${fortCoordinates.lat.toFixed(3)}, ${fortCoordinates.lng.toFixed(3)})`;
  };

  const fortName = extractFortName(itineraryContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startingLocation.trim()) {
      openGoogleMapsDirections(startingLocation.trim(), fortName);
      onClose();
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
    const destinationQuery = encodeURIComponent(fortName);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${destinationQuery}`;
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartingLocation('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <NavigationIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Plan Your Route
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Destination Info */}
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <LocationPinIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Destination</span>
            </div>
            <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              {fortName}
            </p>
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
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
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>• Get turn-by-turn driving directions to your destination</p>
            <p>• Google Maps will open in a new tab with your route</p>
            <p>• Make sure to check road conditions before traveling</p>
          </div>
        </div>
      </div>
    </div>
  );
};

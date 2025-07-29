import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationPinIcon, XIcon, DirectionsIcon, MapIcon, SatelliteIcon, TerrainIcon, NavigationIcon, InfoIcon } from './icons';
import { usePlatformDetection, openGoogleMaps } from '../utils/platformDetection';

interface MiniMapProps {
  coordinates: { lat: number; lng: number };
  fortName: string;
  onClose: () => void;
  isVisible: boolean;
  onDestinationChange?: (newCoordinates: { lat: number; lng: number }, newName: string) => void;
}

interface MapTypeOption {
  id: google.maps.MapTypeId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const mapTypeOptions: MapTypeOption[] = [
  {
    id: 'roadmap' as google.maps.MapTypeId,
    name: 'Roadmap',
    icon: MapIcon,
    description: 'Standard road map with labels'
  },
  {
    id: 'satellite' as google.maps.MapTypeId,
    name: 'Satellite',
    icon: SatelliteIcon,
    description: 'Satellite imagery'
  }
];

export const MiniMap: React.FC<MiniMapProps> = ({ coordinates, fortName, onClose, isVisible, onDestinationChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMapType, setSelectedMapType] = useState<google.maps.MapTypeId>('roadmap' as google.maps.MapTypeId);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [customDestination, setCustomDestination] = useState<string>('');
  const platform = usePlatformDetection();

  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    version: 'weekly',
    libraries: ['geometry', 'places']
  });

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !isVisible || map) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if API key is available
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      await loader.load();

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 15,
        mapTypeId: selectedMapType,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        gestureHandling: 'auto',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      // Create custom marker
      const markerInstance = new google.maps.Marker({
        position: coordinates,
        map: mapInstance,
        title: fortName,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#dc2626',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 180
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-lg text-gray-800">${fortName}</h3>
            <p class="text-sm text-gray-600 mt-1">Lat: ${coordinates.lat.toFixed(6)}</p>
            <p class="text-sm text-gray-600">Lng: ${coordinates.lng.toFixed(6)}</p>
          </div>
        `
      });

      markerInstance.addListener('click', () => {
        infoWindow.open(mapInstance, markerInstance);
      });

      // Initialize directions service
      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        draggable: false,
        panel: null,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#2563eb',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      setIsLoading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map');
      setIsLoading(false);
    }
  }, [coordinates, fortName, isVisible, selectedMapType, map]);

  const handleMapTypeChange = useCallback((mapTypeId: google.maps.MapTypeId) => {
    setSelectedMapType(mapTypeId);
    if (map) {
      map.setMapTypeId(mapTypeId);
    }
  }, [map]);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userPos);
        
        if (map) {
          // Add user location marker
          new google.maps.Marker({
            position: userPos,
            map: map,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#10b981',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });

          // Adjust map bounds to show both locations
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(coordinates);
          bounds.extend(userPos);
          map.fitBounds(bounds);
        }
      },
      (error) => {
        setError('Unable to get your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [map, coordinates]);

  const showDirectionsToFort = useCallback(() => {
    if (!directionsService || !directionsRenderer || !map || !userLocation) {
      if (!userLocation) {
        getUserLocation();
      }
      return;
    }

    setShowDirections(true);
    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin: userLocation,
        destination: coordinates,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          directionsRenderer.setDirections(response);
          
          // Show route info
          const route = response.routes[0];
          if (route) {
            const distance = route.legs[0].distance?.text || 'Unknown';
            const duration = route.legs[0].duration?.text || 'Unknown';
            
            const infoContent = `
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-lg text-gray-800 mb-2">Route to ${fortName}</h3>
                <div class="space-y-1 text-sm text-gray-600">
                  <p><strong>Distance:</strong> ${distance}</p>
                  <p><strong>Duration:</strong> ${duration}</p>
                  <p class="text-xs text-gray-500 mt-2">Route shown is for reference. Always verify road conditions.</p>
                </div>
              </div>
            `;
            
            const infoWindow = new google.maps.InfoWindow({
              content: infoContent,
              position: coordinates
            });
            
            infoWindow.open(map);
          }
        } else {
          setError('Unable to calculate route');
        }
      }
    );
  }, [directionsService, directionsRenderer, map, userLocation, coordinates, fortName, getUserLocation]);

  const clearDirections = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
    setShowDirections(false);
  }, [directionsRenderer]);

  // Reset state when component becomes invisible
  useEffect(() => {
    if (!isVisible) {
      // Reset all state when map is closed
      setMap(null);
      setMarker(null);
      setIsLoading(true);
      setError(null);
      setUserLocation(null);
      setShowDirections(false);
      setDirectionsService(null);
      setDirectionsRenderer(null);
      setSelectedMapType('roadmap' as google.maps.MapTypeId);
      setCustomDestination('');
    }
  }, [isVisible]);

  // Initialize map when component becomes visible
  useEffect(() => {
    if (isVisible) {
      initializeMap();
    }
  }, [isVisible, initializeMap]);

  // Update map when coordinates change
  useEffect(() => {
    if (map && marker && coordinates) {
      marker.setPosition(coordinates);
      map.setCenter(coordinates);
    }
  }, [map, marker, coordinates]);

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <LocationPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 truncate">{fortName}</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close map"
          >
            <XIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Destination Change */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Destination:</label>
            <div className="flex items-center gap-2 w-full sm:flex-1">
              <input
                type="text"
                value={customDestination || fortName}
                onChange={(e) => setCustomDestination(e.target.value)}
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter custom destination name..."
              />
              <button
              onClick={async () => {
                if (customDestination && customDestination !== fortName) {
                  try {
                    // Ensure Google Maps is loaded
                    if (!window.google || !window.google.maps) {
                      await loader.load();
                    }
                    
                    // Use Google Geocoding to get coordinates
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ address: customDestination }, (results, status) => {
                      if (status === 'OK' && results && results[0]) {
                        const location = results[0].geometry.location;
                        const newCoords = { lat: location.lat(), lng: location.lng() };
                        
                        // Update internal state immediately
                        if (map && marker) {
                          marker.setPosition(newCoords);
                          map.setCenter(newCoords);
                          marker.setTitle(customDestination);
                        }
                        
                        // Notify parent component
                        onDestinationChange?.(newCoords, customDestination);
                        
                        // Clear any previous errors
                        setError(null);
                      } else {
                        setError('Could not find location. Please check the destination name.');
                      }
                    });
                  } catch (err) {
                    setError('Failed to update destination. Please try again.');
                  }
                }
              }}
                disabled={!customDestination || customDestination === fortName}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Map Type Selector */}
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
              {mapTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleMapTypeChange(option.id)}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-w-0 ${
                      selectedMapType === option.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                    title={option.description}
                  >
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{option.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto">
              {!userLocation && (
                <button
                  onClick={() => {
                    if (platform?.isAndroidApp) {
                      // For Android app users, open in maps app directly
                      openGoogleMaps(coordinates, fortName);
                    } else {
                      // For web users, get user location first to show directions
                      getUserLocation();
                    }
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors whitespace-nowrap"
                >
                  <NavigationIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{platform?.isAndroidApp ? 'Open Maps' : 'Get Directions'}</span>
                </button>
              )}

              {userLocation && !showDirections && (
                <button
                  onClick={() => {
                    if (platform?.isAndroidApp) {
                      // For Android app users, open in maps app directly
                      openGoogleMaps(coordinates, fortName);
                    } else {
                      // For web users, open Google Maps with directions
                      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${coordinates.lat},${coordinates.lng}&destination_place_id=${encodeURIComponent(fortName)}`;
                      window.open(mapsUrl, '_blank');
                    }
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap"
                >
                  <DirectionsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{platform?.isAndroidApp ? 'Open Maps' : 'Get Directions'}</span>
                </button>
              )}

              {showDirections && (
                <button
                  onClick={clearDirections}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
                >
                  <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Clear Route</span>
                </button>
              )}
              {/* Show internal directions for web users only */}
              {userLocation && !showDirections && !platform?.isAndroidApp && (
                <button
                  onClick={showDirectionsToFort}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap"
                  title="Show route on map"
                >
                  <MapIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Show Route</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Loading map...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <div className="text-center p-6">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Map Error</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(fortName)}`, '_blank')}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Open in Google Maps
                  </button>
                  <button
                    onClick={() => {
                      // Try to open in native maps app
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                      const isAndroid = /Android/.test(navigator.userAgent);
                      
                      if (isIOS) {
                        // Try Apple Maps first, fallback to Google Maps
                        const appleUrl = `maps://maps.apple.com/?q=${coordinates.lat},${coordinates.lng}`;
                        const googleUrl = `comgooglemaps://?q=${coordinates.lat},${coordinates.lng}&center=${coordinates.lat},${coordinates.lng}&zoom=15`;
                        
                        // Try Apple Maps first
                        window.location.href = appleUrl;
                        
                        // Fallback to Google Maps after a short delay
                        setTimeout(() => {
                          window.location.href = googleUrl;
                        }, 500);
                      } else if (isAndroid) {
                        // Try Google Maps app, fallback to generic geo intent
                        const googleUrl = `google.navigation:q=${coordinates.lat},${coordinates.lng}`;
                        const geoUrl = `geo:${coordinates.lat},${coordinates.lng}?q=${coordinates.lat},${coordinates.lng}`;
                        
                        try {
                          window.location.href = googleUrl;
                        } catch {
                          window.location.href = geoUrl;
                        }
                      } else {
                        // Desktop - open in web browser
                        window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
                      }
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Open in Maps App
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <InfoIcon className="h-4 w-4" />
            <span>Map data from Google Maps. Always verify routes and conditions before traveling.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;

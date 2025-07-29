/**
 * Platform detection utilities for determining the environment
 * the web app is running in (Android app WebView, browser, etc.)
 */

export interface PlatformInfo {
  isAndroidApp: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  userAgent: string;
}

/**
 * Detects if the app is running inside the Android WebView
 * by checking the user agent string
 */
export const detectPlatform = (): PlatformInfo => {
  const userAgent = navigator.userAgent;
  
  // Check for Android WebView - the Android app sets a specific user agent
  const isAndroidApp = userAgent.includes('Mobile Safari/537.36') && 
                      userAgent.includes('Chrome/91.0.4472.120') &&
                      userAgent.includes('Android');
  
  // General platform detection
  const isAndroid = /Android/.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isMobile = isAndroid || isIOS;
  
  return {
    isAndroidApp,
    isAndroid,
    isIOS,
    isMobile,
    userAgent
  };
};

/**
 * Hook for React components to get platform information
 */
export const usePlatformDetection = () => {
  return detectPlatform();
};

/**
 * Opens Google Maps in the most appropriate way based on the platform
 */
export const openGoogleMaps = (coordinates: { lat: number; lng: number }, placeName: string) => {
  const platform = detectPlatform();
  
  if (platform.isAndroidApp) {
    // For Android app users, use location name for better search results
    // Primary geo URL with location name and coordinates as fallback
    const geoUrl = `geo:0,0?q=${encodeURIComponent(placeName)}`;
    const geoUrlWithCoords = `geo:${coordinates.lat},${coordinates.lng}?q=${encodeURIComponent(placeName)}`;
    const googleNavUrl = `google.navigation:q=${encodeURIComponent(placeName)}`;
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(placeName)}`;
    
    // Try opening via Android intent mechanism
    try {
      // Create an invisible link and trigger it
      const link = document.createElement('a');
      link.href = geoUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Set a timeout to check if the intent was handled
      setTimeout(() => {
        // If we're still here after 1 second, try the Google Maps URL fallback
        window.open(mapsUrl, '_blank');
      }, 1000);
      
    } catch (error) {
      console.warn('Geo intent failed, trying Google Maps URL:', error);
      // Direct fallback to Google Maps URL
      window.open(mapsUrl, '_blank');
    }
  } else if (platform.isIOS) {
    // For iOS, try Apple Maps first with location name, then Google Maps
    const appleUrl = `maps://maps.apple.com/?q=${encodeURIComponent(placeName)}`;
    const googleUrl = `comgooglemaps://?q=${encodeURIComponent(placeName)}`;
    
    try {
      window.location.href = appleUrl;
      // Fallback to Google Maps after a delay
      setTimeout(() => {
        window.location.href = googleUrl;
      }, 500);
    } catch (error) {
      // Fallback to web Google Maps with location name
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(placeName)}`, '_blank');
    }
  } else if (platform.isAndroid) {
    // For Android browsers (not our app), try various intents with location name
    const googleUrl = `google.navigation:q=${encodeURIComponent(placeName)}`;
    const geoUrl = `geo:0,0?q=${encodeURIComponent(placeName)}`;
    
    try {
      window.location.href = googleUrl;
    } catch (error) {
      try {
        window.location.href = geoUrl;
      } catch (error2) {
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(placeName)}`, '_blank');
      }
    }
  } else {
    // Desktop or other platforms - open in web browser with location name
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(placeName)}`, '_blank');
  }
};

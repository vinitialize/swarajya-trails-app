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
    // For Android app users, try to use the geo intent which should work better
    const geoUrl = `geo:${coordinates.lat},${coordinates.lng}?q=${coordinates.lat},${coordinates.lng}(${encodeURIComponent(placeName)})`;
    
    // Try geo intent first
    try {
      window.location.href = geoUrl;
    } catch (error) {
      console.warn('Geo intent failed, trying Google Maps URL:', error);
      // Fallback to Google Maps URL
      const mapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      window.open(mapsUrl, '_blank');
    }
  } else if (platform.isIOS) {
    // For iOS, try Apple Maps first, then Google Maps
    const appleUrl = `maps://maps.apple.com/?q=${coordinates.lat},${coordinates.lng}`;
    const googleUrl = `comgooglemaps://?q=${coordinates.lat},${coordinates.lng}&center=${coordinates.lat},${coordinates.lng}&zoom=15`;
    
    try {
      window.location.href = appleUrl;
      // Fallback to Google Maps after a delay
      setTimeout(() => {
        window.location.href = googleUrl;
      }, 500);
    } catch (error) {
      // Fallback to web Google Maps
      window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
    }
  } else if (platform.isAndroid) {
    // For Android browsers (not our app), try various intents
    const googleUrl = `google.navigation:q=${coordinates.lat},${coordinates.lng}`;
    const geoUrl = `geo:${coordinates.lat},${coordinates.lng}?q=${coordinates.lat},${coordinates.lng}`;
    
    try {
      window.location.href = googleUrl;
    } catch (error) {
      try {
        window.location.href = geoUrl;
      } catch (error2) {
        window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
      }
    }
  } else {
    // Desktop or other platforms - open in web browser
    window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
  }
};

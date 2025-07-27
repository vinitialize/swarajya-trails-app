import { initializeApp } from "firebase/app";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: "AIzaSyBk-sDrYni7R5tN98cA_rYD8bEq0sHn0hE",
  authDomain: "astute-buttress-463406-b8.firebaseapp.com",
  projectId: "astute-buttress-463406-b8",
  storageBucket: "astute-buttress-463406-b8.firebasestorage.app",
  messagingSenderId: "381076047248",
  appId: "1:381076047248:web:5aad4a11bb2ec500e1df15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const remoteConfig = getRemoteConfig(app);

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     window.location.hostname.includes('dev');

// Configure Remote Config settings
remoteConfig.settings.minimumFetchIntervalMillis = isDevelopment ? 60000 : 300000; // 1 min dev, 5 min prod
remoteConfig.defaultConfig = {
  app_stage: isDevelopment ? "development" : "production",
  features_enabled: false,
  itinerary_generation_enabled: false,
  fort_suggestions_enabled: false,
  search_enabled: false,
  maintenance_mode: false,
  maintenance_message: "App is currently under maintenance. Please try again later.",
  whitelisted_users: "admin@swarajyatrails.com,test@example.com",
  min_app_version: "1.0.0",
  feature_announcement: ""
};

// Feature flags interface
export interface FeatureFlags {
  appStage: string;
  featuresEnabled: boolean;
  itineraryGenerationEnabled: boolean;
  fortSuggestionsEnabled: boolean;
  searchEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  whitelistedUsers: string[];
  minAppVersion: string;
  featureAnnouncement: string;
}

// Initialize and fetch remote config
let isConfigInitialized = false;
let currentFeatureFlags: FeatureFlags = {
  appStage: "development",
  featuresEnabled: false,
  itineraryGenerationEnabled: false,
  fortSuggestionsEnabled: false,
  searchEnabled: false,
  maintenanceMode: false,
  maintenanceMessage: "App is currently under maintenance. Please try again later.",
  whitelistedUsers: ["admin@swarajyatrails.com", "test@example.com"],
  minAppVersion: "1.0.0",
  featureAnnouncement: ""
};

export const initializeRemoteConfig = async (): Promise<FeatureFlags> => {
  try {
    await fetchAndActivate(remoteConfig);
    
    currentFeatureFlags = {
      appStage: getValue(remoteConfig, 'app_stage').asString(),
      featuresEnabled: getValue(remoteConfig, 'features_enabled').asBoolean(),
      itineraryGenerationEnabled: getValue(remoteConfig, 'itinerary_generation_enabled').asBoolean(),
      fortSuggestionsEnabled: getValue(remoteConfig, 'fort_suggestions_enabled').asBoolean(),
      searchEnabled: getValue(remoteConfig, 'search_enabled').asBoolean(),
      maintenanceMode: getValue(remoteConfig, 'maintenance_mode').asBoolean(),
      maintenanceMessage: getValue(remoteConfig, 'maintenance_message').asString(),
      whitelistedUsers: getValue(remoteConfig, 'whitelisted_users').asString().split(',').map(email => email.trim()),
      minAppVersion: getValue(remoteConfig, 'min_app_version').asString(),
      featureAnnouncement: getValue(remoteConfig, 'feature_announcement').asString()
    };
    
    isConfigInitialized = true;
    console.log('🚀 Remote Config initialized:', currentFeatureFlags);
    
    return currentFeatureFlags;
  } catch (error) {
    console.error('❌ Failed to initialize Remote Config:', error);
    // Return default development config on error
    return currentFeatureFlags;
  }
};

export const getFeatureFlags = (): FeatureFlags => {
  return currentFeatureFlags;
};

export const isFeatureEnabled = (featureName: keyof FeatureFlags): boolean => {
  if (!isConfigInitialized) {
    console.warn('⚠️ Remote Config not initialized, using default values');
  }
  
  // Master switch check
  if (!currentFeatureFlags.featuresEnabled && featureName !== 'maintenanceMode') {
    return false;
  }
  
  return currentFeatureFlags[featureName] as boolean;
};

export const isUserWhitelisted = (userEmail: string): boolean => {
  return currentFeatureFlags.whitelistedUsers.includes(userEmail.toLowerCase());
};

export const checkAppVersion = (currentVersion: string): boolean => {
  const minVersion = currentFeatureFlags.minAppVersion;
  // Simple version comparison (you might want to use a proper semver library)
  return currentVersion >= minVersion;
};

// Manual refresh function to immediately fetch new values (bypass cache)
export const refreshFeatureFlags = async (): Promise<FeatureFlags> => {
  try {
    console.log('🔄 Manually refreshing feature flags...');
    
    // Force fetch new values by bypassing cache
    await fetchAndActivate(remoteConfig);
    
    // Update current flags
    currentFeatureFlags = {
      appStage: getValue(remoteConfig, 'app_stage').asString(),
      featuresEnabled: getValue(remoteConfig, 'features_enabled').asBoolean(),
      itineraryGenerationEnabled: getValue(remoteConfig, 'itinerary_generation_enabled').asBoolean(),
      fortSuggestionsEnabled: getValue(remoteConfig, 'fort_suggestions_enabled').asBoolean(),
      searchEnabled: getValue(remoteConfig, 'search_enabled').asBoolean(),
      maintenanceMode: getValue(remoteConfig, 'maintenance_mode').asBoolean(),
      maintenanceMessage: getValue(remoteConfig, 'maintenance_message').asString(),
      whitelistedUsers: getValue(remoteConfig, 'whitelisted_users').asString().split(',').map(email => email.trim()),
      minAppVersion: getValue(remoteConfig, 'min_app_version').asString(),
      featureAnnouncement: getValue(remoteConfig, 'feature_announcement').asString()
    };
    
    console.log('✅ Feature flags refreshed:', currentFeatureFlags);
    return currentFeatureFlags;
  } catch (error) {
    console.error('❌ Failed to refresh feature flags:', error);
    return currentFeatureFlags;
  }
};

export { app, remoteConfig };

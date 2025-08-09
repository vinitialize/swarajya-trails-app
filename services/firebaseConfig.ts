import { initializeApp } from "firebase/app";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";
// Auth will be initialized in authService.ts to avoid circular dependencies

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase with error handling
let app: any = null;
let remoteConfig: any = null;

try {
  // Only initialize Firebase if we have a valid project ID
  if (firebaseConfig.projectId && firebaseConfig.projectId !== 'undefined') {
    app = initializeApp(firebaseConfig);
    remoteConfig = getRemoteConfig(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase project ID not found, skipping Firebase initialization');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  console.log('🛡️ App will continue without Firebase features');
}

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname.startsWith('127.0.0.') ||
                     window.location.hostname.endsWith('.local') ||
                     window.location.hostname.includes('dev') ||
                     window.location.port === '5173' ||
                     window.location.port === '3000';

// Configure Remote Config settings if available
if (remoteConfig) {
  remoteConfig.settings.minimumFetchIntervalMillis = isDevelopment ? 60000 : 300000; // 1 min dev, 5 min prod
  remoteConfig.defaultConfig = {
    app_stage: isDevelopment ? "development" : "production",
    features_enabled: isDevelopment ? true : false,
    itinerary_generation_enabled: isDevelopment ? true : false,
    fort_suggestions_enabled: isDevelopment ? true : false,
    search_enabled: isDevelopment ? true : false,
    maintenance_mode: false,
    maintenance_message: "App is currently under maintenance. Please try again later.",
    whitelisted_users: "admin@swarajyatrails.com,test@example.com",
    min_app_version: "1.0.0",
    feature_announcement: ""
  };
}

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
  appStage: isDevelopment ? "development" : "production",
  featuresEnabled: isDevelopment ? true : false,
  itineraryGenerationEnabled: isDevelopment ? true : false,
  fortSuggestionsEnabled: isDevelopment ? true : false,
  searchEnabled: isDevelopment ? true : false,
  maintenanceMode: false,
  maintenanceMessage: "App is currently under maintenance. Please try again later.",
  whitelistedUsers: ["admin@swarajyatrails.com", "test@example.com"],
  minAppVersion: "1.0.0",
  featureAnnouncement: ""
};

export const initializeRemoteConfig = async (): Promise<FeatureFlags> => {
  try {
    // Check if Firebase config is properly set before attempting to initialize
    const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    
    if (!firebaseProjectId || !firebaseApiKey || firebaseApiKey === 'dummy_firebase_api_key' || !remoteConfig) {
      console.warn('⚠️ Firebase configuration incomplete or remoteConfig not available, using default feature flags');
      isConfigInitialized = true;
      return currentFeatureFlags;
    }
    
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
    console.log('🛡️ Using default production-safe feature flags');
    
    // Use production-safe defaults when Firebase fails
    currentFeatureFlags = {
      appStage: "production",
      featuresEnabled: true,  // Enable features in production
      itineraryGenerationEnabled: true,
      fortSuggestionsEnabled: true,
      searchEnabled: true,
      maintenanceMode: false,
      maintenanceMessage: "App is currently under maintenance. Please try again later.",
      whitelistedUsers: ["admin@swarajyatrails.com"],
      minAppVersion: "1.0.0",
      featureAnnouncement: ""
    };
    
    isConfigInitialized = true;
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

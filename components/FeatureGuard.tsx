import React, { useEffect, useState } from 'react';
import { initializeRemoteConfig, getFeatureFlags, isFeatureEnabled, FeatureFlags, refreshFeatureFlags } from '../services/firebaseConfig';

interface FeatureGuardProps {
  children: React.ReactNode;
  feature?: keyof FeatureFlags;
  fallback?: React.ReactNode;
  showLoadingState?: boolean;
}

interface MaintenanceScreenProps {
  message: string;
  featureAnnouncement?: string;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ message, featureAnnouncement }) => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Maintenance</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {featureAnnouncement && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">🎉 What's Coming</h3>
            <p className="text-blue-800 text-sm">{featureAnnouncement}</p>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
          <span>We'll be back soon...</span>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Thank you for your patience! 🙏
        </p>
      </div>
    </div>
  </div>
);

const FeatureDisabledScreen: React.FC<{ featureName: string }> = ({ featureName }) => (
  <div className="min-h-[400px] bg-gray-50 rounded-xl flex items-center justify-center p-8">
    <div className="text-center max-w-sm">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Temporarily Unavailable</h3>
      <p className="text-gray-600 text-sm">
        The {featureName.replace(/([A-Z])/g, ' $1').toLowerCase()} feature is currently disabled.
      </p>
      <p className="text-xs text-gray-400 mt-3">
        We're working on improvements! 🚧
      </p>
    </div>
  </div>
);

const LoadingScreen: React.FC = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const FeatureGuard: React.FC<FeatureGuardProps> = ({ 
  children, 
  feature, 
  fallback,
  showLoadingState = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const initConfig = async () => {
      try {
        setIsLoading(true);
        const flags = await initializeRemoteConfig();
        setFeatureFlags(flags);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize feature flags:', err);
        setError('Failed to load configuration');
        // Use default flags on error
        setFeatureFlags(getFeatureFlags());
      } finally {
        setIsLoading(false);
      }
    };

    // Check for admin authentication status
    const checkAdminAuth = () => {
      const adminAuth = localStorage.getItem('swarajya_admin_auth');
      const adminExpiry = localStorage.getItem('swarajya_admin_expiry');
      
      if (adminAuth && adminExpiry) {
        const expiryTime = parseInt(adminExpiry);
        const now = Date.now();
        
        if (now < expiryTime && adminAuth === 'authenticated') {
          setIsAdminAuthenticated(true);
        } else {
          // Clean up expired auth
          localStorage.removeItem('swarajya_admin_auth');
          localStorage.removeItem('swarajya_admin_expiry');
          setIsAdminAuthenticated(false);
        }
      }
    };

    initConfig();
    checkAdminAuth();
    
    // Listen for admin auth changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'swarajya_admin_auth') {
        checkAdminAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading && showLoadingState) {
    return <LoadingScreen />;
  }

  if (error && !featureFlags) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check for maintenance mode first (but allow admin bypass)
  if (featureFlags?.maintenanceMode && !isAdminAuthenticated) {
    return (
      <MaintenanceScreen 
        message={featureFlags.maintenanceMessage} 
        featureAnnouncement={featureFlags.featureAnnouncement}
      />
    );
  }

  // If no specific feature is being guarded, just check master toggle
  if (!feature) {
    if (featureFlags?.featuresEnabled) {
      return <>{children}</>;
    } else {
      return fallback || <FeatureDisabledScreen featureName="application" />;
    }
  }

  // Check specific feature
  const isEnabled = isFeatureEnabled(feature);
  
  if (isEnabled) {
    return <>{children}</>;
  }

  // Feature is disabled
  return fallback || <FeatureDisabledScreen featureName={feature} />;
};

export default FeatureGuard;

// Hook for using feature flags in components
export const useFeatureFlags = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(getFeatureFlags());

  useEffect(() => {
    const initConfig = async () => {
      try {
        const flags = await initializeRemoteConfig();
        setFeatureFlags(flags);
      } catch (error) {
        console.error('Failed to fetch feature flags:', error);
      }
    };

    initConfig();
    
    // Set up periodic refresh (optional)
    const interval = setInterval(async () => {
      try {
        const flags = await initializeRemoteConfig();
        setFeatureFlags(flags);
      } catch (error) {
        console.error('Failed to refresh feature flags:', error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    featureFlags,
    isFeatureEnabled: (feature: keyof FeatureFlags) => isFeatureEnabled(feature),
    getFeatureFlags: () => getFeatureFlags(),
    refreshFeatureFlags: () => refreshFeatureFlags()
  };
};

import React, { useState } from 'react';
import { useFeatureFlags } from './FeatureGuard';

const DebugPanel: React.FC = () => {
  const { featureFlags, refreshFeatureFlags } = useFeatureFlags();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (featureFlags.appStage !== 'development') {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFeatureFlags();
      console.log('✅ Feature flags refreshed manually');
    } catch (error) {
      console.error('❌ Failed to refresh feature flags:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
        title="Feature Flags Debug Panel"
      >
        🚩 Debug
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 max-w-sm w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">🚩 Feature Flags</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="mb-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-2"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  🔄 Refresh Flags
                </>
              )}
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              Platform: 🌐 Web
            </div>
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              Stage: {featureFlags.appStage}
            </div>
            
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className={`flex justify-between ${featureFlags.featuresEnabled ? 'text-green-600' : 'text-red-600'}`}>
                <span>Master Switch:</span>
                <span>{featureFlags.featuresEnabled ? '✅ ON' : '❌ OFF'}</span>
              </div>
              
              <div className={`flex justify-between ${featureFlags.itineraryGenerationEnabled ? 'text-green-600' : 'text-red-600'}`}>
                <span>Itinerary Gen:</span>
                <span>{featureFlags.itineraryGenerationEnabled ? '✅ ON' : '❌ OFF'}</span>
              </div>
              
              <div className={`flex justify-between ${featureFlags.fortSuggestionsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                <span>Fort Suggestions:</span>
                <span>{featureFlags.fortSuggestionsEnabled ? '✅ ON' : '❌ OFF'}</span>
              </div>
              
              <div className={`flex justify-between ${featureFlags.searchEnabled ? 'text-green-600' : 'text-red-600'}`}>
                <span>Search:</span>
                <span>{featureFlags.searchEnabled ? '✅ ON' : '❌ OFF'}</span>
              </div>
              
              <div className={`flex justify-between ${featureFlags.maintenanceMode ? 'text-orange-600' : 'text-green-600'}`}>
                <span>Maintenance:</span>
                <span>{featureFlags.maintenanceMode ? '🚧 ON' : '✅ OFF'}</span>
              </div>
            </div>

            {featureFlags.featureAnnouncement && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                <div className="text-xs font-semibold text-blue-800 dark:text-blue-200">Announcement:</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">{featureFlags.featureAnnouncement}</div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔄 Auto-refresh: Every 5min<br/>
              ⚡ Manual refresh: Click button above<br/>
              💾 Cache: 1 minute
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;

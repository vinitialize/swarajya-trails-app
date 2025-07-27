import React, { useState } from 'react';
import { useFeatureFlags } from './FeatureGuard';

const AdminPanel: React.FC = () => {
  const { featureFlags, refreshFeatureFlags } = useFeatureFlags();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  
  // Check localStorage auth on component mount
  React.useEffect(() => {
    const adminAuth = localStorage.getItem('swarajya_admin_auth');
    const adminExpiry = localStorage.getItem('swarajya_admin_expiry');
    
    if (adminAuth && adminExpiry) {
      const expiryTime = parseInt(adminExpiry);
      const now = Date.now();
      
      if (now < expiryTime && adminAuth === 'authenticated') {
        setIsAuthenticated(true);
        console.log('🔓 Admin session restored from localStorage');
      } else {
        // Clean up expired auth
        localStorage.removeItem('swarajya_admin_auth');
        localStorage.removeItem('swarajya_admin_expiry');
        console.log('🔒 Expired admin session cleared');
      }
    }
  }, []);

  // Simple password check (in production, use proper authentication)
  const adminPassword = 'SwarajyaAdmin2024!'; // Change this to a secure password

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setPassword('');
      
      // Set localStorage authentication for maintenance mode bypass
      // Valid for 8 hours
      const expiryTime = Date.now() + (8 * 60 * 60 * 1000);
      localStorage.setItem('swarajya_admin_auth', 'authenticated');
      localStorage.setItem('swarajya_admin_expiry', expiryTime.toString());
      
      console.log('🔓 Admin authenticated - maintenance mode bypass enabled');
    } else {
      alert('Invalid password');
    }
  };

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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsOpen(false);
    
    // Clear admin authentication (removes maintenance mode bypass)
    localStorage.removeItem('swarajya_admin_auth');
    localStorage.removeItem('swarajya_admin_expiry');
    console.log('🔒 Admin logged out - maintenance mode bypass disabled');
  };
  
  // Check if admin bypass is active
  const isMaintenanceBypassActive = () => {
    const adminAuth = localStorage.getItem('swarajya_admin_auth');
    const adminExpiry = localStorage.getItem('swarajya_admin_expiry');
    
    if (adminAuth && adminExpiry) {
      const expiryTime = parseInt(adminExpiry);
      const now = Date.now();
      return now < expiryTime && adminAuth === 'authenticated';
    }
    return false;
  };

  const toggleFlag = (flagName: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setPendingChanges(prev => ({
      ...prev,
      [flagName]: newValue
    }));
    
    // Show instruction for Firebase Console
    const instruction = `To ${newValue ? 'enable' : 'disable'} ${flagName.replace(/([A-Z])/g, ' $1').toLowerCase()}, go to Firebase Console and set "${flagName.replace(/([A-Z])/g, '_$1').toLowerCase()}" to ${newValue}`;
    console.log('📝 Firebase Update Required:', instruction);
    
    // Optional: Show toast or alert
    if (confirm(`Update ${flagName} to ${newValue ? 'ON' : 'OFF'}?\n\nThis will copy the Firebase parameter name to your clipboard.`)) {
      const firebaseParam = flagName.replace(/([A-Z])/g, '_$1').toLowerCase();
      navigator.clipboard.writeText(firebaseParam).then(() => {
        alert(`Parameter name "${firebaseParam}" copied to clipboard!\n\nGo to Firebase Console → Remote Config to update it to: ${newValue}`);
      }).catch(() => {
        alert(`Set "${firebaseParam}" to ${newValue} in Firebase Console → Remote Config`);
      });
    }
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/astute-buttress-463406-b8/remoteconfig', '_blank');
  };
  
  const clearAdminSession = () => {
    if (confirm('Clear admin session? This will disable maintenance mode bypass and you\'ll see the maintenance screen.')) {
      localStorage.removeItem('swarajya_admin_auth');
      localStorage.removeItem('swarajya_admin_expiry');
      console.log('🗑️ Admin session cleared - maintenance mode bypass disabled');
      alert('Admin session cleared! Refresh the page to see the maintenance screen.');
    }
  };

  const FlagToggle = ({ label, flagName, currentValue, isMaintenanceMode = false }: {
    label: string;
    flagName: string;
    currentValue: boolean;
    isMaintenanceMode?: boolean;
  }) => {
    const effectiveValue = pendingChanges[flagName] !== undefined ? pendingChanges[flagName] : currentValue;
    const hasChange = pendingChanges[flagName] !== undefined;
    
    return (
      <div className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${
            isMaintenanceMode 
              ? (effectiveValue ? 'text-orange-600' : 'text-green-600')
              : (effectiveValue ? 'text-green-600' : 'text-red-600')
          }`}>
            {label}:
          </span>
          {hasChange && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">pending</span>
          )}
        </div>
        <button
          onClick={() => toggleFlag(flagName, currentValue)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
            effectiveValue ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              effectiveValue ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Admin Toggle Button - Always visible but requires auth */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full shadow-lg transition-colors text-sm"
        title="Admin Panel"
      >
        🔧 Admin
      </button>

      {/* Admin Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 max-w-sm w-80">
          {!isAuthenticated ? (
            // Authentication Form
            <form onSubmit={handleAuth} className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">🔧 Admin Access</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
              >
                Login
              </button>
            </form>
          ) : (
            // Admin Dashboard
            <>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">🔧 Admin Panel</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Logout
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-2"
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
                <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Platform: 🌐 Web ({featureFlags.appStage})
                </div>
                
                {/* Admin Bypass Status */}
                {featureFlags.maintenanceMode && (
                  <div className={`p-2 rounded text-xs ${
                    isMaintenanceBypassActive() 
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-orange-50 border border-orange-200 text-orange-800'
                  }`}>
                    {isMaintenanceBypassActive() ? (
                      <>
                        🔓 <strong>Admin Bypass Active</strong><br/>
                        You can access the app during maintenance mode.
                      </>
                    ) : (
                      <>
                        🚧 <strong>Maintenance Mode ON</strong><br/>
                        Regular users will see the maintenance screen.
                      </>
                    )}
                  </div>
                )}
                
                {/* Feature Flag Toggles */}
                <div className="space-y-1">
                  <FlagToggle 
                    label="Master Switch" 
                    flagName="featuresEnabled" 
                    currentValue={featureFlags.featuresEnabled} 
                  />
                  <FlagToggle 
                    label="Itinerary Gen" 
                    flagName="itineraryGenerationEnabled" 
                    currentValue={featureFlags.itineraryGenerationEnabled} 
                  />
                  <FlagToggle 
                    label="Fort Suggestions" 
                    flagName="fortSuggestionsEnabled" 
                    currentValue={featureFlags.fortSuggestionsEnabled} 
                  />
                  <FlagToggle 
                    label="Search" 
                    flagName="searchEnabled" 
                    currentValue={featureFlags.searchEnabled} 
                  />
                  <FlagToggle 
                    label="Maintenance" 
                    flagName="maintenanceMode" 
                    currentValue={featureFlags.maintenanceMode} 
                    isMaintenanceMode={true}
                  />
                </div>
                
                {/* Firebase Console Button */}
                <div className="mt-3">
                  <button
                    onClick={openFirebaseConsole}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-xs flex items-center justify-center gap-2"
                  >
                    🔗 Open Firebase Console
                  </button>
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
                  🔄 Cache: 5 minutes in production<br/>
                  ⚡ Manual refresh: Use button above<br/>
                  🔧 Change flags in Firebase Console
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPanel;

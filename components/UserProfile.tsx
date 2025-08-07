import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, signOut, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user || isLoading) {
    return null;
  }

  const getInitials = (name: string | null): string => {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getUserGreeting = (): string => {
    const firstName = user.displayName?.split(' ')[0] || 'Explorer';
    return `Hello, ${firstName}!`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* User Avatar Button - Simplified to only show avatar */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
        aria-label="User menu"
      >
        {/* Avatar */}
        <div className="relative">
          {user.photoURL ? (
            <img
              src={user.photoURL.replace('s96-c', 's96-c') || user.photoURL} // Ensure good quality
              alt={user.displayName || 'User avatar'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20 shadow-sm"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div 
            className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center ${
              user.photoURL ? 'hidden' : ''
            }`}
          >
            {getInitials(user.displayName)}
          </div>
        </div>
      </button>

      {/* Dropdown Menu - Match header blur effect */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden z-50 animate-fade-in transform scale-100">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-600/50">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL.replace('s96-c', 's128-c') || user.photoURL} // Higher quality for dropdown
                  alt={user.displayName || 'User avatar'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold flex items-center justify-center shadow-md">
                  {getInitials(user.displayName)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                  {getUserGreeting()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Account Section */}
            <div className="px-4 py-2">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Account</h4>
            </div>
            
            {/* Menu item placeholders for future features */}
            <button 
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-150 flex items-center gap-3"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Your Treks</span>
              <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">Coming Soon</span>
            </button>
            
            <button 
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-150 flex items-center gap-3"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>Favorites</span>
              <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">Coming Soon</span>
            </button>

            {/* Divider */}
            <hr className="my-2 border-gray-200 dark:border-slate-600" />

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
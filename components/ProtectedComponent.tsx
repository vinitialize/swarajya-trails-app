import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAuthRequired?: () => void;
  requireAuth?: boolean;
  className?: string;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  fallback,
  onAuthRequired,
  requireAuth = true,
  className = ''
}) => {
  const { isAuthenticated, isLoading, signInWithGoogle, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If auth is not required, always show children
  if (!requireAuth) {
    return <div className={className}>{children}</div>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="flex items-center gap-3 text-gray-600 dark:text-slate-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // If authenticated, show children
  if (isAuthenticated) {
    return <div className={className}>{children}</div>;
  }

  // If custom fallback is provided, show it
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Handle direct Google sign-in
  const handleSignInClick = async () => {
    try {
      setIsSigningIn(true);
      onAuthRequired?.();
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className={className}>
      {/* Sign-in prompt card */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800/50 dark:to-slate-900 rounded-2xl border border-blue-200/50 dark:border-slate-700 p-6 text-center shadow-lg">
        <div className="max-w-md mx-auto">
          {/* App Icon */}
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img src="/icon.png" alt="Swarajya Trails" className="w-16 h-16 filter brightness-0 dark:brightness-100 transition-all duration-300" />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
            Ready to Plan Your Trek?
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            Sign in to unlock personalized trek recommendations, AI-powered itinerary planning, and save your favorite adventures.
          </p>
          
          {/* Features preview */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Custom Itineraries</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>AI Recommendations</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Route Planning</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Save Favorites</span>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <p>{error}</p>
            </div>
          )}
          
          {/* Sign in button */}
          <button
            onClick={handleSignInClick}
            disabled={isSigningIn}
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-gray-900 dark:text-white font-medium rounded-xl google-border-animate transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSigningIn ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{isSigningIn ? 'Signing In...' : 'Sign In to Continue'}</span>
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default ProtectedComponent;
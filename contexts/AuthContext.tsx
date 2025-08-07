import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, authService, AuthStateChangeCallback } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((authUser: AuthUser | null) => {
      setUser(authUser);
      setIsLoading(false);
      
      // Clear error when user state changes
      if (error) {
        setError(null);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [error]);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.signInWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(errorMessage);
      console.error('Sign in error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      await authService.signOut();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign out';
      setError(errorMessage);
      console.error('Sign out error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signInWithGoogle,
    signOut,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
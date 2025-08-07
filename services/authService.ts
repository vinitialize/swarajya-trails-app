import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { app } from './firebaseConfig';

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

// User interface for type safety
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Auth state callback type
export type AuthStateChangeCallback = (user: AuthUser | null) => void;

class AuthService {
  private authStateChangeCallbacks: AuthStateChangeCallback[] = [];
  private currentUser: AuthUser | null = null;
  private initialized = false;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    if (this.initialized) return;

    try {
      // Listen for auth state changes
      onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
          };
        } else {
          this.currentUser = null;
        }

        // Notify all callbacks
        this.authStateChangeCallbacks.forEach(callback => {
          callback(this.currentUser);
        });
      });

      this.initialized = true;
      console.log('✅ Auth service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize auth service:', error);
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    this.authStateChangeCallbacks.push(callback);
    
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.authStateChangeCallbacks.splice(index, 1);
      }
    };
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (!user.email) {
        throw new Error('Google account must have an email address');
      }

      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      };

      console.log('✅ User signed in successfully:', authUser.email);
      return authUser;
    } catch (error: any) {
      console.error('❌ Error signing in with Google:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/unauthorized-domain':
          const currentDomain = window.location.hostname;
          if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
            errorMessage = 'Development setup issue. Please check your Firebase configuration and ensure the Google provider is enabled.';
          } else {
            errorMessage = `Domain '${currentDomain}' is not authorized. Please add it to your Firebase authorized domains or test on localhost.`;
          }
          break;
        case 'auth/api-key-not-valid':
          errorMessage = 'Firebase API key is invalid. Please check your environment variables.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups and try again.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign in was cancelled due to another popup being opened.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many sign in attempts. Please try again later.';
          break;
        case 'auth/configuration-not-found':
          errorMessage = 'Firebase configuration is missing. Please check your environment variables.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Check if user's email is verified
  isEmailVerified(): boolean {
    return this.currentUser?.emailVerified ?? false;
  }

  // Get user's email
  getUserEmail(): string | null {
    return this.currentUser?.email ?? null;
  }

  // Get user's display name
  getUserDisplayName(): string | null {
    return this.currentUser?.displayName ?? null;
  }

  // Get user's photo URL
  getUserPhotoURL(): string | null {
    return this.currentUser?.photoURL ?? null;
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Helper functions for convenience
export const signInWithGoogle = () => authService.signInWithGoogle();
export const signOut = () => authService.signOut();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const isEmailVerified = () => authService.isEmailVerified();
export const getUserEmail = () => authService.getUserEmail();
export const getUserDisplayName = () => authService.getUserDisplayName();
export const getUserPhotoURL = () => authService.getUserPhotoURL();
export const onAuthStateChange = (callback: AuthStateChangeCallback) => authService.onAuthStateChange(callback);

export default authService;
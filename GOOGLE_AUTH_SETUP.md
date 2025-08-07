# Google Authentication Setup for SwarajyaTrails

## Overview
This document explains how to configure Google Authentication for the "Plan a Trek" feature in SwarajyaTrails.

## Prerequisites
1. Firebase project setup
2. Google Cloud Console project
3. Firebase Authentication enabled with Google provider

## Setup Instructions

### 1. Firebase Console Setup

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project or create a new one

2. **Enable Authentication**
   - Navigate to "Authentication" → "Sign-in method"
   - Enable "Google" as a sign-in provider
   - Add your domain to authorized domains

3. **Configure OAuth Settings**
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain

### 2. Environment Variables

Add these environment variables to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Google Cloud Console Setup

1. **Enable APIs**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Identity and Access Management (IAM) API"
   - Enable "Google Identity Toolkit API"

2. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Configure your app details:
     - App name: "SwarajyaTrails"
     - User support email: your email
     - App domain: your domain
     - Authorized domains: add your domain

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "SwarajyaTrails Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://yourdomain.com`
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - `https://yourdomain.com`

### 4. Testing the Setup

1. **Development Testing**
   ```bash
   npm run dev
   ```
   - Navigate to the "Plan a Trek" tab
   - Try to enter custom trek details
   - You should see the authentication prompt
   - Click "Sign In with Google" to test the flow

2. **Production Testing**
   - Deploy your app with the production environment variables
   - Test the authentication flow on your production domain

## Features Implemented

### 1. Authentication Service
- **File**: `services/authService.ts`
- Google OAuth sign-in
- Sign-out functionality
- Auth state management
- Error handling

### 2. Authentication Context
- **File**: `contexts/AuthContext.tsx`
- React context for auth state
- Loading states
- Error management

### 3. Authentication Modal
- **File**: `components/AuthModal.tsx`
- Beautiful sign-in modal
- Benefits explanation
- Google branding compliance

### 4. User Profile Component
- **File**: `components/UserProfile.tsx`
- User avatar display
- Dropdown with user info
- Sign-out functionality

### 5. Protected Component
- **File**: `components/ProtectedComponent.tsx`
- Wraps features requiring authentication
- Fallback UI for unauthenticated users
- Loading states

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different Firebase projects for dev/staging/production
   - Regularly rotate API keys

2. **Domain Security**
   - Only add trusted domains to authorized origins
   - Use HTTPS in production
   - Implement proper CORS policies

3. **User Data**
   - Only access necessary user information (email, name, photo)
   - Implement proper data privacy policies
   - Follow GDPR/privacy compliance requirements

## Troubleshooting

### Common Issues

1. **"Popup blocked" Error**
   - Ensure popups are allowed for your domain
   - Check browser settings

2. **"Unauthorized domain" Error**
   - Add your domain to Firebase authorized domains
   - Update Google Cloud Console OAuth settings

3. **"API key not valid" Error**
   - Verify Firebase configuration
   - Check environment variable names (must start with `VITE_`)
   - Ensure Firebase project is properly set up

4. **Authentication not working in production**
   - Verify production domain is added to authorized origins
   - Check HTTPS configuration
   - Ensure environment variables are set correctly

### Debug Steps

1. **Check Browser Console**
   - Look for Firebase/authentication errors
   - Verify environment variables are loaded

2. **Firebase Console Logs**
   - Check Authentication logs
   - Look for failed sign-in attempts

3. **Network Tab**
   - Verify API calls are being made
   - Check for CORS errors

## Future Enhancements

1. **Additional Providers**
   - Facebook authentication
   - Email/password authentication
   - Apple Sign-In

2. **User Management**
   - User profiles
   - Saved trek preferences
   - Trek history

3. **Advanced Features**
   - Social sharing
   - Community features
   - Trek recommendations based on history

## Support

For issues or questions:
1. Check Firebase documentation: [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
2. Review Google Identity documentation: [https://developers.google.com/identity](https://developers.google.com/identity)
3. Check the project's GitHub issues

---

**Note**: This implementation follows Google's branding guidelines and Firebase best practices for web authentication.
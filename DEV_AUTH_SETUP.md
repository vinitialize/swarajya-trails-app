# Firebase Development Configuration

## Local Development Setup (No Domain Required)

For development, Firebase automatically allows `localhost`, so you can test Google Authentication locally without any domain configuration.

### Quick Setup Steps:

1. **Firebase Console Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to "Authentication" → "Sign-in method"
   - Enable "Google" provider
   - **Important**: You don't need to add `localhost` to authorized domains - it's allowed by default

2. **Environment Variables**
   Create a `.env.local` file in your project root:
   ```env
   # Firebase Configuration (get these from Firebase Console → Project Settings)
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. **Google Cloud Console OAuth Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select the same project linked to Firebase
   - Go to "APIs & Services" → "Credentials"
   - Find your OAuth 2.0 Client ID (or create one)
   - In "Authorized JavaScript origins", add:
     - `http://localhost:5173` (Vite default port)
     - `http://localhost:3000` (if using different port)
   - In "Authorized redirect URIs", add:
     - `http://localhost:5173`
     - `http://localhost:3000`

### Testing Locally
```bash
# Start your development server
npm run dev

# Your app should be available at http://localhost:5173
# Google Auth will work on localhost without domain restrictions
```

## For Production Deployment

### Option 1: Free Hosting Solutions
Use free hosting with custom domains:

1. **Netlify** (Free tier with custom domain)
   - Deploy your app to Netlify
   - Connect a custom domain (you can get free domains from Freenom)
   - Add your custom domain to Firebase authorized domains

2. **Vercel** (Free tier with custom domain)
   - Deploy to Vercel
   - Connect custom domain
   - Add domain to Firebase

3. **Firebase Hosting** (Free tier)
   - Use Firebase's provided domain: `your-project-id.web.app`
   - This is automatically authorized for your Firebase project

### Option 2: Firebase Hosting (Simplest)
Firebase provides free hosting with auto-configured domains:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Build your project
npm run build

# Deploy to Firebase
firebase deploy
```

Your app will be available at `https://your-project-id.web.app` and authentication will work automatically.

## Alternative: Test with Firebase's Default Domain

If you want to test without setting up custom domains:

1. Deploy to Firebase Hosting (free)
2. Use the provided `.web.app` domain
3. This domain is pre-authorized for your Firebase project

## Environment Variables Template

Create these files in your project:

**.env.local** (for development):
```env
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-dev
VITE_FIREBASE_STORAGE_BUCKET=your-project-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**.env.production** (for production):
```env
VITE_FIREBASE_API_KEY=your_prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-prod
VITE_FIREBASE_STORAGE_BUCKET=your-project-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:xyz789
```

## Getting Firebase Configuration

1. Go to Firebase Console
2. Select your project
3. Click the gear icon → "Project settings"
4. Scroll down to "Your apps"
5. Click on your web app or create one
6. Copy the configuration object

It should look like this:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Use these values in your environment variables.

## Troubleshooting

### Common Issues:
1. **"auth/unauthorized-domain"** - Make sure you're testing on `localhost` or add your domain to Firebase
2. **"auth/api-key-not-valid"** - Check your environment variables are correct
3. **CORS errors** - Ensure your domain is in Google Cloud Console OAuth settings

### Debug Steps:
1. Open browser developer tools
2. Check Console for errors
3. Verify environment variables are loaded: `console.log(import.meta.env)`
4. Test on `http://localhost:5173` first

This approach lets you develop and test authentication without needing a custom domain!
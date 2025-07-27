# Admin Panel Guide for Swarajya Trails

## Overview
The Swarajya Trails web app now includes an **Admin Panel** that allows you to manage feature flags in production environments. This panel is protected by password authentication and provides tools to monitor and refresh feature flags.

## Access the Admin Panel

### 1. Find the Admin Button
- Go to your production URL: https://swarajya-trails-web-381076047248.us-central1.run.app
- Look for a red **🔧 Admin** button in the bottom-left corner of the page

### 2. Authentication
- Click the Admin button
- Enter the admin password: `SwarajyaAdmin2024!`
- Click "Login"

⚠️ **Security Note**: In a real production environment, you should:
- Change this password to something more secure
- Use proper authentication (OAuth, JWT, etc.)
- Consider environment variables for the password

## Admin Panel Features

### Current Feature Flag Status
The admin panel displays the current state of all feature flags:

- **Master Switch** - Controls if any features are enabled
- **Itinerary Generation** - Controls the itinerary generation feature
- **Fort Suggestions** - Controls the smart input suggestions
- **Search** - Controls search functionality
- **Maintenance Mode** - Puts the app into maintenance mode

### Manual Refresh
- Click **🔄 Refresh Flags** to immediately fetch the latest values from Firebase Remote Config
- This bypasses the 5-minute cache in production
- Useful when you've just updated flags in Firebase Console

### Environment Information
- Shows current platform (Web) and stage (production/development)
- Displays cache settings and refresh instructions

## Managing Feature Flags

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `astute-buttress-463406-b8`
3. Navigate to **Remote Config**
4. Modify the feature flag values:
   - `features_enabled` - Master switch for all features
   - `itinerary_generation_enabled` - Toggle itinerary generation
   - `fort_suggestions_enabled` - Toggle smart suggestions
   - `search_enabled` - Toggle search features
   - `maintenance_mode` - Enable/disable maintenance mode
5. Click **Publish changes**
6. Use the Admin Panel's refresh button to see changes immediately

### Option 2: Via Admin Panel
- The current admin panel is **read-only** for security
- It can only display current values and refresh them
- To actually change values, use Firebase Console

## Caching Behavior

### Development
- Cache interval: 1 minute
- Debug panel available (🚩 Debug button in bottom-right)
- Detailed console logs

### Production
- Cache interval: 5 minutes
- Admin panel available (🔧 Admin button in bottom-left)
- Reduced console logging for performance
- Manual refresh available via admin panel

## Troubleshooting

### Feature flags not updating?
1. Check if you published changes in Firebase Console
2. Use the admin panel's refresh button
3. Wait up to 5 minutes for automatic cache refresh
4. Check browser console for any errors

### Can't access admin panel?
1. Verify you're using the correct password: `SwarajyaAdmin2024!`
2. Clear browser cache and try again
3. Check if JavaScript is enabled

### Feature flags showing default values?
1. Check Firebase Remote Config setup
2. Verify API keys and project configuration
3. Check network connectivity
4. Look for errors in browser console

## Security Considerations

### Current Security Level: Basic
- Simple password protection
- No session management
- No user roles

### Recommended Improvements for Production:
1. **Replace password with proper authentication**:
   ```typescript
   // Example: Use Firebase Auth or OAuth
   const [user, setUser] = useState(null);
   useEffect(() => {
     onAuthStateChanged(auth, setUser);
   }, []);
   ```

2. **Add session timeout**:
   ```typescript
   const [authExpiry, setAuthExpiry] = useState(null);
   // Auto-logout after inactivity
   ```

3. **Role-based access**:
   ```typescript
   const isAdmin = user?.customClaims?.admin === true;
   ```

4. **Audit logging**:
   ```typescript
   const logAdminAction = (action, user) => {
     // Log to Firebase Analytics or Cloud Logging
   };
   ```

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Debug Panel | ✅ Available | ❌ Hidden |
| Admin Panel | ✅ Available | ✅ Available |
| Cache Duration | 1 minute | 5 minutes |
| Console Logs | Verbose | Minimal |
| Auto-refresh | Yes | No (manual only) |

## Next Steps

1. **Test the admin panel** on your production URL
2. **Change the admin password** to something more secure
3. **Update feature flags** in Firebase Console
4. **Test the refresh functionality**
5. **Consider implementing proper authentication** for production use

---

**Production URL**: https://swarajya-trails-web-381076047248.us-central1.run.app
**Admin Password**: `SwarajyaAdmin2024!`
**Firebase Project**: `astute-buttress-463406-b8`

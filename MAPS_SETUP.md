# Google Maps Integration Setup

## Overview
Your Swarajya Trails app now includes a minimalist Google Maps integration that displays fort locations without taking users away from your app. The maps feature includes:

- **Interactive Maps**: Terrain, Satellite, Road, and Hybrid views
- **Current Location**: Shows user's GPS location
- **Directions**: Turn-by-turn directions from user to fort
- **Minimalist Design**: Modal overlay that keeps users in your app
- **Mobile Friendly**: Responsive design that works on all devices

## API Configuration

### 1. Google Maps API Key
You can use the same Google Cloud project where you have your other APIs enabled. You need to:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `astute-buttress-463406-b8`
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (if not already enabled)
   - Directions API

### 2. Environment Variable
Add your Google Maps API key to your environment variables:

```bash
# Add this to your .env file
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Note**: You can use the same API key for both Gemini AI and Google Maps since they're both Google Cloud services.

## Features

### Map Types
- **Terrain**: Topographic view perfect for trekking
- **Satellite**: Aerial imagery
- **Roadmap**: Standard road map
- **Hybrid**: Satellite with road labels

### User Location & Directions
- Click "My Location" to show your current position
- Click "Directions" to get turn-by-turn route to the fort
- Route information includes distance and estimated time

### Fallback Options
- If Maps API fails, users get a fallback button to open Google Maps in a new tab
- Graceful error handling with user-friendly messages

## Security

### API Key Restrictions
For security, restrict your API key in Google Cloud Console:

1. **Application restrictions**: HTTP referrers (web sites)
   - Add your domains: `https://your-domain.com/*`, `https://swarajya-trails-*.run.app/*`

2. **API restrictions**: Restrict to only these APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API

### Environment Variables
- Never commit API keys to version control
- Use environment variables for all sensitive keys
- Consider using Google Cloud Secret Manager for production

## Integration Details

### Component Structure
```
MiniMap.tsx           # Main maps component
├── Map initialization
├── Multiple map types
├── User location detection
├── Directions service
├── Error handling
└── Mobile responsive UI
```

### Performance
- Maps load only when requested (not on page load)
- Lazy loading of Google Maps JavaScript API
- Efficient state management

## Usage

Users can access maps by:
1. Generating an itinerary for any fort
2. Clicking the "Map" button in the itinerary header
3. Exploring different map types and getting directions

## Testing

Test the integration with:
1. Desktop browsers (Chrome, Firefox, Safari)
2. Mobile devices (iOS Safari, Android Chrome)
3. Different network conditions
4. With and without location permissions

## Troubleshooting

### Common Issues
1. **Map not loading**: Check API key and browser console
2. **Location access denied**: Maps still work without user location
3. **Directions failing**: Fallback to Google Maps link provided

### Debug Mode
Check browser console for detailed error messages and API responses.

## Next Steps

Consider adding:
- Offline map tiles for remote areas
- Trail markers and points of interest
- Weather overlay on maps
- Multiple destination planning

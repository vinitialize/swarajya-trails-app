# Swarajya Trails App

A React-based fort trekking itinerary generator for Maharashtra's historical forts, powered by AI and featuring secure secret management.

## Features

- 🏰 **Fort Discovery**: Smart suggestions with difficulty levels and historical information
- 🤖 **AI-Powered Planning**: Custom trip planning with Google Gemini AI
- 🔍 **Advanced Filtering**: Filter by region, difficulty, trail type, and historical significance
- 🌤️ **Weather Integration**: Real-time weather forecasts for fort locations
- 🎨 **Modern UI**: Dark/light theme support with responsive design
- 🔒 **Secure**: Google Secret Manager integration for API key management

## Quick Start

**Prerequisites:** Node.js 18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:5173](http://localhost:5173)**

## Production Deployment

### With Google Secret Manager (Recommended)
```bash
# Load secrets and build
npm run build:with-secrets
```

### Manual Build
```bash
npm run build
```

## Environment Variables

Required environment variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Google Cloud (for Secret Manager)
GOOGLE_CLOUD_PROJECT=your_project_id
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini AI
- **Backend Services**: Firebase Remote Config
- **Weather**: Open-Meteo API (free, no key required)
- **Security**: Google Secret Manager
- **Deployment**: Google Cloud Run

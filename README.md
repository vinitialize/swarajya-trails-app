# Swarajya Trails App

A React-based fort trekking itinerary generator for Maharashtra's historical forts.

## Features

- Fort suggestions with difficulty levels and historical information
- Custom trip planning with AI-powered itinerary generation
- Advanced filtering by region, difficulty, trail type, and historical significance
- Dark/light theme support
- Responsive design for mobile and desktop

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Build for Production

```bash
npm run build
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI

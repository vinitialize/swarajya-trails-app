#!/usr/bin/env node

// Quick setup script for Firebase Auth development
const fs = require('fs');
const path = require('path');

console.log('\n🔐 SwarajyaTrails Firebase Auth Setup\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📄 Creating .env.local template...');
  
  const envTemplate = `# Firebase Configuration for Local Development
# Get these values from Firebase Console -> Project Settings -> Your Apps

VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Instructions:
# 1. Go to https://console.firebase.google.com/
# 2. Select your project (or create one)
# 3. Go to Project Settings (gear icon)
# 4. Scroll to "Your apps" section
# 5. Add a web app or select existing one
# 6. Copy the config values above
# 7. Enable Google sign-in in Authentication -> Sign-in method
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local template');
} else {
  console.log('📄 .env.local already exists');
}

// Check if Firebase config looks valid
require('dotenv').config({ path: envPath });

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredVars.filter(varName => 
  !process.env[varName] || process.env[varName].includes('your_')
);

if (missingVars.length > 0) {
  console.log('\n⚠️  Setup Required:');
  console.log('   Please update .env.local with your Firebase configuration');
  console.log('   Missing or template values:', missingVars.join(', '));
  console.log('\n📚 Quick Setup Guide:');
  console.log('   1. Visit: https://console.firebase.google.com/');
  console.log('   2. Create/select your project');
  console.log('   3. Enable Authentication -> Google sign-in');
  console.log('   4. Get config from Project Settings');
  console.log('   5. Update .env.local with real values');
} else {
  console.log('\n✅ Environment variables look good!');
  console.log('\n🚀 You can now run:');
  console.log('   npm run dev');
  console.log('\n   Your app will be available at http://localhost:5173');
  console.log('   Google Auth will work on localhost automatically!');
}

console.log('\n📖 For detailed setup instructions, see:');
console.log('   - DEV_AUTH_SETUP.md (development)');
console.log('   - GOOGLE_AUTH_SETUP.md (production)');
console.log('');

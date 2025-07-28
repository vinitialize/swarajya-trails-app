# Google Secret Manager Integration Guide

## 🔐 Using Google Secret Manager for Your App

### Step 1: Setup Secret Manager
```bash
# Enable the Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Store your Firebase API key
gcloud secrets create firebase-api-key --data-file=- <<< "your_firebase_api_key"

# Store your Gemini API key
gcloud secrets create gemini-api-key --data-file=- <<< "your_gemini_api_key"
```

### Step 2: Install Dependencies
```bash
npm install @google-cloud/secret-manager
```

### Step 3: Create Secret Manager Service
```typescript
// services/secretManager.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

class SecretManager {
  private client: SecretManagerServiceClient;
  private projectId: string;

  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'astute-buttress-463406-b8';
  }

  async getSecret(secretName: string): Promise<string> {
    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await this.client.accessSecretVersion({ name });
      
      const payload = version.payload?.data?.toString();
      if (!payload) {
        throw new Error(`Secret ${secretName} is empty`);
      }
      
      return payload;
    } catch (error) {
      console.error(`Error accessing secret ${secretName}:`, error);
      throw error;
    }
  }
}

export const secretManager = new SecretManager();
```

### Step 4: Update Firebase Config
```typescript
// services/firebaseConfig.ts
import { secretManager } from './secretManager';

const initializeFirebaseConfig = async () => {
  const firebaseConfig = {
    apiKey: await secretManager.getSecret('firebase-api-key'),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  
  return firebaseConfig;
};
```

### Step 5: Environment Variables (for development)
```bash
# .env.local
GOOGLE_CLOUD_PROJECT=astute-buttress-463406-b8
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

### Benefits:
- ✅ Centralized secret management
- ✅ Automatic encryption
- ✅ Audit trails
- ✅ Role-based access control
- ✅ Secret rotation capabilities
- ✅ Integration with Cloud Run, App Engine, etc.

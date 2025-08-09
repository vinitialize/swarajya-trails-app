import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Build-time script to load secrets from Google Secret Manager
 * and create environment files for development and production
 */
class SecretLoader {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'astute-buttress-463406-b8';
    
    // Check for authentication
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GCLOUD_PROJECT) {
      console.warn('⚠️  No Google Cloud credentials found. Will create template files only.');
      this.hasAuth = false;
    } else {
      this.client = new SecretManagerServiceClient();
      this.hasAuth = true;
    }
  }

  /**
   * Get a secret from Google Secret Manager
   */
  async getSecret(secretName) {
    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      console.log(`🔐 Loading secret: ${secretName}`);
      
      const [version] = await this.client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();
      
      if (!payload) {
        throw new Error(`Secret ${secretName} is empty`);
      }
      
      console.log(`✅ Successfully loaded: ${secretName}`);
      return payload;
    } catch (error) {
      console.error(`❌ Failed to load secret ${secretName}:`, error.message);
      throw error;
    }
  }

  /**
   * Load all required secrets and create environment files
   */
  async loadAllSecrets() {
    try {
      console.log('🚀 Starting secret loading process...');
      console.log(`📦 Project ID: ${this.projectId}`);

      // Define the secrets we need to load
      const secretsToLoad = [
        { name: 'firebase-api-key', envVar: 'VITE_FIREBASE_API_KEY' },
        { name: 'gemini-api-key', envVar: 'VITE_GEMINI_API_KEY' },
        { name: 'google-maps-api-key', envVar: 'VITE_GOOGLE_MAPS_API_KEY' }
      ];

      const envContent = [];
      const secrets = {};

      // Load each secret if we have authentication
      if (this.hasAuth) {
        for (const secret of secretsToLoad) {
          try {
            const value = await this.getSecret(secret.name);
            secrets[secret.name] = value;
            envContent.push(`${secret.envVar}=${value}`);
          } catch (error) {
            console.warn(`⚠️  Could not load ${secret.name}, continuing...`);
            // For development, we might want to use fallback values
            envContent.push(`# ${secret.envVar}=your_${secret.name.replace('-', '_')}_here`);
          }
        }
      } else {
        // No authentication - create template with placeholders
        console.log('📝 Creating template files without actual secrets...');
        for (const secret of secretsToLoad) {
          envContent.push(`# ${secret.envVar}=your_${secret.name.replace('-', '_')}_here`);
        }
      }

      // Add other environment variables that don't come from Secret Manager
      envContent.push('');
      envContent.push('# Firebase Configuration (non-secret)');
      envContent.push('VITE_FIREBASE_AUTH_DOMAIN=astute-buttress-463406-b8.firebaseapp.com');
      envContent.push('VITE_FIREBASE_PROJECT_ID=astute-buttress-463406-b8');
      envContent.push('VITE_FIREBASE_STORAGE_BUCKET=astute-buttress-463406-b8.firebasestorage.app');
      envContent.push('VITE_FIREBASE_MESSAGING_SENDER_ID=381076047248');
      envContent.push('VITE_FIREBASE_APP_ID=1:381076047248:web:5aad4a11bb2ec500e1df15');
      envContent.push('');
      envContent.push('# Google Cloud Configuration');
      envContent.push(`GOOGLE_CLOUD_PROJECT=${this.projectId}`);

      // Write to .env.local for development
      const envPath = join(process.cwd(), '.env.local');
      writeFileSync(envPath, envContent.join('\n'));
      console.log(`📄 Environment file created: ${envPath}`);

      // Create a .env.production template
      const prodEnvContent = envContent.map(line => {
        if (line.startsWith('VITE_') && line.includes('=') && !line.startsWith('#')) {
          const [key] = line.split('=');
          return `${key}={{${key}}}`;
        }
        return line;
      });

      const prodEnvPath = join(process.cwd(), '.env.production.template');
      writeFileSync(prodEnvPath, prodEnvContent.join('\n'));
      console.log(`📄 Production template created: ${prodEnvPath}`);

      console.log('✅ Secret loading completed successfully!');
      return secrets;

    } catch (error) {
      console.error('❌ Failed to load secrets:', error);
      process.exit(1);
    }
  }
}

// Run the script if called directly
if (process.argv[1] && process.argv[1].endsWith('loadSecrets.js')) {
  console.log('🔍 Script executed directly');
  const loader = new SecretLoader();
  loader.loadAllSecrets().catch(console.error);
} else {
  console.log('⚠️ Script not executed directly');
}

export { SecretLoader };

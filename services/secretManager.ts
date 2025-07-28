import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

/**
 * Secret Manager Service for securely retrieving API keys and secrets
 * from Google Cloud Secret Manager
 */
class SecretManager {
  private client: SecretManagerServiceClient;
  private projectId: string;
  private isServerSide: boolean;

  constructor() {
    // Check if we're running in a server environment (Node.js)
    this.isServerSide = typeof window === 'undefined';
    
    if (this.isServerSide) {
      this.client = new SecretManagerServiceClient();
      this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'astute-buttress-463406-b8';
    } else {
      // Client-side fallback - will throw error if used
      console.warn('SecretManager should only be used server-side for security reasons');
    }
  }

  /**
   * Retrieve a secret from Google Secret Manager
   * @param secretName - The name of the secret to retrieve
   * @returns Promise<string> - The secret value
   */
  async getSecret(secretName: string): Promise<string> {
    if (!this.isServerSide) {
      throw new Error('Secret Manager can only be used server-side for security reasons');
    }

    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      console.log(`🔐 Retrieving secret: ${secretName} from project: ${this.projectId}`);
      
      const [version] = await this.client.accessSecretVersion({ name });
      
      const payload = version.payload?.data?.toString();
      if (!payload) {
        throw new Error(`Secret ${secretName} is empty or not found`);
      }
      
      console.log(`✅ Successfully retrieved secret: ${secretName}`);
      return payload;
    } catch (error) {
      console.error(`❌ Error accessing secret ${secretName}:`, error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new Error(`Secret '${secretName}' not found in Google Secret Manager. Please ensure it exists and you have access.`);
        }
        if (error.message.includes('permission')) {
          throw new Error(`Permission denied accessing secret '${secretName}'. Please check your service account permissions.`);
        }
      }
      
      throw new Error(`Failed to retrieve secret '${secretName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a secret exists in Secret Manager
   * @param secretName - The name of the secret to check
   * @returns Promise<boolean> - Whether the secret exists
   */
  async secretExists(secretName: string): Promise<boolean> {
    if (!this.isServerSide) {
      return false;
    }

    try {
      await this.getSecret(secretName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get multiple secrets at once
   * @param secretNames - Array of secret names to retrieve
   * @returns Promise<Record<string, string>> - Object with secret names as keys and values
   */
  async getSecrets(secretNames: string[]): Promise<Record<string, string>> {
    if (!this.isServerSide) {
      throw new Error('Secret Manager can only be used server-side for security reasons');
    }

    const secrets: Record<string, string> = {};
    
    for (const secretName of secretNames) {
      try {
        secrets[secretName] = await this.getSecret(secretName);
      } catch (error) {
        console.error(`Failed to get secret ${secretName}:`, error);
        // Continue with other secrets even if one fails
      }
    }
    
    return secrets;
  }

  /**
   * Get project ID being used
   * @returns string - The Google Cloud Project ID
   */
  getProjectId(): string {
    return this.projectId;
  }
}

// Export singleton instance
export const secretManager = new SecretManager();

// Export types for type safety
export interface SecretConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  gemini: {
    apiKey: string;
  };
}

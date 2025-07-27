import { initializeApp } from 'firebase-admin/app';
import { getRemoteConfig } from 'firebase-admin/remote-config';

// Initialize Firebase Admin SDK
const app = initializeApp({
  projectId: 'astute-buttress-463406-b8'
});

const rc = getRemoteConfig(app);

async function addAndroidFlags() {
  try {
    console.log('📱 Adding Android-specific feature flags...');
    
    // Get current template
    const template = await rc.getTemplate();
    
    // Add Android-specific flags
    const androidFlags = {
      android_features_enabled: {
        defaultValue: { value: 'true' },
        description: 'Master switch for Android-specific features',
        valueType: 'BOOLEAN'
      },
      push_notifications_enabled: {
        defaultValue: { value: 'true' },
        description: 'Enable push notifications on Android',
        valueType: 'BOOLEAN'
      },
      offline_mode_enabled: {
        defaultValue: { value: 'true' },
        description: 'Enable offline mode with local caching',
        valueType: 'BOOLEAN'
      },
      native_sharing_enabled: {
        defaultValue: { value: 'true' },
        description: 'Enable native Android sharing functionality',
        valueType: 'BOOLEAN'
      },
      biometric_auth_enabled: {
        defaultValue: { value: 'false' },
        description: 'Enable biometric authentication (experimental)',
        valueType: 'BOOLEAN'
      },
      background_sync_enabled: {
        defaultValue: { value: 'true' },
        description: 'Enable background data synchronization',
        valueType: 'BOOLEAN'
      }
    };
    
    // Add only new flags that don't exist
    let addedCount = 0;
    for (const [key, config] of Object.entries(androidFlags)) {
      if (!template.parameters[key]) {
        template.parameters[key] = config;
        addedCount++;
        console.log(`➕ Added: ${key}`);
      } else {
        console.log(`⏭️  Exists: ${key}`);
      }
    }
    
    if (addedCount > 0) {
      // Publish the updated template
      const updatedTemplate = await rc.publishTemplate(template);
      console.log(`✅ Successfully added ${addedCount} Android flags to Remote Config`);
      console.log(`📄 Template version: ${updatedTemplate.version.versionNumber}`);
    } else {
      console.log('ℹ️  All Android flags already exist');
    }
    
  } catch (error) {
    console.error('❌ Error adding Android flags:', error);
  }
}

addAndroidFlags();

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateVersion() {
  const versionFilePath = path.join(__dirname, '..', 'version.json');
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  try {
    // Read current version from package.json if it exists
    let version = '1.0.0';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.version) {
        version = packageJson.version;
      }
    }
    
    // If no package.json version, try to read current version and increment patch
    if (version === '1.0.0' && fs.existsSync(versionFilePath)) {
      const currentVersionInfo = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
      const currentVersion = currentVersionInfo.version;
      
      // Parse version and increment patch number
      const versionParts = currentVersion.split('.');
      if (versionParts.length === 3) {
        const patch = parseInt(versionParts[2]) + 1;
        version = `${versionParts[0]}.${versionParts[1]}.${patch}`;
      }
    }
    
    // Create new version info
    const versionInfo = {
      version: version,
      buildDate: new Date().toISOString()
    };
    
    // Write to version.json
    fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));
    
    console.log(`✅ Version updated to ${version} at ${versionInfo.buildDate}`);
    console.log(`📄 Version file updated: ${versionFilePath}`);
    
  } catch (error) {
    console.error('❌ Failed to update version:', error.message);
    process.exit(1);
  }
}

// Always run when script is executed
updateVersion();

export { updateVersion };

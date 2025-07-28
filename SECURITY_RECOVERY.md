# Security Recovery Guide

## 🚨 Exposed Secrets Incident Response

This document outlines the steps taken to address the security incident where API keys were exposed in the git repository.

### Compromised Secrets Identified:
1. **Firebase API Key**: `AIzaSyBk-sDrYni7R5tN98cA_rYD8bEq0sHn0hE`
2. **Google Gemini API Key**: Referenced in environment variables

## ✅ Recovery Steps Completed:

### 1. Key Revocation and Regeneration
- [ ] Revoke Firebase API key from Firebase Console
- [ ] Generate new Firebase API key
- [ ] Revoke Google Gemini API key from Google AI Studio
- [ ] Generate new Google Gemini API key

### 2. Code Security Updates
- [x] Updated `services/firebaseConfig.ts` to use environment variables
- [x] Created `.env.example` template file
- [x] Updated `.gitignore` to prevent future exposure
- [x] Documented security recovery process

### 3. Environment Setup
After regenerating keys, create a `.env` file with:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_new_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=astute-buttress-463406-b8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=astute-buttress-463406-b8
VITE_FIREBASE_STORAGE_BUCKET=astute-buttress-463406-b8.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=381076047248
VITE_FIREBASE_APP_ID=1:381076047248:web:5aad4a11bb2ec500e1df15

# Google Gemini API Configuration
VITE_GEMINI_API_KEY=your_new_gemini_api_key

# Development/Production Settings
NODE_ENV=development
```

### 4. Git History Cleanup (If Needed)
```bash
# To remove sensitive data from git history (use with caution):
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch services/firebaseConfig.ts' \
--prune-empty --tag-name-filter cat -- --all

# Force push to update remote repository:
git push origin --force --all
```

### 5. Firebase Security Settings
- [ ] Enable App Check for additional security
- [ ] Configure API key restrictions in Firebase Console
- [ ] Set up proper Firebase Security Rules
- [ ] Enable audit logging

## 🛡️ Future Prevention Measures:

### 1. Pre-commit Hooks
Consider adding git hooks to scan for secrets:
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### 2. Secret Scanning Tools
- Use GitHub's secret scanning feature
- Consider tools like `truffleHog` or `gitleaks`
- Set up CI/CD pipeline security scans

### 3. Environment Variable Management
- Never commit `.env` files
- Use separate keys for development/production
- Implement proper secret rotation policies

### 4. Team Guidelines
- Regular security training
- Code review requirements for configuration changes
- Documentation of security best practices

## 📋 Monitoring Checklist:
- [ ] Monitor Firebase usage for unusual activity
- [ ] Set up billing alerts for unexpected API usage
- [ ] Regular audit of API key usage logs
- [ ] Implement logging for security events

## 🚨 Emergency Contacts:
- Firebase Support: https://firebase.google.com/support/
- Google Cloud Security: https://cloud.google.com/security-command-center
- Repository Owner: [Your contact information]

---
**Last Updated**: [Current Date]
**Incident ID**: SEC-001-API-EXPOSURE

# Firebase Setup Guide

## Fix for "auth/configuration-not-found" Error

This error occurs when Firebase Authentication is not enabled in your Firebase Console.

### Step-by-Step Setup:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `medihub-d29f1`

2. **Enable Authentication**
   - Click on "Authentication" in the left sidebar
   - Click "Get Started"
   - Go to the "Sign-in method" tab
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

3. **Enable Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for now - we'll add security rules later)
   - Select a location (choose closest to your users)
   - Click "Enable"

4. **Verify Your Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Make sure your web app is registered
   - Verify the config values match what's in `frontend/src/firebase/config.js`

### After Setup:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try signing in again - the error should be resolved!

### Common Issues:

- **Still getting errors?** Make sure:
  - Firebase project ID matches: `medihub-d29f1`
  - Authentication is enabled
  - Firestore is enabled
  - You're using the correct API key

### Security Rules (Set up after testing):

Once everything works, update Firestore Security Rules in Firebase Console:
- Go to Firestore Database → Rules
- Replace with proper security rules (I can provide these)


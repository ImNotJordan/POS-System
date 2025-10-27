# 🔥 Firebase Setup Guide

This guide will help you set up Firebase for your Embroidery POS System to enable cloud-based product management.

## Step 1: Install Firebase

Run this command in your project directory:

```bash
npm install firebase
```

## Step 2: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "embroidery-pos")
4. Follow the setup wizard (you can disable Google Analytics if you want)
5. Click "Create project"

## Step 3: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Give your app a nickname (e.g., "Embroidery POS Web")
3. Click "Register app"
4. Copy the Firebase configuration object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Configure Firebase in Your App

1. Open the file: `src/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // Replace with your actual values
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Set Up Firestore Database

1. In the Firebase Console, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in **test mode**" (for development)
   - ⚠️ **Important**: Test mode allows read/write access. For production, set up proper security rules!
4. Select a location (choose the closest to your users)
5. Click "Enable"

## Step 6: Security Rules (Optional but Recommended)

For production, update your Firestore security rules:

1. Go to Firestore Database → Rules
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{document=**} {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
  }
}
```

## Step 7: Test Your Setup

1. Run your app: `npm run dev`
2. Go to the **Admin** tab
3. Toggle "Use Firebase" ON
4. Try adding a new product
5. Check your Firebase Console → Firestore Database to see the data

## Troubleshooting

### Error: "Firebase: No Firebase App '[DEFAULT]' has been created"
- Make sure you've replaced the placeholder config values in `src/firebase.js`
- Ensure Firebase is installed: `npm install firebase`

### Error: "Missing or insufficient permissions"
- Your Firestore security rules are too restrictive
- Use test mode during development
- For production, set up Firebase Authentication

### Data not syncing
- Check browser console for errors
- Verify your Firebase config is correct
- Make sure Firestore is enabled in Firebase Console

## Using the Admin Panel

### Local Mode (Default)
- Changes are stored in browser memory only
- Data resets when you refresh the page
- Good for testing without Firebase

### Firebase Mode
1. Toggle "Use Firebase" ON in the Admin tab
2. All products are loaded from Firebase
3. Add/Edit/Delete operations save to Firebase
4. Changes persist across sessions and devices

## Next Steps

- Set up Firebase Authentication for admin login
- Add Firebase Storage for product images
- Implement backup and export features
- Add user roles and permissions

## Important Notes

⚠️ **Security**: The current setup is for development. For production:
- Enable Firebase Authentication
- Set up proper security rules
- Use environment variables for sensitive config
- Never commit API keys to public repositories

📚 **Resources**:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Get Started](https://firebase.google.com/docs/firestore/quickstart)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

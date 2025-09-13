# 🔥 Firebase Setup Guide for Play School Website

This guide will help you set up Firebase for your Play School website. Follow these steps to get your database and authentication working.

## 📋 Prerequisites

- A Google account
- Basic understanding of web development
- Your React project ready

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Enter project name: `play-school-website` (or your preferred name)
   - Choose whether to enable Google Analytics (optional)
   - Click "Create project"

3. **Wait for Project Creation**
   - Firebase will set up your project
   - Click "Continue" when ready

## 🔐 Step 2: Enable Authentication

1. **Go to Authentication**
   - In the left sidebar, click "Authentication"
   - Click "Get started"

2. **Enable Email/Password Sign-in**
   - Click on "Sign-in method" tab
   - Click "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## 🗄️ Step 3: Create Firestore Database

1. **Go to Firestore Database**
   - In the left sidebar, click "Firestore Database"
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" (we'll secure it later)
   - Click "Next"

3. **Choose Location**
   - Select a location close to your users (e.g., `us-central1` for US)
   - Click "Done"

## 📱 Step 4: Add Web App

1. **Add Web App**
   - Click the web icon (`</>`)
   - Enter app nickname: `play-school-website`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

2. **Copy Configuration**
   - Firebase will show your config object
   - **Copy this entire config object** - you'll need it in the next step

## ⚙️ Step 5: Update Your Code

1. **Open `src/firebase/config.ts`**
   - Replace the placeholder values with your actual Firebase config

2. **Your config should look like this:**
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## 🔒 Step 6: Set Up Security Rules

1. **Go to Firestore Rules**
   - In Firestore Database, click "Rules" tab
   - Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin users can read/write all data
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Teachers can read most data, write attendance
    match /attendance/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
  }
}
```

2. **Click "Publish"**

## 🗂️ Step 7: Create Database Collections

Firebase will automatically create collections when you first add data, but you can manually create them:

**Collections to create:**
- `users` - User accounts and roles
- `students` - Student records
- `financialRecords` - Income/expense records
- `photos` - Gallery photos
- `events` - School events
- `attendance` - Student attendance records

## 🚀 Step 8: Test Your Setup

1. **Start your React app:**
   ```bash
   npm start
   ```

2. **Try to sign up a new user**
   - Go to `/signup`
   - Create an account
   - Check Firebase Console to see if user was created

3. **Check Authentication**
   - Go to Firebase Console > Authentication
   - You should see your new user

4. **Check Firestore**
   - Go to Firebase Console > Firestore Database
   - You should see your user document in the `users` collection

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check your API key in `config.ts`
   - Make sure you copied the entire config object

2. **"Firebase: Error (auth/operation-not-allowed)"**
   - Go to Authentication > Sign-in method
   - Make sure Email/Password is enabled

3. **"Firebase: Error (permission-denied)"**
   - Check your Firestore security rules
   - Make sure you're in "test mode" initially

4. **"Firebase: Error (auth/network-request-failed)"**
   - Check your internet connection
   - Check if Firebase is accessible in your region

### Still Having Issues?

1. **Check Browser Console**
   - Look for error messages
   - Check Network tab for failed requests

2. **Verify Firebase Project**
   - Make sure you're in the correct project
   - Check if services are enabled

3. **Check Dependencies**
   - Make sure `firebase` is installed: `npm install firebase`

## 📚 Next Steps

Once Firebase is working:

1. **Secure Your App**
   - Update security rules for production
   - Add email verification
   - Set up password reset

2. **Add More Features**
   - File uploads to Firebase Storage
   - Real-time updates
   - Offline support

3. **Deploy**
   - Use Firebase Hosting
   - Set up custom domain

## 🆘 Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

---

**🎉 Congratulations!** Your Play School website now has a real database and authentication system!

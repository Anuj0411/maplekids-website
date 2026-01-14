# Firestore Security Rules Update

## Current Issue
The error "Missing or insufficient permissions" occurs because:

1. Admin creates a new user with Firebase Auth
2. The new user becomes the current user in Firebase Auth
3. The new user tries to write to Firestore, but the security rules block them
4. The security rules require the user to exist in the users collection first, but they can't create their own document

## Solution: Update Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules and update the rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to create their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.uid == resource.data.createdBy ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Allow users to create their own user document (for new users)
    match /users/{userId} {
      allow create: if request.auth != null && 
        (request.auth.uid == resource.data.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
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
    
    // Students can read their own data
    match /students/{studentId} {
      allow read: if request.auth != null && 
        (resource.data.authUid == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher']);
    }
  }
}
```

## Alternative: Temporary Development Rules

For development/testing, you can use more permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read/write (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING: Only use the development rules for testing. Never use them in production!**

## Steps to Update Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `maplekids-213fe`
3. Go to Firestore Database → Rules
4. Replace the current rules with the updated rules above
5. Click "Publish"

## After Updating Rules:

1. Try creating a user again
2. The user should be created successfully
3. The user should appear in both Firebase Auth and Firestore
4. The user should be able to sign in immediately

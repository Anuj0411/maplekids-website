# 🚨 QUICK FIX for Permission Errors

## Immediate Solution

The permission errors are happening because the Firestore security rules are blocking user creation. Here's the quickest fix:

### Step 1: Update Firestore Rules (TEMPORARY - FOR DEVELOPMENT)

1. Go to: https://console.firebase.google.com/
2. Select project: `maplekids-213fe`
3. Go to: **Firestore Database** → **Rules**
4. **Replace ALL the current rules** with this simple rule:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **"Publish"**

### Step 2: Test User Creation

1. Go back to your app
2. Try creating a user again
3. It should work now!

### Step 3: After Testing (IMPORTANT)

Once you've confirmed user creation works, you can update to more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.uid == resource.data.createdBy);
    }
    
    // Allow creation of user documents
    match /users/{userId} {
      allow create: if request.auth != null;
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

## Why This Happens

1. Admin creates a new user with Firebase Auth
2. The new user becomes the "current user" 
3. The new user tries to write to Firestore
4. The security rules block them because they don't have permission yet
5. This creates a chicken-and-egg problem

## The Fix

The temporary rule allows any authenticated user to read/write, which solves the permission issue during user creation.

**⚠️ Remember: The temporary rule is only for development. Use the secure rules for production!**

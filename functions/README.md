# Firebase Cloud Functions for User Deletion

This directory contains Firebase Cloud Functions that handle complete user deletion from both Firestore and Firebase Authentication.

## Setup

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Build the functions:**
   ```bash
   npm run build
   ```

3. **Deploy the functions:**
   ```bash
   npm run deploy
   ```

## Functions

### `createUser`
Creates a new user in both Firestore and Firebase Authentication without affecting the admin's session.

**Parameters:**
- `email`: The email address of the new user
- `password`: The password for the new user
- `userData`: The user data object containing role, name, etc.

**Authentication:** Requires admin role

**Usage from frontend:**
```typescript
import { userService } from '../firebase/services';

// Create user (admin session stays intact)
await userService.createUser(email, password, userData);
```

### `deleteUserCompletely`
Deletes a user from both Firestore and Firebase Authentication.

**Parameters:**
- `userId`: The document ID of the user in Firestore
- `email`: The email address of the user

**Authentication:** Requires admin role

**Usage from frontend:**
```typescript
import { userService } from '../firebase/services';

// Delete user completely
await userService.deleteUserCompletely(userId);
```

### `deleteUserFromAuth`
Deletes a user only from Firebase Authentication.

**Parameters:**
- `email`: The email address of the user

**Authentication:** Requires admin role

## Security Rules

Make sure your Firestore security rules allow admins to delete users:

```javascript
// In firestore.rules
match /users/{userId} {
  allow read, write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## Important Notes

1. **Admin Privileges Required:** Only users with admin role can delete other users
2. **Complete Deletion:** The `deleteUserCompletely` function removes the user from both Firestore and Firebase Auth
3. **Student Records:** If deleting a student, associated student records are also removed
4. **Error Handling:** The functions include proper error handling and logging

## Testing

You can test the functions locally using the Firebase emulator:

```bash
npm run serve
```

## Deployment

To deploy to production:

```bash
firebase deploy --only functions
```

## Monitoring

Monitor function execution in the Firebase Console under Functions > Logs.

# Firestore Security Rules - Announcements

## Add to firestore.rules

Add these rules to your `firestore.rules` file to enable the announcement system:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Announcements Collection
    match /announcements/{announcementId} {
      // Anyone authenticated can read announcements
      allow read: if isAuthenticated();
      
      // Only admins can create announcements
      allow create: if isAdmin()
        && request.resource.data.keys().hasAll([
          'mediaUrl', 'mediaType', 'isActive', 
          'startDate', 'endDate', 'displayDuration',
          'createdAt', 'createdBy'
        ])
        && request.resource.data.mediaType in ['image', 'video']
        && request.resource.data.createdBy == request.auth.uid;
      
      // Only admins can update announcements
      allow update: if isAdmin()
        && request.resource.data.createdAt == resource.data.createdAt
        && request.resource.data.createdBy == resource.data.createdBy
        && request.resource.data.updatedBy == request.auth.uid;
      
      // Only admins can delete announcements
      allow delete: if isAdmin();
    }
    
    // User Announcement Preferences Subcollection
    match /users/{userId}/announcementPreferences/{announcementId} {
      // Users can only read their own preferences
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can create/update their own preferences
      allow create, update: if isAuthenticated() 
        && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['dismissedAt', 'viewCount', 'lastViewed']);
      
      // Users can delete their own preferences (to reset dismissals)
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

## Rule Explanations

### Announcements Collection

**Read Access**:
- Any authenticated user can read announcements
- This allows FlashAnnouncement component to display announcements

**Create Access**:
- Only admins can create announcements
- Validates required fields exist
- Validates mediaType is either 'image' or 'video'
- Ensures createdBy matches the authenticated user

**Update Access**:
- Only admins can update announcements
- Prevents changing createdAt and createdBy (audit trail)
- Requires updatedBy to be set to current user

**Delete Access**:
- Only admins can delete announcements

### User Announcement Preferences

**Read Access**:
- Users can only read their own preferences
- Privacy: users can't see others' dismissal history

**Create/Update Access**:
- Users can only create/update their own preferences
- Validates required fields (dismissedAt, viewCount, lastViewed)
- Prevents users from modifying other users' preferences

**Delete Access**:
- Users can delete their own preferences (to reset dismissals)

## Testing Rules

You can test these rules in the Firebase Console:

1. Go to Firestore Database
2. Click "Rules" tab
3. Click "Rules Playground"

### Test Read Announcement (Any User)
```javascript
// Operation: get
// Path: /announcements/testId
// Auth: Authenticated user
// Expected: Allow
```

### Test Create Announcement (Admin)
```javascript
// Operation: create
// Path: /announcements/newId
// Auth: Admin user
// Data: {
//   mediaUrl: "https://...",
//   mediaType: "image",
//   isActive: true,
//   startDate: <timestamp>,
//   endDate: <timestamp>,
//   displayDuration: 10,
//   createdAt: <timestamp>,
//   createdBy: <admin_uid>
// }
// Expected: Allow
```

### Test Create Announcement (Non-Admin)
```javascript
// Same as above but with non-admin user
// Expected: Deny
```

### Test User Preferences (Own)
```javascript
// Operation: create
// Path: /users/{userId}/announcementPreferences/testId
// Auth: User with uid = {userId}
// Data: {
//   dismissedAt: <timestamp>,
//   viewCount: 1,
//   lastViewed: <timestamp>
// }
// Expected: Allow
```

### Test User Preferences (Others)
```javascript
// Same as above but userId != auth.uid
// Expected: Deny
```

## Deployment

1. Update your `firestore.rules` file
2. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. Verify deployment:
   - Check Firebase Console
   - Rules should show "Last deployed: [timestamp]"

## Security Best Practices

✅ **Implemented**:
- User authentication required for all operations
- Role-based access control (admin checks)
- Field validation on writes
- Audit trail preservation (createdAt/createdBy immutable)
- Privacy (users can't access others' preferences)

⚠️ **Consider Adding**:
- Rate limiting for dismissals (prevent spam)
- Maximum announcement size validation
- URL validation for mediaUrl
- Date range validation (startDate < endDate)

## Error Messages

Common security rule violations:

1. **"Missing or insufficient permissions"**
   - User not authenticated
   - User not admin (for create/update/delete announcements)
   - User trying to access another user's preferences

2. **"Document does not match security rules"**
   - Missing required fields
   - Invalid mediaType value
   - Trying to modify createdAt/createdBy on update

3. **"Permission denied"**
   - User not logged in
   - User role is not 'admin'

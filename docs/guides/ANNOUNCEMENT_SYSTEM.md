# Announcement System - Firebase Implementation

**Last Updated**: January 23, 2026  
**Status**: ✅ Production Ready

---

## 📊 Overview

The announcement system uses Firebase Firestore for real-time flash announcements with per-user dismissal tracking.

### Key Features
- ✅ Real-time synchronization across all devices
- ✅ Cloud-based persistent storage
- ✅ Per-user dismissal tracking
- ✅ Multi-admin support
- ✅ Audit trail (created/updated by tracking)
- ✅ Auto-expiration based on date ranges

---

## 🏗️ Architecture

### Data Flow
```
Admin Creates Announcement
    ↓
Firebase Firestore (/announcements)
    ↓
Real-Time Listener (subscribeToActiveAnnouncements)
    ↓
Filter by User Preferences (/users/{userId}/announcementPreferences)
    ↓
Display to User (FlashAnnouncement Component)
    ↓
User Dismisses
    ↓
Save Preference to Firestore
```

### Components

1. **`announcementService`** (`src/firebase/services/announcement.service.ts`)
   - Firebase service for CRUD operations
   - Real-time listeners
   - User preference management

2. **`AdminAnnouncementManager`** (`src/features/announcements/components/AdminAnnouncementManager.tsx`)
   - Admin interface for managing announcements
   - Create, update, delete operations
   - Real-time sync of all announcements

3. **`FlashAnnouncement`** (`src/features/announcements/components/FlashAnnouncement.tsx`)
   - User-facing announcement display
   - Auto-dismiss after duration
   - Per-user dismissal tracking

4. **`AnnouncementContext`** (`src/features/announcements/contexts/AnnouncementContext.tsx`)
   - React context for announcement state
   - Real-time subscription management
   - User-specific filtering

---

## 📁 Firestore Structure

### Collection: `/announcements/{announcementId}`
```typescript
{
  id: string;                // Auto-generated
  mediaUrl: string;          // Image or video URL (base64 or Firebase Storage URL)
  mediaType: 'image' | 'video';
  isActive: boolean;         // Whether announcement is currently active
  startDate: Timestamp;      // When to start showing
  endDate: Timestamp;        // When to stop showing
  displayDuration: number;   // Seconds to show (e.g., 10)
  createdAt: Timestamp;      // When created
  createdBy: string;         // User ID who created
  updatedAt?: Timestamp;     // Last update time
  updatedBy?: string;        // User ID who last updated
}
```

### Collection: `/users/{userId}/announcementPreferences/{announcementId}`
```typescript
{
  dismissedAt: Timestamp;    // When user dismissed
  viewCount: number;         // Number of times viewed (auto-increment)
  lastViewed: Timestamp;     // Last view time
}
```

---

## 🔒 Firestore Security Rules

Add these rules to `firestore.rules`:

```javascript
// Announcements - Public read, admin write
match /announcements/{announcementId} {
  // Anyone can read active announcements
  allow read: if true;
  
  // Only admins can create/update/delete
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// User announcement preferences - User-specific
match /users/{userId}/announcementPreferences/{announcementId} {
  // Users can only read/write their own preferences
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

---

## 🔧 Service API Reference

### `announcementService`

#### Read Operations

**`getAnnouncements()`**
```typescript
const announcements = await announcementService.getAnnouncements();
// Returns: Promise<Announcement[]>
// Fetches all announcements (one-time)
```

**`getActiveAnnouncements()`**
```typescript
const active = await announcementService.getActiveAnnouncements();
// Returns: Promise<Announcement[]>
// Fetches only currently active announcements
```

**`subscribeToAnnouncements(callback, onError?)`**
```typescript
const unsubscribe = announcementService.subscribeToAnnouncements(
  (announcements) => {
    console.log('Announcements updated:', announcements);
  },
  (error) => {
    console.error('Subscription error:', error);
  }
);

// Later: unsubscribe();
// Returns: Unsubscribe function
// Provides real-time updates for all announcements
```

**`subscribeToActiveAnnouncements(callback, onError?)`**
```typescript
const unsubscribe = announcementService.subscribeToActiveAnnouncements(
  (activeAnnouncements) => {
    setAnnouncements(activeAnnouncements);
  }
);
// Returns: Unsubscribe function
// Real-time updates for active announcements only
```

#### Write Operations

**`addAnnouncement(announcement)`**
```typescript
const announcementId = await announcementService.addAnnouncement({
  mediaUrl: 'https://example.com/image.jpg',
  mediaType: 'image',
  isActive: true,
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  displayDuration: 10, // 10 seconds
  createdBy: currentUser.id
});
// Returns: Promise<string> (announcement ID)
```

**`updateAnnouncement(id, updates, updatedBy)`**
```typescript
await announcementService.updateAnnouncement(
  'announcement-id',
  {
    isActive: false,
    endDate: new Date()
  },
  currentUser.id
);
// Returns: Promise<void>
```

**`deleteAnnouncement(id)`**
```typescript
await announcementService.deleteAnnouncement('announcement-id');
// Returns: Promise<void>
```

#### User Preferences

**`getUserPreferences(userId)`**
```typescript
const dismissedIds = await announcementService.getUserPreferences(userId);
// Returns: Promise<string[]> (array of dismissed announcement IDs)
```

**`dismissAnnouncement(userId, announcementId)`**
```typescript
await announcementService.dismissAnnouncement(user.uid, announcementId);
// Returns: Promise<void>
// Saves dismissal to Firestore
```

**`clearDismissedAnnouncements(userId)`**
```typescript
await announcementService.clearDismissedAnnouncements(userId);
// Returns: Promise<void>
// For testing/reset purposes
```

#### Statistics

**`getAnnouncementStats()`**
```typescript
const stats = await announcementService.getAnnouncementStats();
// Returns: Promise<{
//   total: number;
//   active: number;
//   scheduled: number;
//   expired: number;
//   current: number;
// }>
```

---

## 💡 Usage Examples

### Admin: Create Announcement

```typescript
import { announcementService } from '@/firebase/services';
import { useCurrentUser } from '@/hooks/auth';

const CreateAnnouncement = () => {
  const { userData } = useCurrentUser();
  
  const handleCreate = async (formData) => {
    try {
      const id = await announcementService.addAnnouncement({
        mediaUrl: formData.imageUrl,
        mediaType: 'image',
        isActive: true,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        displayDuration: 10,
        createdBy: userData.id
      });
      
      console.log('Created announcement:', id);
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };
};
```

### User: Display Announcements

```typescript
import { FlashAnnouncement } from '@/features/announcements/components';

const HomePage = () => {
  return (
    <div>
      <FlashAnnouncement />
      {/* Rest of your page */}
    </div>
  );
};
```

### Custom: Subscribe to Announcements

```typescript
import { announcementService } from '@/firebase/services';
import { useEffect, useState } from 'react';

const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = announcementService.subscribeToActiveAnnouncements(
      (data) => {
        setAnnouncements(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { announcements, loading };
};
```

---

## 🧪 Testing

### Test Announcement Flow

1. **Admin Creates Announcement**
   ```bash
   # Login as admin
   # Navigate to Admin Dashboard → Announcements
   # Upload image/video
   # Set date range and duration
   # Click "Create Announcement"
   ```

2. **Verify Real-Time Sync**
   ```bash
   # Open app in another browser/device
   # Announcement should appear immediately (no refresh)
   ```

3. **Test User Dismissal**
   ```bash
   # Click dismiss (X) button
   # Announcement should not appear again
   # Check Firestore: /users/{userId}/announcementPreferences
   ```

4. **Test Multi-Device Persistence**
   ```bash
   # Dismiss on Device A
   # Open app on Device B (same user)
   # Announcement should not appear
   ```

### Firestore Console Verification

```bash
# Check announcements collection
/announcements
  - Document ID: auto-generated
  - Fields: mediaUrl, mediaType, isActive, startDate, endDate, etc.

# Check user preferences
/users/{userId}/announcementPreferences/{announcementId}
  - Fields: dismissedAt, viewCount, lastViewed
```

---

## 🚀 Deployment Checklist

- [x] Firebase service implemented
- [x] Components migrated
- [x] Real-time listeners working
- [x] TypeScript errors: 0
- [ ] **Firestore security rules deployed** ⚠️
- [ ] **Firestore indexes created** (if needed)
- [ ] Test announcement creation
- [ ] Test real-time sync
- [ ] Test user dismissals
- [ ] Test multi-device sync

---

## 📚 Related Documentation

- [Architecture Diagram](./architecture/ARCHITECTURE_DIAGRAM.md)
- [Firebase Setup](./firebase/FIREBASE_SETUP.md)
- [Firestore Rules](../firestore.rules)

---

## 🔍 Troubleshooting

### Announcements Not Appearing

1. **Check Firestore**
   - Verify announcements exist in `/announcements` collection
   - Check `isActive` is `true`
   - Verify `startDate` <= now <= `endDate`

2. **Check User Authentication**
   - User must be logged in for dismissal tracking
   - Guest users see all active announcements

3. **Check Browser Console**
   - Look for Firebase permission errors
   - Verify real-time listener is subscribing

### Dismissals Not Persisting

1. **Check Firestore Rules**
   - User must have write permission to their preferences
   - Rules: `allow write: if request.auth.uid == userId`

2. **Check User ID**
   - Verify `user.uid` is available
   - Check authentication state

### Real-Time Updates Not Working

1. **Check Subscription**
   - Verify `unsubscribe()` is called on cleanup
   - Check for subscription errors in console

2. **Check Network**
   - Firestore requires websocket connection
   - Verify no firewall/proxy blocking

---

**For Issues**: Check browser console and Firestore console for detailed error messages.

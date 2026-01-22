# Phase 4 - Session 20: AddPhotoForm Migration Plan

**Date**: January 14, 2026  
**Session**: 20 of ~22  
**Focus**: Migrate AddPhotoForm to enhanced usePhotos hook

---

## 📋 Session Overview

### Component to Migrate
- **File**: `src/features/events/forms/AddPhotoForm.tsx`
- **Size**: 413 lines
- **Current Dependencies**: 
  - `photoService.uploadPhoto(file)` - Upload image to Firebase Storage
  - `photoService.addPhoto(photoData)` - Save photo metadata to Firestore

### Current Implementation
```typescript
// Upload image
const imageUrl = await photoService.uploadPhoto(file);

// Save metadata
await photoService.addPhoto({
  title: formData.title,
  description: formData.description,
  category: formData.category,
  imageUrl
});
```

---

## 🎯 Migration Strategy

### Option A: Enhance usePhotos Hook (RECOMMENDED)
**Pros**:
- Consistent with Phase 4 architecture
- Reusable for future photo uploads
- Provides optimistic updates capability
- Centralizes photo logic

**Cons**:
- Requires enhancing usePhotos hook first (~30-45 min)

**Enhancement Required**:
Add to `src/hooks/data/usePhotos.ts`:
```typescript
// Upload photo to Firebase Storage
uploadPhoto: (file: File) => Promise<string>

// Add photo metadata to Firestore
addPhoto: (photoData: Omit<Photo, 'id' | 'uploadedAt'>) => Promise<Photo>

// Convenience method (combines both)
uploadPhotoWithMetadata: (file: File, metadata: PhotoMetadata) => Promise<Photo>
```

### Option B: Keep photoService for Upload
**Pros**:
- Faster implementation (~10-15 min)
- No hook changes needed

**Cons**:
- Inconsistent architecture
- Doesn't follow Phase 4 patterns
- Photo upload logic remains in service layer

---

## 📊 Decision: Option A (Enhance usePhotos)

### Rationale
1. **Architecture Consistency**: All 27 migrated components use hooks
2. **Future-Proofing**: Other components may need photo upload (EditStudentForm uses photoService.uploadPhoto)
3. **Better UX**: Can add optimistic updates for photo gallery
4. **Time Investment**: 30-45 min now saves time later

---

## 🔧 Implementation Plan

### Step 1: Enhance usePhotos Hook (30-40 min)
**File**: `src/hooks/data/usePhotos.ts`

**Add Methods**:
```typescript
const uploadPhoto = useCallback(async (file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err: any) {
    console.error('Error uploading photo:', err);
    throw new Error(err.message || 'Failed to upload photo');
  }
}, []);

const addPhoto = useCallback(async (
  photoData: Omit<Photo, 'id' | 'uploadedAt'>
): Promise<Photo> => {
  try {
    const docRef = await addDoc(collection(db, 'photos'), {
      ...photoData,
      uploadedAt: serverTimestamp(),
    });
    
    const newPhoto = { ...photoData, id: docRef.id } as Photo;
    
    // Optimistic update: Add to local state
    setPhotos(prev => [newPhoto, ...prev]);
    
    return newPhoto;
  } catch (err: any) {
    console.error('Error adding photo:', err);
    throw new Error(err.message || 'Failed to add photo');
  }
}, []);

const uploadPhotoWithMetadata = useCallback(async (
  file: File,
  metadata: Omit<Photo, 'id' | 'uploadedAt' | 'imageUrl'>
): Promise<Photo> => {
  try {
    const imageUrl = await uploadPhoto(file);
    const photo = await addPhoto({ ...metadata, imageUrl });
    return photo;
  } catch (err: any) {
    console.error('Error uploading photo with metadata:', err);
    throw new Error(err.message || 'Failed to upload photo');
  }
}, [uploadPhoto, addPhoto]);
```

**Return Values**:
```typescript
return {
  photos,
  loading,
  error,
  refetch,
  fetchPhotos,
  uploadPhoto,          // NEW
  addPhoto,            // NEW
  uploadPhotoWithMetadata, // NEW (convenience method)
};
```

**Imports to Add**:
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/firebase/config';
```

### Step 2: Migrate AddPhotoForm (10-15 min)
**File**: `src/features/events/forms/AddPhotoForm.tsx`

**Changes**:
```typescript
// BEFORE
import { photoService } from '@/firebase/services';

// Inside handleSubmit
const imageUrl = await photoService.uploadPhoto(file);
await photoService.addPhoto({
  title: formData.title,
  description: formData.description,
  category: formData.category,
  imageUrl
});

// AFTER
import { usePhotos } from '@/hooks/data/usePhotos';

const { uploadPhotoWithMetadata } = usePhotos({ autoFetch: false });

// Inside handleSubmit
await uploadPhotoWithMetadata(file, {
  title: formData.title,
  description: formData.description,
  category: formData.category
});
```

**Size Estimate**: 413 → ~410 lines (cleaner with convenience method)

---

## ✅ Validation Checklist

### Hook Enhancement
- [ ] Add Firebase Storage imports (ref, uploadBytes, getDownloadURL)
- [ ] Add Firestore imports (collection, addDoc, serverTimestamp)
- [ ] Import db and storage from config
- [ ] Implement uploadPhoto method
- [ ] Implement addPhoto method with optimistic update
- [ ] Implement uploadPhotoWithMetadata convenience method
- [ ] Export new methods in return statement
- [ ] Test with TypeScript compiler (0 errors expected)

### Component Migration
- [ ] Import usePhotos hook
- [ ] Replace photoService.uploadPhoto with hook method
- [ ] Replace photoService.addPhoto with hook method
- [ ] Remove photoService import
- [ ] Test form submission flow
- [ ] Verify image upload to Firebase Storage
- [ ] Verify metadata save to Firestore
- [ ] Test error handling
- [ ] TypeScript: 0 errors expected

---

## 📈 Expected Outcomes

### Code Quality
- **Lines Changed**: ~5-10 in AddPhotoForm
- **Hook Enhancement**: +80-100 lines in usePhotos
- **TypeScript Errors**: 0
- **Service Dependencies Removed**: photoService (2 calls)

### Architecture Benefits
1. **Centralized Photo Logic**: All photo operations in one hook
2. **Reusability**: Other components can use uploadPhoto (EditStudentForm)
3. **Optimistic Updates**: Immediate UI feedback when adding photos
4. **Consistent Patterns**: Matches all 27 migrated components

### Module Impact
- **Photo Management**: 50% → 100% (AddPhotoForm complete)
- **Phase 4 Progress**: 27 → 28 components (80%)

---

## 🎯 Success Criteria

1. ✅ usePhotos hook enhanced with upload capabilities
2. ✅ AddPhotoForm successfully migrated
3. ✅ Photo upload works end-to-end (Storage + Firestore)
4. ✅ TypeScript compilation: 0 errors
5. ✅ Form validation and error handling intact
6. ✅ Navigation after upload works correctly

---

## ⏱️ Time Estimate

- **Hook Enhancement**: 30-40 minutes
- **Component Migration**: 10-15 minutes
- **Testing & Validation**: 10 minutes
- **Documentation**: 5 minutes
- **Total**: 55-70 minutes

---

## 📝 Notes

- This is a strategic enhancement that pays dividends
- `EditStudentForm` currently uses `photoService.uploadPhoto` - could benefit from this hook
- Sets precedent for file upload patterns in the codebase
- Optimistic updates improve perceived performance

---

## 🚀 Next Session Preview

**Session 21**: TeacherDashboard Migration
- File: `src/features/dashboards/components/dashboards/TeacherDashboard.tsx`
- Size: ~210 lines
- Migration: auth → useCurrentUser hook
- Estimated Time: 15-20 minutes
- Impact: Dashboard module 33% → 50%

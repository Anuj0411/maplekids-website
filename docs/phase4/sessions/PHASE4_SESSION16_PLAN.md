# Phase 4 - Session 16: Migrate EditUserForm

**Date**: January 14, 2026  
**Session**: 16  
**Component**: EditUserForm  
**Target**: Replace userService with useUsers hook

---

## Current Analysis

### File Location
- **Path**: `src/features/students/forms/EditUserForm.tsx`
- **Size**: 322 lines

### Current Dependencies
```typescript
import { userService } from '@/firebase/services';
```

### Service Usage
1. **Load User Data** (initialization, not visible in first 80 lines)
2. **updateUser** (line 73):
   ```typescript
   await userService.updateUser(userId, updateData);
   ```

### Current State Management
- Uses custom `useForm` hook for form state
- Uses custom `useFormValidation` hook for validation
- Manual loading state
- Manual success state
- React Router for navigation

---

## Migration Plan

### Changes Required

1. **Import Changes**
   ```typescript
   // REMOVE
   import { userService } from '@/firebase/services';
   
   // ADD
   import { useUsers } from '@/hooks/data/useUsers';
   ```

2. **Hook Integration**
   ```typescript
   const { updateUser, getUserById } = useUsers({ autoFetch: false });
   ```

3. **Replace Service Calls**
   - User loading (useEffect) → `getUserById(userId)`
   - Update call (line 73) → `updateUser(userId, updateData)`

---

## Expected Benefits

1. **Code Consistency**: Same pattern as other user management forms
2. **Better Error Handling**: Hook provides centralized error management
3. **Type Safety**: Hook ensures correct user data structure
4. **Future Features**: Hook can add real-time updates, caching
5. **Maintainability**: Single source of truth for user operations

---

## Implementation Steps

1. ✅ Create session plan (this file)
2. ⏳ Update imports
3. ⏳ Add useUsers hook
4. ⏳ Replace updateUser call
5. ⏳ Replace user loading (if present)
6. ⏳ Verify TypeScript compilation
7. ⏳ Update progress document
8. ⏳ Continue to next session

---

## Risk Assessment

**Risk Level**: LOW

- Simple service → hook replacement
- No complex state dependencies
- Already uses form hooks
- Well-tested useUsers hook

---

## Testing Notes

After migration, verify:
1. User data loads correctly
2. Form fields populate from user data
3. Validation works
4. Update saves successfully
5. Success message displays
6. Navigation works after save
7. Error handling displays correctly

# Phase 4 - Session 21: TeacherDashboard Migration Plan

**Date**: January 14, 2026  
**Session**: 21 of ~22  
**Focus**: Migrate TeacherDashboard to enhanced useAuth hook

---

## 📋 Session Overview

### Component to Migrate
- **File**: `src/features/dashboards/components/TeacherDashboard.tsx`
- **Size**: 211 lines
- **Current Dependencies**: 
  - `authService.signOut()` - Sign out user
  - Already uses: `useCurrentUser`, `useUserRole`, `useStudents`, `useAttendance` (well optimized!)

### Current Implementation
```typescript
import { authService } from '@/firebase/services';

const handleSignOut = async () => {
  await authService.signOut();
  navigate('/');
};
```

---

## 🎯 Migration Strategy

### Option A: Enhance useAuth Hook (RECOMMENDED)
**Pros**:
- Consistent with Phase 4 architecture
- Reusable for all components with signOut (UserDashboard, AdminDashboard)
- Centralizes auth actions
- Clean separation of concerns

**Cons**:
- Requires enhancing useAuth hook first (~10 min)

**Enhancement Required**:
Add to `src/hooks/auth/useAuth.ts`:
```typescript
signOut: () => Promise<void>
```

### Option B: Keep authService for SignOut
**Pros**:
- Faster implementation (~2-3 min)

**Cons**:
- Inconsistent architecture
- Other dashboards will need the same fix
- Auth action logic remains in service layer

---

## 📊 Decision: Option A (Enhance useAuth)

### Rationale
1. **Architecture Consistency**: All migrated components use hooks
2. **Reusability**: UserDashboard and AdminDashboard also need signOut
3. **Better Pattern**: Auth actions belong in auth hooks
4. **Time Investment**: 10 min now, saves 20 min across 3 dashboards

---

## 🔧 Implementation Plan

### Step 1: Enhance useAuth Hook (8-10 min)
**File**: `src/hooks/auth/useAuth.ts`

**Add Method**:
```typescript
import { signOut as firebaseSignOut } from 'firebase/auth';

const signOut = useCallback(async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    // State will auto-update via onAuthStateChanged listener
  } catch (err: any) {
    console.error('Error signing out:', err);
    throw new Error(err.message || 'Failed to sign out');
  }
}, []);

return {
  user,
  loading,
  isAuthenticated,
  signOut,  // NEW
};
```

**Import to Add**:
```typescript
import { signOut as firebaseSignOut } from 'firebase/auth';
```

### Step 2: Migrate TeacherDashboard (3-5 min)
**File**: `src/features/dashboards/components/TeacherDashboard.tsx`

**Changes**:
```typescript
// BEFORE
import { authService } from '@/firebase/services';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';

const handleSignOut = async () => {
  await authService.signOut();
  navigate('/');
};

// AFTER
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
import { useAuth } from '@/hooks/auth/useAuth';

const { signOut } = useAuth();

const handleSignOut = async () => {
  await signOut();
  navigate('/');
};
```

**Size Estimate**: 211 → ~210 lines (minimal change)

---

## ✅ Validation Checklist

### Hook Enhancement
- [ ] Add Firebase Auth signOut import
- [ ] Implement signOut method with useCallback
- [ ] Add error handling
- [ ] Export signOut in return statement
- [ ] Test with TypeScript compiler (0 errors expected)

### Component Migration
- [ ] Import useAuth hook
- [ ] Destructure signOut from useAuth
- [ ] Replace authService.signOut with signOut
- [ ] Remove authService import
- [ ] TypeScript: 0 errors expected

---

## 📈 Expected Outcomes

### Code Quality
- **Lines Changed**: ~3-5 in TeacherDashboard
- **Hook Enhancement**: +15-20 lines in useAuth
- **TypeScript Errors**: 0
- **Service Dependencies Removed**: authService (1 call)

### Architecture Benefits
1. **Centralized Auth Actions**: All auth operations in auth hooks
2. **Reusability**: UserDashboard and AdminDashboard can use same method
3. **Consistent Patterns**: Matches all 28 migrated components
4. **Better Testing**: Auth actions easier to mock/test

### Module Impact
- **Dashboards**: 0% → 33% (TeacherDashboard complete)
- **Phase 4 Progress**: 28 → 29 components (83%)

---

## 🎯 Success Criteria

1. ✅ useAuth hook enhanced with signOut capability
2. ✅ TeacherDashboard successfully migrated
3. ✅ Sign out functionality works correctly
4. ✅ TypeScript compilation: 0 errors
5. ✅ Navigation after signOut works

---

## ⏱️ Time Estimate

- **Hook Enhancement**: 8-10 minutes
- **Component Migration**: 3-5 minutes
- **Testing & Validation**: 3 minutes
- **Documentation**: 3 minutes
- **Total**: 17-21 minutes

---

## 📝 Notes

- TeacherDashboard is already well-optimized (uses 4 hooks!)
- Only remaining service dependency is authService.signOut
- This enhancement will benefit UserDashboard and AdminDashboard in next sessions
- Component is large (211 lines) but migration is minimal

---

## 🔍 Component Analysis

**Current Hook Usage** (Already Optimized):
```typescript
✅ useCurrentUser() - for user data
✅ useUserRole() - for role checking
✅ useStudents() - for student data
✅ useAttendance() - for attendance data
```

**Remaining Service Calls**:
```typescript
❌ authService.signOut() - needs migration
```

**Verdict**: 80% migrated, just need signOut!

---

## 🚀 Next Session Preview

**Session 22**: UserDashboard Migration
- File: `src/features/dashboards/components/UserDashboard.tsx`
- Size: ~105 lines
- Migration: authService.signOut → useAuth.signOut (same pattern)
- Estimated Time: 5-8 minutes (hook already enhanced)
- Impact: Dashboard module 33% → 67%

# Phase 4 - Session 22: UserDashboard Migration Plan

**Date**: January 14, 2026  
**Session**: 22 of ~22  
**Focus**: Migrate UserDashboard to useAuth and useCurrentUser hooks

---

## 📋 Session Overview

### Component to Migrate
- **File**: `src/features/dashboards/components/UserDashboard.tsx`
- **Size**: 105 lines
- **Current Dependencies**: 
  - `authService.signOut()` - Sign out user
  - `authService.getCurrentUserData()` - Get current user data

### Current Implementation
```typescript
import { authService } from '@/firebase/services';

const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    const userData = await authService.getCurrentUserData();
    if (!userData) {
      navigate('/signin');
      return;
    }
    if (userData.role !== 'student') {
      // Redirect based on role...
    }
    setUser(userData);
  };
  fetchUser();
}, [navigate]);

const handleSignOut = async () => {
  await authService.signOut();
  navigate('/');
};
```

---

## 🎯 Migration Strategy

### Replace with Hooks
- **useAuth**: Already enhanced with `signOut` method (Session 21)
- **useCurrentUser**: Already provides user data
- **useUserRole**: Provides role checking (could simplify role logic)

### Benefits
1. No async user fetching needed (data already cached)
2. Real-time user updates
3. Cleaner code (no manual state management)
4. Role checking can use `useUserRole` hook

---

## 🔧 Implementation Plan

### Changes Required

**Import Changes**
```typescript
// BEFORE
import { authService } from '@/firebase/services';
type User = import("@/firebase/services").User;

// AFTER
import { useAuth } from '@/hooks/auth/useAuth';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
import { useUserRole } from '@/hooks/auth/useUserRole';
import type { User } from '@/firebase/types';
```

**Hook Usage**
```typescript
// BEFORE
const [user, setUser] = useState<User | null>(null);
useEffect(() => {
  const fetchUser = async () => {
    const userData = await authService.getCurrentUserData();
    // ... complex logic
  };
  fetchUser();
}, [navigate]);

// AFTER
const { signOut } = useAuth();
const { userData: user } = useCurrentUser();
const { isStudent } = useUserRole();
```

**Role Redirect Logic**
```typescript
// BEFORE
if (userData.role !== 'student') {
  if (userData.role === 'admin') {
    navigate('/admin-dashboard');
  } else if (userData.role === 'teacher') {
    navigate('/teacher-dashboard');
  }
}

// AFTER
useEffect(() => {
  if (user && !isStudent) {
    // Redirect non-students to appropriate dashboard
    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (user.role === 'teacher') {
      navigate('/teacher-dashboard');
    }
  }
}, [user, isStudent, navigate]);
```

**Sign Out**
```typescript
// BEFORE
const handleSignOut = async () => {
  await authService.signOut();
  navigate('/');
};

// AFTER
const handleSignOut = async () => {
  await signOut();
  navigate('/');
};
```

**Size Estimate**: 105 → ~100 lines (simpler logic with hooks)

---

## ✅ Validation Checklist

### Component Migration
- [ ] Import useAuth, useCurrentUser, useUserRole hooks
- [ ] Replace useState/useEffect with hook calls
- [ ] Update role redirect logic
- [ ] Replace authService.signOut with signOut from hook
- [ ] Remove authService import
- [ ] Fix type imports (User from firebase/types)
- [ ] TypeScript: 0 errors expected

---

## 📈 Expected Outcomes

### Code Quality
- **Lines Changed**: ~15-20 lines
- **Lines Reduced**: ~5 lines (simpler logic)
- **TypeScript Errors**: 0
- **Service Dependencies Removed**: authService (2 calls)

### Architecture Benefits
1. **No Manual State**: User data from hook (cached)
2. **No Async Fetching**: Data already available
3. **Simpler Logic**: Role checking with `isStudent`
4. **Consistent Patterns**: Matches TeacherDashboard

### Module Impact
- **Dashboards**: 33% → 67% (2/3 complete)
- **Phase 4 Progress**: 29 → 30 components (86%)

---

## 🎯 Success Criteria

1. ✅ UserDashboard successfully migrated to hooks
2. ✅ User data loading works correctly
3. ✅ Role-based redirects work
4. ✅ Sign out functionality works
5. ✅ TypeScript compilation: 0 errors

---

## ⏱️ Time Estimate

- **Component Migration**: 5-8 minutes (hook already enhanced)
- **Testing & Validation**: 2 minutes
- **Documentation**: 3 minutes
- **Total**: 10-13 minutes

---

## 📝 Notes

- useAuth.signOut already enhanced in Session 21
- useCurrentUser and useUserRole already exist from Phase 3
- This is a straightforward migration (no new hook creation needed)
- Similar pattern to TeacherDashboard migration

---

## 🚀 Impact

**After Session 22**:
- Components Migrated: 30/35 (86%)
- Dashboard Module: 67% complete
- Only 5 components remain (AdminDashboard + 4 auth forms)
- Phase 4 nearly complete!

**Remaining Components** (Phase 5):
- AdminDashboard (complex, 1031 lines)
- SignupForm (auth flows)
- SigninForm (auth flows)
- ResetPasswordForm (auth flows)
- ChangePasswordForm (auth flows)

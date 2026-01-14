# Phase 4 - Session 14: Migrate BulkAttendanceForm

**Date**: January 14, 2026  
**Session**: 14  
**Component**: BulkAttendanceForm  
**Target**: Replace attendanceService with useAttendance hook

---

## Current Analysis

### File Location
- **Path**: `src/features/attendance/components/BulkAttendanceForm.tsx`
- **Size**: 425 lines

### Current Dependencies
```typescript
import { attendanceService } from '@/firebase/services';
import { useStudents } from '@/hooks/data/useStudents';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
```

### Service Usage
1. **getAttendanceByClassAndDate** (line 60):
   ```typescript
   const existingAttendance = await attendanceService.getAttendanceByClassAndDate(
     selectedClass, 
     selectedDate
   );
   ```

2. **markAttendance** (line 153):
   ```typescript
   await attendanceService.markAttendance(attendanceData);
   ```

### Current State Management
- Manual loading states: `loading` (from useStudents), `saving` (local)
- Manual error handling: `error`, `success` (local states)
- Manual data fetching in useEffect
- No real-time updates

---

## Migration Plan

### Changes Required

1. **Import Changes**
   ```typescript
   // REMOVE
   import { attendanceService } from '@/firebase/services';
   
   // ADD
   import { useAttendance } from '@/hooks/data/useAttendance';
   ```

2. **Hook Integration**
   ```typescript
   const {
     getAttendanceByClassAndDate,
     markAttendance,
     loading: attendanceLoading,
     error: attendanceError
   } = useAttendance({ autoFetch: false });
   ```

3. **Replace Service Calls**
   - Line 60: `attendanceService.getAttendanceByClassAndDate()` → `getAttendanceByClassAndDate()`
   - Line 153: `attendanceService.markAttendance()` → `markAttendance()`

4. **State Consolidation** (Optional)
   - Could use `attendanceError` instead of local `error` state
   - Could combine `saving` with `attendanceLoading`

---

## Expected Benefits

1. **Code Reduction**: ~5-10 lines
2. **Real-time Capability**: Future enhancement to use hook's listener
3. **Consistent Error Handling**: Unified error states
4. **Better Performance**: Optimistic updates from hook
5. **Maintainability**: Single source of truth for attendance logic

---

## Implementation Steps

1. ✅ Create session plan (this file)
2. ⏳ Update imports
3. ⏳ Add useAttendance hook
4. ⏳ Replace getAttendanceByClassAndDate call
5. ⏳ Replace markAttendance call
6. ⏳ Verify TypeScript compilation
7. ⏳ Update progress document
8. ⏳ Commit changes

---

## Risk Assessment

**Risk Level**: LOW

- Simple service → hook replacement
- No complex state dependencies
- Well-defined API in useAttendance
- Similar to previous migrations

---

## Testing Notes

After migration, verify:
1. Existing attendance loads correctly for date
2. Bulk actions work (mark all present/absent/late)
3. Individual status updates work
4. Remarks can be added/edited
5. Save functionality works
6. Error handling displays correctly
7. Success messages appear
8. Loading states show properly

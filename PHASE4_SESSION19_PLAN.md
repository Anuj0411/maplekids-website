# Phase 4 - Session 19: Migrate AcademicReportsManager

**Date**: January 14, 2026  
**Session**: 19 (18 skipped)  
**Component**: AcademicReportsManager  
**Target**: Replace studentService with useStudents hook

---

## Current Analysis

### File Location
- **Path**: `src/features/reports/components/AcademicReportsManager.tsx`
- **Size**: 609 lines

### Current Dependencies
```typescript
import { studentService, Student } from '@/firebase/services';
```

### Service Usage
1. **getAllStudents** (line 61):
   ```typescript
   const allStudents = await studentService.getAllStudents();
   ```
2. **Student type import**: Used for TypeScript typing

### Current Functionality
- Manages academic reports for students
- Loads students by class
- CRUD operations on academic reports (using Firestore directly)
- Filter students by selected class

---

## Migration Plan

### Changes Required

1. **Import Changes**
   ```typescript
   // REMOVE
   import { studentService, Student } from '@/firebase/services';
   
   // ADD
   import { useStudents } from '@/hooks/data/useStudents';
   import type { Student } from '@/firebase/types';
   ```

2. **Hook Integration**
   ```typescript
   const { students: allStudents, loading: studentsLoading } = useStudents({ autoFetch: true });
   ```

3. **Replace Service Call**
   ```typescript
   // BEFORE - Async service call in useEffect
   const allStudents = await studentService.getAllStudents();
   
   // AFTER - Use students from hook (already loaded)
   const classStudents = selectedClass === 'all' 
     ? allStudents 
     : allStudents.filter(s => s.class === selectedClass);
   ```

4. **Update Loading Logic**
   - Combine `studentsLoading` with existing loading states
   - Simplify loadData function (no more student fetching)

---

## Expected Benefits

1. **Code Reduction**: ~5-10 lines (remove async student loading)
2. **Performance**: Students cached by hook, no repeated fetches
3. **Consistency**: Matches other components using useStudents
4. **Type Safety**: Import Student type from types (cleaner)
5. **Maintainability**: Hook manages student data lifecycle

---

## Implementation Steps

1. ✅ Create session plan (this file)
2. ⏳ Update imports
3. ⏳ Add useStudents hook
4. ⏳ Remove studentService.getAllStudents() call
5. ⏳ Use students directly from hook
6. ⏳ Update loading logic
7. ⏳ Update useEffect dependencies
8. ⏳ Verify TypeScript compilation
9. ⏳ Update progress document

---

## Risk Assessment

**Risk Level**: LOW

- Simple read-only replacement
- Hook already proven in other components
- No complex state dependencies
- Only one service call to replace

---

## Testing Notes

After migration, verify:
1. Students load correctly for selected class
2. Class filtering works
3. Reports load for students
4. Add/Edit/Delete report functions work
5. Loading states display properly
6. No TypeScript errors
7. Performance is same or better

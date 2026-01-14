# Phase 4 - Session 17: Migrate UserCreationModal

**Date**: January 14, 2026  
**Session**: 17  
**Component**: UserCreationModal  
**Target**: Replace userService and studentService with useUsers hook

---

## Current Analysis

### File Location
- **Path**: `src/features/students/components/UserCreationModal.tsx`
- **Size**: 542 lines

### Current Dependencies
```typescript
import { userService, studentService } from '@/firebase/services';
```

### Service Usage
1. **getAllStudents** (line 73):
   ```typescript
   const students = await studentService.getAllStudents();
   return students.some(student => student.rollNumber === rollNumber);
   ```

2. **createUser** (line 213):
   ```typescript
   await userService.createUser(formData.email, formData.password, userData);
   ```

### Current Functionality
- Modal for creating new users (admin/teacher/student)
- Roll number generation for students
- Roll number uniqueness checking
- Form validation
- Student-specific fields (class, age, parent info)

---

## Migration Plan

### Changes Required

1. **Import Changes**
   ```typescript
   // REMOVE
   import { userService, studentService } from '@/firebase/services';
   
   // ADD
   import { useUsers } from '@/hooks/data/useUsers';
   import { useStudents } from '@/hooks/data/useStudents';
   ```

2. **Hook Integration**
   ```typescript
   const { addUser } = useUsers({ autoFetch: false });
   const { students } = useStudents({ autoFetch: true });
   ```

3. **Replace Service Calls**
   - `studentService.getAllStudents()` → Use `students` from hook (already loaded)
   - `userService.createUser()` → `addUser(email, password, userData)`

4. **Simplify Roll Number Check**
   ```typescript
   // BEFORE - Async call
   const students = await studentService.getAllStudents();
   return students.some(student => student.rollNumber === rollNumber);
   
   // AFTER - Synchronous check from cached data
   return students.some(student => student.rollNumber === rollNumber);
   ```

---

## Expected Benefits

1. **Performance**: Eliminate async call in roll number validation
2. **Consistency**: Matches BulkUserCreationModal pattern (Session 11)
3. **Code Reduction**: ~5-10 lines (remove async handling)
4. **Type Safety**: Hook ensures correct data structure
5. **Maintainability**: Single source of truth for user/student operations

---

## Implementation Steps

1. ✅ Create session plan (this file)
2. ⏳ Update imports
3. ⏳ Add useUsers and useStudents hooks
4. ⏳ Simplify checkRollNumberExists function
5. ⏳ Replace createUser call
6. ⏳ Verify TypeScript compilation
7. ⏳ Update progress document
8. ⏳ Continue to next session

---

## Risk Assessment

**Risk Level**: LOW

- Similar to Session 11 (BulkUserCreationModal)
- Well-tested hooks
- Simple service → hook replacement
- No complex state dependencies

---

## Testing Notes

After migration, verify:
1. Modal opens/closes correctly
2. Form validation works
3. Roll number generation works
4. Roll number uniqueness check works
5. Student creation succeeds
6. Teacher/Admin creation succeeds
7. Success message displays
8. Form resets after creation
9. onUserCreated callback fires

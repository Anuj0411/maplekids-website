# Phase 4 - Session 18: Migrate EditStudentForm

**Date**: January 14, 2026  
**Session**: 18  
**Component**: EditStudentForm  
**Target**: Replace studentService with useStudents hook, defer photoService

---

## Current Analysis

### File Location
- **Path**: `src/features/students/forms/EditStudentForm.tsx`
- **Size**: 392 lines

### Current Dependencies
```typescript
import { studentService, photoService } from '@/firebase/services';
```

### Service Usage Analysis Needed
- studentService: Multiple calls (load, update student)
- photoService: Photo upload functionality

### Migration Strategy
1. Replace studentService with useStudents hook
2. Keep photoService for now (defer to photo management session)
3. Or comment out photo features temporarily

---

## Migration Plan

### Changes Required

1. **Import Changes**
   ```typescript
   // REMOVE
   import { studentService, photoService } from '@/firebase/services';
   
   // ADD
   import { useStudents } from '@/hooks/data/useStudents';
   // Keep photoService temporarily OR comment out photo features
   ```

2. **Hook Integration**
   ```typescript
   const { students, updateStudent, getStudentByRollNumber } = useStudents({ autoFetch: true });
   ```

3. **Replace Service Calls**
   - Student loading → Use students from hook
   - Student update → `updateStudent(rollNumber, data)`

---

## Implementation Steps

1. ✅ Create session plan (this file)
2. ⏳ Read file to analyze service usage
3. ⏳ Update imports
4. ⏳ Add useStudents hook
5. ⏳ Replace studentService calls
6. ⏳ Handle photoService (keep or defer)
7. ⏳ Verify TypeScript compilation
8. ⏳ Update progress document
9. ⏳ Continue to next session

---

## Risk Assessment

**Risk Level**: MEDIUM

- photoService dependency (needs decision)
- Medium-sized file
- Form validation involved

---

## Testing Notes

After migration, verify:
1. Student data loads correctly
2. Form fields populate
3. Validation works
4. Update saves successfully
5. Photo upload (if kept) works
6. Navigation works after save

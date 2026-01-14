# Phase 4 Session 4: Manager Components Migration

## Session Overview
**Focus**: Migrate manager/admin components to custom hooks
**Target**: 3-4 components
**Estimated Line Reduction**: ~100-150 lines

## Components to Migrate

### 1. RemarksManager.tsx (Priority: HIGH)
**File**: `src/features/reports/components/RemarksManager.tsx`
**Current Size**: 334 lines
**Complexity**: Medium-High

**Current State Analysis**:
- Manual state management: 6 useState hooks
  - students, remarks, loading, showAddForm, editingRemark, formData
- Firebase operations scattered throughout
- Form handling: Add/Edit remark forms
- Student data loading based on class selection

**Migration Opportunities**:
1. **useForm**: Replace formData state for add/edit remark
2. **useStudents**: Replace manual students state and loading
3. **Custom useRemarks hook**: Manage remarks CRUD operations
4. **useFormValidation**: Add validation to remark forms

**Estimated Reduction**: ~40-50 lines

---

### 2. AdminAnnouncementManager.tsx (Priority: MEDIUM)
**File**: `src/features/announcements/components/AdminAnnouncementManager.tsx`
**Current Size**: 321 lines
**Complexity**: Medium

**Current State Analysis**:
- Manual state: 5 useState hooks
  - announcements, isCreating, editingId, formData, mediaPreview
- localStorage operations (should migrate to Firebase)
- File upload handling (image/video)
- Date range validation

**Migration Opportunities**:
1. **useForm**: Replace formData state
2. **useFormValidation**: Date validation, media URL validation
3. **Custom useAnnouncements hook**: Manage announcements CRUD
4. **File upload**: Keep separate for now (defer to Phase 5)

**Estimated Reduction**: ~35-45 lines

**Note**: File upload logic is complex, may defer similar to AddPhotoForm

---

### 3. AcademicReportsManager.tsx (Priority: HIGH - If Time Permits)
**File**: `src/features/reports/components/AcademicReportsManager.tsx`
**Current Size**: 609 lines
**Complexity**: HIGH

**Current State Analysis**:
- Large component with multiple responsibilities
- Student selection
- Report generation/viewing
- Data aggregation

**Migration Strategy**:
- This is a complex component that might need to be split
- Consider creating smaller sub-components first
- May defer to later session

**Decision**: **Assess during session**, may defer if too complex

---

## Migration Strategy

### Step 1: RemarksManager (30-40 min)
1. Read current implementation
2. Create custom `useRemarks` hook for Firebase operations
3. Replace formData with `useForm` hook
4. Add validation with `useFormValidation`
5. Replace students state with `useStudents` hook
6. Test and verify

### Step 2: AdminAnnouncementManager (30-40 min)
1. Read current implementation
2. Create custom `useAnnouncements` hook
3. Replace formData with `useForm` hook
4. Add date validation
5. Keep file upload logic as-is for now
6. Test and verify

### Step 3: Review & Polish (15-20 min)
1. Run error checks
2. Test all functionality
3. Update documentation
4. Prepare commit

---

## Success Criteria
- ✅ All migrated components have 0 TypeScript errors
- ✅ Form validation working correctly
- ✅ CRUD operations functional
- ✅ Minimum 80 lines reduction total
- ✅ Code is cleaner and more maintainable

## Deferred Items
- **AcademicReportsManager**: Too complex, defer to Session 5
- **File upload in AdminAnnouncementManager**: Defer to Phase 5 if too complex

## Hooks to Create This Session
1. **useRemarks**: Firebase CRUD operations for remarks
   - addRemark(data)
   - updateRemark(id, data)
   - deleteRemark(id)
   - getRemarksByClass(class)
   
2. **useAnnouncements**: Firebase CRUD operations for announcements
   - addAnnouncement(data)
   - updateAnnouncement(id, data)
   - deleteAnnouncement(id)
   - getActiveAnnouncements()

## Session Timeline
- 🎯 **Start**: Phase 4 Session 4
- ⏱️ **Duration**: 1.5-2 hours
- 📦 **Expected Output**: 2-3 migrated components, ~80-120 lines reduced
- ✅ **Completion**: Commit with clean, working code

---

## Progress Tracking

### Completed Components:
- [ ] RemarksManager.tsx
- [ ] AdminAnnouncementManager.tsx
- [ ] AcademicReportsManager.tsx (if time permits)

### Line Count Tracking:
- RemarksManager: 334 → ___ (Target: ~280-290)
- AdminAnnouncementManager: 321 → ___ (Target: ~275-285)
- **Total Reduction**: Target 80-120 lines

---

**Phase 4 Cumulative Progress**:
- Session 1: 5 components, 177 lines ✅
- Session 2: 6 components, 180 lines ✅
- Session 3: 2 components, 72 lines ✅
- **Session 4**: Target 2-3 components, 80-120 lines
- **Total So Far**: 13 components, 429 lines reduced

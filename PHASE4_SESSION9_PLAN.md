# Phase 4 Session 9: EditEventForm Migration

## Session Overview
**Focus**: Migrate EditEventForm to use useEvents hook
**Target**: 1 component
**Estimated Line Reduction**: ~20-40 lines

## Session 8 Recap (Just Committed)
✅ **AddEventForm**: Migrated to useEvents hook
✅ **AddFinancialRecordForm**: Migrated to useFinancialRecords + added live stats
**Total**: 2 forms migrated, +34 lines (feature enhancement)

---

## Session 9 Target

### EditEventForm.tsx
**File**: `src/features/events/components/EditEventForm.tsx`
**Expected Complexity**: MEDIUM (similar to AddEventForm)

**Current Implementation** (expected):
- Loads event by ID
- Uses eventService.updateEvent() and eventService.deleteEvent()
- Manual state management for loading/error

**Migration Strategy**:
1. Replace eventService with useEvents hook
2. Use hook's updateEvent() and deleteEvent() functions
3. Leverage hook's events data for initial load
4. Remove manual loading state if using hook's loading
5. Keep form validation logic

**Expected Benefits**:
- Hook-based architecture
- Consistent with AddEventForm
- Reuse hook's CRUD operations
- ~20-40 lines reduction

---

## Alternative Options

### Option B: Create useUsers Hook
**Purpose**: User management CRUD
**Time**: 40-50 min
**Benefit**: Enables UserCreationModal migration

### Option C: Create useAcademicReports Hook
**Purpose**: Academic reports CRUD + grade calculations
**Time**: 50-60 min
**Benefit**: Enables AcademicReportsManager migration

---

## Recommendation

**Go with EditEventForm** because:
1. ✅ Quick win (similar to AddEventForm)
2. ✅ Demonstrates update/delete operations from useEvents
3. ✅ Completes event management migration
4. ✅ Clear, focused scope
5. ✅ ~30 minutes

---

## Success Criteria
- ✅ Zero TypeScript errors
- ✅ Form loads event data correctly
- ✅ Update functionality working
- ✅ Delete functionality working
- ✅ ~20-40 lines reduction

# Phase 4 - Session 15: Migrate AttendanceOverview

**Date**: January 14, 2026  
**Session**: 15  
**Component**: AttendanceOverview  
**Target**: Replace attendanceService statistics methods with useAttendance hook

---

## Current Analysis

### File Location
- **Path**: `src/features/attendance/components/AttendanceOverview.tsx`
- **Size**: 506 lines

### Current Dependencies
```typescript
import { attendanceService } from '@/firebase/services';
```

### Service Usage
1. **getAttendanceStatistics** (line 51):
   ```typescript
   const stats = await attendanceService.getAttendanceStatistics(date);
   ```

2. **getAttendanceStatisticsByDateRange** (line 66):
   ```typescript
   const stats = await attendanceService.getAttendanceStatisticsByDateRange(start, end);
   ```

3. **getAttendanceStatisticsByMonth** (line 81):
   ```typescript
   const stats = await attendanceService.getAttendanceStatisticsByMonth(year, month);
   ```

### Current State Management
- Manual loading state
- Manual error state  
- Three separate async functions with useCallback
- Manual data fetching in useEffect

---

## Migration Plan

### Changes Required

1. **Import Changes**
   ```typescript
   // REMOVE
   import { attendanceService } from '@/firebase/services';
   
   // ADD (if not present)
   import { useAttendance } from '@/hooks/data/useAttendance';
   ```

2. **Remove Local Interface** (lines 6-12)
   ```typescript
   // REMOVE - Already defined in useAttendance hook
   interface AttendanceStats {
     total: number;
     present: number;
     absent: number;
     late: number;
     missed: number;
   }
   ```

3. **Remove Local DateRangeStats Interface** (lines 22-27)
   ```typescript
   // REMOVE - Already defined in useAttendance hook
   interface DateRangeStats {
     dailyStats: { [date: string]: { [className: string]: AttendanceStats } };
     summaryStats: { [className: string]: AttendanceStats & { daysWithAttendance: number } };
     totalDays: number;
     workingDays?: number;
   }
   ```

4. **Hook Integration**
   ```typescript
   const {
     getAttendanceStatistics,
     getAttendanceStatisticsByDateRange,
     getAttendanceStatisticsByMonth
   } = useAttendance({ autoFetch: false });
   ```

5. **Replace Service Calls** (3 locations)
   - Line 51: `attendanceService.getAttendanceStatistics()` → `getAttendanceStatistics()`
   - Line 66: `attendanceService.getAttendanceStatisticsByDateRange()` → `getAttendanceStatisticsByDateRange()`
   - Line 81: `attendanceService.getAttendanceStatisticsByMonth()` → `getAttendanceStatisticsByMonth()`

6. **Import Types** (if needed)
   ```typescript
   import type { AttendanceStats, DateRangeStats } from '@/hooks/data/useAttendance';
   ```

---

## Expected Benefits

1. **Code Reduction**: ~15-25 lines (remove duplicate interfaces)
2. **Type Safety**: Use hook's exported types
3. **Consistency**: Same pattern as other migrated components
4. **Real-time Capability**: Future enhancement to use hook's listener
5. **Maintainability**: Single source of truth for attendance types

---

## Implementation Steps

1. ✅ Create session plan (this file)
2. ⏳ Remove duplicate AttendanceStats interface
3. ⏳ Remove duplicate DateRangeStats interface
4. ⏳ Update imports (add useAttendance, import types)
5. ⏳ Add useAttendance hook
6. ⏳ Replace getAttendanceStatistics call
7. ⏳ Replace getAttendanceStatisticsByDateRange call
8. ⏳ Replace getAttendanceStatisticsByMonth call
9. ⏳ Update dependency arrays if needed
10. ⏳ Verify TypeScript compilation
11. ⏳ Update progress document
12. ⏳ Batch commit Sessions 14-15

---

## Risk Assessment

**Risk Level**: LOW

- Simple service → hook replacement
- Type definitions already exist in hook
- No complex state dependencies
- Well-defined API in useAttendance

---

## Testing Notes

After migration, verify:
1. Daily view loads statistics correctly
2. Date range view works properly
3. Monthly view displays correct data
4. Loading states show appropriately
5. Error handling displays messages
6. View mode switching works
7. Class statistics render correctly
8. Overall school summary calculates properly
9. Percentage calculations are accurate
10. Mobile/desktop layouts responsive

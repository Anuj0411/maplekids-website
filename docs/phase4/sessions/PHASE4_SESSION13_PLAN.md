# Phase 4 Session 13: Create useAttendance Hook

## Session Overview
**Focus**: Build comprehensive useAttendance hook for attendance management  
**Estimated Time**: 60 minutes  
**Type**: Infrastructure (Hook Creation)

## Objectives
- Create `useAttendance` hook with CRUD operations
- Support statistics calculation (daily, date range, monthly)
- Add filtering by class, date, student
- Enable future attendance component migrations

## Hook Specification: `useAttendance`

### Location
`src/hooks/data/useAttendance.ts`

### Core Features

#### 1. Data Fetching
```typescript
const { attendance, loading, error } = useAttendance({ autoFetch: true });
```

#### 2. CRUD Operations
- `addAttendance(attendanceData)` - Create attendance record
- `updateAttendance(id, attendanceData)` - Update record
- `markAttendance(data)` - Bulk mark with teacher tracking
- `getAttendanceByClassAndDate(class, date)` - Get specific record
- `getAttendanceByStudent(rollNumber)` - Get student's attendance

#### 3. Statistics Functions
- `getAttendanceStatistics(date)` - Daily stats per class
- `getAttendanceStatisticsByDateRange(start, end)` - Range stats
- `getAttendanceStatisticsByMonth(year, month)` - Monthly stats

#### 4. Filtering Functions
- `getAttendanceByDate(date)` - All records for a date
- `getAttendanceByDateRange(start, end)` - Records in range

### Interface Types
```typescript
interface Attendance {
  id?: string;
  class: string;
  date: string;
  students: {
    studentId: string;
    rollNumber: string;
    studentName?: string;
    status: 'present' | 'absent' | 'late';
    remarks?: string;
  }[];
  markedBy?: {
    userId: string;
    name: string;
    email: string;
  };
  createdAt?: any;
}

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  missed: number;
}
```

## Target Components

After `useAttendance` hook is created:

1. **BulkAttendanceForm** (~400 lines)
   - Uses attendanceService directly
   - Needs markAttendance functionality

2. **AttendanceOverview** (~300 lines)
   - Statistics display
   - Multiple view modes (daily, range, monthly)

3. **TeacherDashboard** (partial)
   - Attendance marking section

4. **StudentDashboard** (partial)
   - Student attendance view

## Expected Benefits
- Centralized attendance logic
- Real-time attendance updates
- Consistent statistics calculation
- Reusable across components
- Estimated 500+ line reduction

## Success Criteria
- ✅ Hook compiles with 0 TypeScript errors
- ✅ All CRUD operations functional
- ✅ Statistics calculation working
- ✅ Real-time updates functioning
- ✅ Proper error handling

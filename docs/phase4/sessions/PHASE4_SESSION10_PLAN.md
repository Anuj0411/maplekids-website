# Phase 4 Session 10: Create useUsers Hook

## Session Overview
**Focus**: Build comprehensive useUsers hook for user management  
**Estimated Time**: 45-60 minutes  
**Type**: Infrastructure (Hook Creation)

## Objectives
- Create `useUsers` hook with CRUD operations
- Support filtering by role (student, parent, teacher, admin)
- Add search/filter capabilities
- Enable future user management form migrations

## Hook Specification: `useUsers`

### Location
`src/hooks/data/useUsers.ts`

### Core Features

#### 1. Data Fetching
```typescript
const { users, loading, error } = useUsers();
```

#### 2. CRUD Operations
- `addUser(userData)` - Create new user
- `updateUser(userId, userData)` - Update user
- `deleteUser(userId)` - Delete user
- `updateUserRole(userId, newRole)` - Change user role
- `toggleUserStatus(userId)` - Activate/deactivate user

#### 3. Filtering Functions
- `getUsersByRole(role)` - Filter by role
- `getUsersByClass(className)` - Filter students by class
- `getActiveUsers()` - Get active users only
- `searchUsers(query)` - Search by name/email

#### 4. Computed Properties
- `students` - All student users
- `parents` - All parent users
- `teachers` - All teacher users
- `admins` - All admin users
- `activeUsers` - All active users
- `stats` - User statistics by role

### Interface Types
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  isActive: boolean;
  className?: string; // For students
  subjects?: string[]; // For teachers
  children?: string[]; // For parents (student IDs)
  createdAt: Date;
  updatedAt: Date;
}

interface UserStats {
  totalUsers: number;
  studentCount: number;
  parentCount: number;
  teacherCount: number;
  adminCount: number;
  activeCount: number;
  inactiveCount: number;
}
```

## Implementation Strategy

### 1. Base Hook Structure (~100 lines)
- State management (users, loading, error)
- Firebase real-time subscription
- Auto-fetch option

### 2. CRUD Operations (~80 lines)
- Add user with validation
- Update user with optimistic updates
- Delete user with confirmation
- Role management
- Status toggles

### 3. Filtering & Search (~60 lines)
- Role-based filters
- Class-based filters
- Active/inactive filters
- Text search (name, email)

### 4. Computed Properties (~40 lines)
- Memoized role filters
- User statistics calculation
- Sorted/grouped data

**Total Estimated**: ~280 lines

## Target Components (Future Sessions)

After `useUsers` hook is created, these components can be migrated:

1. **BulkUserCreationModal** (~400 lines)
   - Uses direct Firebase calls
   - Needs user creation functionality

2. **ExcelBulkUserCreationModal** (~350 lines)
   - Excel import for users
   - Bulk operations

3. **User Management Forms**
   - Add/Edit user forms
   - Role assignment forms

4. **Student/Parent/Teacher Lists**
   - Display components
   - Filter/search features

## Expected Benefits

### Immediate
- Centralized user management logic
- Consistent error handling
- Real-time user data sync
- Reusable across components

### Long-term
- Enable 4+ component migrations
- Reduce ~1000+ lines in forms
- Better user data consistency
- Improved security (centralized validation)

## Success Criteria
- ✅ Hook compiles with 0 TypeScript errors
- ✅ All CRUD operations functional
- ✅ Filtering/search working
- ✅ Real-time updates functioning
- ✅ Proper error handling
- ✅ Documentation complete

## Next Steps After Session 10
1. Test useUsers hook thoroughly
2. Migrate BulkUserCreationModal (Session 11)
3. Migrate ExcelBulkUserCreationModal (Session 12)
4. Continue user management migrations

## Notes
- Follow pattern from useEvents and useFinancialRecords
- Add proper TypeScript types
- Include optimistic updates
- Handle edge cases (duplicate emails, role changes)
- Consider permission checks

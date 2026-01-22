# MapleKids Application - Architecture Diagram

**Last Updated**: January 22, 2026  
**Status**: Production Ready ✅  
**Architecture Version**: 2.0 (Post-Migration)

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Application                           │
│                          (TypeScript)                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Components Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Features   │  │    Common    │  │    Pages     │             │
│  │  Components  │  │  Components  │  │  Components  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Custom Hooks Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Auth Hooks  │  │  Data Hooks  │  │ Form Hooks   │             │
│  │  useAuth     │  │  useStudents │  │  useForm     │             │
│  │              │  │  useUsers    │  │              │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Firebase Services Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Auth Service │  │ Data Service │  │File Service  │             │
│  │              │  │  Firestore   │  │   Storage    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Firebase Backend                              │
│         Authentication │ Firestore │ Storage │ Functions            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Detailed Layer Architecture

### 1. Component Layer

```
src/
├── features/                      # Feature-based components
│   ├── auth/
│   │   └── components/
│   │       ├── SigninForm.tsx     ← Uses useAuth hook
│   │       └── SignupForm.tsx     ← Uses useAuth hook
│   ├── students/
│   │   └── components/
│   │       ├── StudentList.tsx    ← Uses useStudents hook
│   │       └── StudentForm.tsx    ← Uses useStudents hook
│   ├── attendance/
│   │   └── components/
│   │       └── AttendanceOverview.tsx ← Uses useAttendance hook
│   ├── dashboards/
│   │   └── components/
│   │       ├── AdminDashboard.tsx ← Uses useAuth, useDashboardData
│   │       ├── TeacherDashboard.tsx
│   │       └── StudentDashboard.tsx
│   ├── events/
│   ├── finance/
│   ├── reports/
│   ├── photos/
│   └── announcements/
│
└── components/
    └── common/                    # Reusable UI components
        ├── Button.tsx
        ├── Table.tsx
        ├── FormField.tsx
        └── Modal.tsx
```

**Characteristics**:
- ✅ Pure UI components
- ✅ Use custom hooks for data/state
- ✅ No direct Firebase imports
- ✅ Type-safe with TypeScript

---

### 2. Custom Hooks Layer

```
src/hooks/
├── auth/
│   ├── useAuth.ts                 # Authentication hook (334 lines)
│   │   ├── State: user, loading, isAuthenticated, error
│   │   └── Methods: signIn, signUp, resetPassword, 
│   │       reauthenticate, updatePassword, signOut
│   │
│   └── useCurrentUser.ts          # Current user data hook
│
├── data/
│   ├── useStudents.ts             # Student data management
│   ├── useUsers.ts                # User data management
│   ├── useEvents.ts               # Event data management
│   ├── useFinancialRecords.ts     # Financial data management
│   ├── useReports.ts              # Academic reports management
│   ├── usePhotos.ts               # Photo gallery management
│   ├── useAttendance.ts           # Attendance tracking
│   ├── useDashboardData.ts        # Dashboard aggregated data
│   └── useRemarks.ts              # Student remarks management
│
├── form/
│   ├── useForm.ts                 # Form state management
│   └── useFormValidation.ts       # Form validation rules
│
└── utils/
    └── useDebounce.ts             # Utility hooks
```

**Characteristics**:
- ✅ Centralized business logic
- ✅ Manage Firebase interactions
- ✅ State management
- ✅ Reusable across components
- ✅ Easy to test (can be mocked)

---

### 3. Firebase Services Layer

```
src/firebase/
├── config.ts                      # Firebase initialization
│   ├── auth (Firebase Auth instance)
│   ├── db (Firestore instance)
│   └── storage (Storage instance)
│
├── services.ts                    # Firebase service wrappers
│   ├── authService
│   ├── studentService
│   ├── userService
│   ├── eventService
│   ├── financialService
│   ├── photoService
│   └── attendanceService
│
└── types/
    ├── user.types.ts              # User type definitions
    ├── student.types.ts           # Student type definitions
    └── ...other types
```

**Characteristics**:
- ✅ Direct Firebase API access
- ✅ Type-safe interfaces
- ✅ Error handling
- ✅ Centralized Firebase logic

---

## 🔄 Data Flow Architecture

### Authentication Flow

```
┌─────────────────┐
│   SigninForm    │
│   (Component)   │
└────────┬────────┘
         │ 1. User submits
         ▼
┌─────────────────┐
│    useAuth()    │
│     (Hook)      │
└────────┬────────┘
         │ 2. signIn(email, password)
         ▼
┌─────────────────┐
│  Firebase Auth  │
│    (Service)    │
└────────┬────────┘
         │ 3. Authentication
         ▼
┌─────────────────┐
│  Auth State     │
│  Updated        │
└────────┬────────┘
         │ 4. onAuthStateChanged
         ▼
┌─────────────────┐
│   Component     │
│   Re-renders    │
└─────────────────┘
```

### Data Fetching Flow

```
┌─────────────────┐
│  StudentList    │
│   (Component)   │
└────────┬────────┘
         │ 1. Mount/Render
         ▼
┌─────────────────┐
│ useStudents()   │
│     (Hook)      │
└────────┬────────┘
         │ 2. Fetch data
         ▼
┌─────────────────┐
│ studentService  │
│   (Service)     │
└────────┬────────┘
         │ 3. Firestore query
         ▼
┌─────────────────┐
│   Firestore     │
│   Database      │
└────────┬────────┘
         │ 4. Real-time listener
         ▼
┌─────────────────┐
│  Hook updates   │
│     state       │
└────────┬────────┘
         │ 5. State change
         ▼
┌─────────────────┐
│   Component     │
│   Re-renders    │
└─────────────────┘
```

### Form Submission Flow

```
┌─────────────────┐
│   StudentForm   │
│   (Component)   │
└────────┬────────┘
         │ 1. User fills form
         ▼
┌─────────────────┐
│   useForm()     │
│     (Hook)      │
└────────┬────────┘
         │ 2. Validation
         ▼
┌─────────────────┐
│ useStudents()   │
│     (Hook)      │
└────────┬────────┘
         │ 3. addStudent()
         ▼
┌─────────────────┐
│ studentService  │
│   (Service)     │
└────────┬────────┘
         │ 4. Firestore write
         ▼
┌─────────────────┐
│   Firestore     │
│   Database      │
└────────┬────────┘
         │ 5. Real-time update
         ▼
┌─────────────────┐
│  List updates   │
│  automatically  │
└─────────────────┘
```

---

## 🔐 Authentication Architecture

### useAuth Hook - Complete API

```typescript
const {
  // State
  user,              // FirebaseUser | null
  loading,           // boolean
  isAuthenticated,   // boolean
  error,             // string | null
  
  // Methods
  signIn,            // (email, password) => Promise<void>
  signUp,            // (email, password, userData) => Promise<void>
  resetPassword,     // (email) => Promise<void>
  reauthenticate,    // (password) => Promise<void>
  updatePassword,    // (current, new) => Promise<void>
  signOut            // () => Promise<void>
} = useAuth();
```

### Error Handling

```
Firebase Error Codes (25+ mapped)
         │
         ▼
┌─────────────────────┐
│   useAuth Hook      │
│   Error Mapping     │
└─────────┬───────────┘
          │
          ▼
User-Friendly Messages
  ├─ "Invalid email or password"
  ├─ "This account has been disabled"
  ├─ "Too many requests. Try again later"
  ├─ "Email already in use"
  └─ "Password too weak"
```

---

## 📊 Data Management Architecture

### Real-time Data Flow

```
┌──────────────────────────────────────────────────┐
│              Firestore Database                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ students │ │  users   │ │  events  │        │
│  └──────────┘ └──────────┘ └──────────┘        │
└───────────┬──────────────────────────────────────┘
            │ Real-time listeners
            ▼
┌──────────────────────────────────────────────────┐
│              Custom Hooks                        │
│  ┌──────────────┐ ┌──────────────┐              │
│  │ useStudents  │ │  useEvents   │              │
│  │              │ │              │              │
│  │ State:       │ │ State:       │              │
│  │ - students   │ │ - events     │              │
│  │ - loading    │ │ - loading    │              │
│  │ - error      │ │ - error      │              │
│  │              │ │              │              │
│  │ Methods:     │ │ Methods:     │              │
│  │ - add()      │ │ - add()      │              │
│  │ - update()   │ │ - update()   │              │
│  │ - delete()   │ │ - delete()   │              │
│  │ - refetch()  │ │ - refetch()  │              │
│  └──────────────┘ └──────────────┘              │
└───────────┬──────────────────────────────────────┘
            │ Hook state updates
            ▼
┌──────────────────────────────────────────────────┐
│              Components                          │
│  ┌──────────────┐ ┌──────────────┐              │
│  │ StudentList  │ │  EventList   │              │
│  │ (Auto-       │ │ (Auto-       │              │
│  │  updates)    │ │  updates)    │              │
│  └──────────────┘ └──────────────┘              │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Component-Hook-Service Relationships

### Example: Student Management

```
StudentList.tsx (Component)
    │
    ├─ const { students, loading, addStudent } = useStudents();
    │
    └─ useStudents.ts (Hook)
           │
           ├─ State: students[], loading, error
           ├─ Methods: addStudent, updateStudent, deleteStudent
           │
           └─ studentService.ts (Service)
                  │
                  ├─ getStudents() → Firestore query
                  ├─ addStudent() → Firestore add
                  ├─ updateStudent() → Firestore update
                  └─ deleteStudent() → Firestore delete
                         │
                         └─ Firestore Database
```

### Example: Authentication

```
SigninForm.tsx (Component)
    │
    ├─ const { signIn, error, loading } = useAuth();
    │
    └─ useAuth.ts (Hook)
           │
           ├─ State: user, loading, error, isAuthenticated
           ├─ Methods: signIn, signUp, signOut, resetPassword
           │
           └─ Firebase Auth API
                  │
                  ├─ signInWithEmailAndPassword()
                  ├─ createUserWithEmailAndPassword()
                  ├─ sendPasswordResetEmail()
                  └─ signOut()
                         │
                         └─ Firebase Authentication
```

---

## 🗂️ File Structure Overview

```
maplekids-website/
├── src/
│   ├── components/           # Reusable UI components
│   │   └── common/
│   │
│   ├── features/            # Feature modules
│   │   ├── auth/
│   │   ├── students/
│   │   ├── attendance/
│   │   ├── dashboards/
│   │   ├── events/
│   │   ├── finance/
│   │   ├── reports/
│   │   ├── photos/
│   │   └── announcements/
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── auth/
│   │   ├── data/
│   │   ├── form/
│   │   └── utils/
│   │
│   ├── firebase/            # Firebase configuration & services
│   │   ├── config.ts
│   │   ├── services.ts
│   │   └── types/
│   │
│   ├── utils/               # Utility functions
│   ├── contexts/            # React contexts
│   ├── i18n/                # Internationalization
│   ├── styles/              # Global styles
│   │
│   ├── App.tsx              # Main app component
│   └── index.tsx            # Entry point
│
├── public/                  # Static assets
├── docs/                    # Documentation
│   └── architecture/        # Architecture documentation
│
└── package.json
```

---

## 🔧 Technology Stack

### Frontend
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.0.0
- **Routing**: React Router v6
- **Styling**: CSS Modules
- **i18n**: react-i18next

### Backend
- **BaaS**: Firebase 12.2.1
  - Authentication (Email/Password)
  - Firestore (NoSQL Database)
  - Storage (File uploads)
  - Functions (Serverless)

### Development
- **Build Tool**: Create React App
- **Type Checking**: TypeScript
- **Package Manager**: npm/yarn

---

## 📈 Scalability Considerations

### Horizontal Scalability
```
Multiple Components
    ↓
Same Hook Instance (shared state)
    ↓
Single Firebase Connection
    ↓
Auto-scaling Firebase Backend
```

### Code Organization
```
Feature-based structure
    ↓
Each feature is independent
    ↓
Easy to add/remove features
    ↓
Scales with team size
```

### Performance
```
Real-time listeners (only active data)
    ↓
Local state caching in hooks
    ↓
Optimistic UI updates
    ↓
Fast user experience
```

---

## 🧪 Testing Strategy

### Component Testing
```typescript
// Mock the hook
jest.mock('@/hooks/auth/useAuth');

// Component test
test('SigninForm submits correctly', () => {
  const mockSignIn = jest.fn();
  useAuth.mockReturnValue({
    signIn: mockSignIn,
    loading: false,
    error: null
  });
  
  // Test component behavior
});
```

### Hook Testing
```typescript
// Test hook in isolation
test('useAuth signs in user', async () => {
  const { result } = renderHook(() => useAuth());
  
  await act(async () => {
    await result.current.signIn('test@example.com', 'password');
  });
  
  expect(result.current.user).toBeDefined();
});
```

---

## 🔒 Security Architecture

### Authentication Flow
```
1. User enters credentials
2. useAuth.signIn() called
3. Firebase Auth validates
4. JWT token issued
5. Token stored in browser
6. All requests include token
7. Firebase validates token server-side
```

### Data Access
```
Firestore Security Rules
    ↓
User must be authenticated
    ↓
Role-based access (admin/teacher/student)
    ↓
Data scoped to user permissions
```

### API Security
```
No API keys in frontend code
    ↓
Firebase SDK handles auth
    ↓
Environment variables for config
    ↓
CORS configured on backend
```

---

## 🎨 Design Patterns Used

### 1. **Hook Pattern**
- Encapsulates stateful logic
- Reusable across components
- Easy to test

### 2. **Service Layer Pattern**
- Separates business logic from UI
- Centralized Firebase access
- Single source of truth

### 3. **Container/Presenter Pattern**
- Hooks = Containers (logic)
- Components = Presenters (UI)
- Clear separation of concerns

### 4. **Facade Pattern**
- Hooks provide simple API
- Hide Firebase complexity
- Consistent interface

---

## 📊 Migration Status

### Component Migration: 100% ✅

```
Total Components: 35/35 (100%)

By Feature:
├─ Auth: 3/3 (SigninForm, SignupForm, AdminDashboard)
├─ Students: 6/6 (All migrated)
├─ Events: 2/2 (All migrated)
├─ Finance: 3/3 (All migrated)
├─ Attendance: 4/4 (All migrated)
├─ Reports: 1/1 (All migrated)
├─ Photos: 1/1 (All migrated)
└─ Others: 15/15 (All migrated)
```

### Architecture Quality
- ✅ 0 TypeScript errors
- ✅ 0 direct Firebase imports in components
- ✅ Consistent hook usage across all components
- ✅ Production-ready code

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────┐
│      React Build (Static Files)    │
│         npm run build               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Firebase Hosting (CDN)         │
│      Serves React App               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Firebase Backend               │
│  ┌──────────┬──────────┬─────────┐ │
│  │   Auth   │Firestore │ Storage │ │
│  └──────────┴──────────┴─────────┘ │
└─────────────────────────────────────┘
```

---

## 📝 Key Architectural Decisions

### 1. **Hooks over HOCs/Render Props**
- Modern React pattern
- Better code reuse
- Simpler component tree

### 2. **Feature-based Structure**
- Scales better than layer-based
- Each feature is self-contained
- Easier to understand

### 3. **TypeScript Everywhere**
- Type safety
- Better IDE support
- Fewer runtime errors

### 4. **Centralized State in Hooks**
- Single source of truth
- Easier to debug
- Consistent behavior

### 5. **No Redux/MobX**
- Hooks + Context sufficient
- Less boilerplate
- Simpler architecture

---

## 🎯 Future Architecture Considerations

### Potential Enhancements

1. **State Management**
   - Consider Zustand/Jotai if state grows complex
   - Currently: Hooks + Context is sufficient

2. **API Layer**
   - If REST API needed, add axios/fetch layer
   - Currently: Firebase SDK direct

3. **Caching**
   - Consider React Query for advanced caching
   - Currently: Hook-level state caching

4. **Code Splitting**
   - Lazy load feature modules
   - Reduce initial bundle size

5. **PWA**
   - Add service workers
   - Offline support
   - Push notifications

---

## 📚 Related Documentation

- **Implementation Guide**: `/docs/architecture/IMPLEMENTATION_GUIDE.md`
- **Architecture Analysis**: `/docs/architecture/ARCHITECTURE_ANALYSIS.md`
- **Firebase Setup**: `/docs/firebase/`
- **Component Guides**: `/docs/guides/`

---

## ✅ Architecture Checklist

### Code Quality
- ✅ TypeScript for type safety
- ✅ Consistent naming conventions
- ✅ Clear separation of concerns
- ✅ No circular dependencies
- ✅ Proper error handling

### Maintainability
- ✅ Feature-based structure
- ✅ Reusable hooks
- ✅ Documented code
- ✅ Clear file organization
- ✅ Easy to extend

### Performance
- ✅ Efficient re-renders
- ✅ Real-time data updates
- ✅ Optimistic UI updates
- ✅ Lazy loading where needed
- ✅ Memoization in hooks

### Security
- ✅ Firebase Auth integration
- ✅ Firestore security rules
- ✅ No sensitive data in frontend
- ✅ Role-based access control
- ✅ Input validation

### Testing
- ✅ Easy to mock hooks
- ✅ Isolated component tests
- ✅ Type-safe tests
- ✅ Clear test boundaries
- ✅ Testable architecture

---

**Last Updated**: January 22, 2026  
**Architecture Version**: 2.0  
**Status**: ✅ Production Ready

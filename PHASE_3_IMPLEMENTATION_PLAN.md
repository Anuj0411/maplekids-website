# Phase 3: Custom Hooks Extraction - Implementation Plan

**Date**: January 14, 2026  
**Focus**: Extract reusable logic into custom React hooks  
**Status**: 🚧 PLANNING

---

## 🔍 Analysis Results

### Identified Patterns

After analyzing 50+ component files, here are the repeated patterns:

1. **Authentication State** (10+ components)
   - `useState` for user
   - `useEffect` to fetch current user
   - Auth state management

2. **Data Fetching** (15+ components)
   - `useState` for data array
   - `useState` for loading
   - `useEffect` to fetch from Firebase
   - Error handling

3. **Form State** (20+ components)
   - `useState` for formData
   - `useState` for errors
   - `useState` for isSubmitting
   - `useState` for success/error messages
   - Validation logic
   - Submit handlers

4. **Modal/Dialog State** (8+ components)
   - `useState` for show/hide
   - `useState` for editing item
   - Open/close handlers

5. **Local Storage** (5+ components)
   - `useState` synchronized with localStorage
   - `useEffect` to persist state

---

## 📁 Hook Architecture

```
src/
└── hooks/
    ├── index.ts              # Barrel export
    ├── auth/
    │   ├── useAuth.ts       # Authentication state
    │   ├── useCurrentUser.ts # Current user data
    │   └── useUserRole.ts   # Role-based access
    ├── data/
    │   ├── useStudents.ts   # Student data fetching
    │   ├── useAttendance.ts # Attendance data
    │   ├── useFinancialRecords.ts
    │   ├── useEvents.ts
    │   └── usePhotos.ts
    ├── forms/
    │   ├── useForm.ts       # Generic form state
    │   └── useFormValidation.ts
    ├── ui/
    │   ├── useModal.ts      # Modal state
    │   ├── useToggle.ts     # Boolean toggle
    │   └── useDebounce.ts   # Debounced values
    └── storage/
        └── useLocalStorage.ts # Persistent state
```

---

## 🎯 Session 1: Auth Hooks

### Hook 1: `useAuth`
**Purpose**: Manage authentication state

```typescript
export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading, isAuthenticated: !!user };
};
```

**Usage**: 10+ components (all dashboards, auth components)

### Hook 2: `useCurrentUser`
**Purpose**: Fetch current user data from Firestore

```typescript
export const useCurrentUser = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getCurrentUserData();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { userData, loading, error };
};
```

**Usage**: All dashboard components

### Hook 3: `useUserRole`
**Purpose**: Check user role and permissions

```typescript
export const useUserRole = () => {
  const { userData, loading } = useCurrentUser();
  
  return {
    role: userData?.role,
    isAdmin: userData?.role === 'admin',
    isTeacher: userData?.role === 'teacher',
    isStudent: userData?.role === 'student',
    loading
  };
};
```

**Usage**: All dashboard components, protected routes

---

## 🎯 Session 2: Data Fetching Hooks

### Hook 4: `useStudents`
**Purpose**: Fetch and manage student data

```typescript
export const useStudents = (className?: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = className 
          ? await studentService.getStudentsByClass(className)
          : await studentService.getAllStudents();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [className]);

  const refetch = () => {
    setLoading(true);
    // refetch logic
  };

  return { students, loading, error, refetch };
};
```

**Usage**: 8+ components (UserCreationModal, AttendanceOverview, RemarksManager, etc.)

### Hook 5: `useAttendance`
**Purpose**: Fetch attendance data

```typescript
export const useAttendance = (className: string, date: string) => {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await attendanceService.getAttendanceByClassAndDate(className, date);
        setAttendance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [className, date]);

  return { attendance, loading, error };
};
```

**Usage**: AttendanceOverview, BulkAttendanceForm

### Hook 6: `useFinancialRecords`
**Purpose**: Fetch financial records

```typescript
export const useFinancialRecords = (type?: 'income' | 'expense') => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = type
          ? await financialService.getFinancialRecordsByType(type)
          : await financialService.getAllFinancialRecords();
        setRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [type]);

  return { records, loading, error };
};
```

**Usage**: Financial dashboard, reports

### Hook 7: `useEvents`
**Purpose**: Fetch event data

```typescript
export const useEvents = (activeOnly = false) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = activeOnly
          ? await eventService.getActiveEvents()
          : await eventService.getAllEvents();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeOnly]);

  return { events, loading, error };
};
```

**Usage**: Event management components, HomePage

### Hook 8: `usePhotos`
**Purpose**: Fetch photo gallery data

```typescript
export const usePhotos = (category?: string) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const data = category
          ? await photoService.getPhotosByCategory(category)
          : await photoService.getAllPhotos();
        setPhotos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [category]);

  return { photos, loading, error };
};
```

**Usage**: Photo gallery components

---

## 🎯 Session 3: Form Hooks

### Hook 9: `useForm`
**Purpose**: Generic form state management

```typescript
export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (onSubmit: (data: T) => Promise<void>) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setFormData(initialValues);
    setErrors({});
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  return {
    formData,
    errors,
    isSubmitting,
    submitSuccess,
    submitError,
    handleChange,
    handleSubmit,
    setErrors,
    reset
  };
};
```

**Usage**: 20+ form components

---

## 🎯 Session 4: UI Hooks

### Hook 10: `useModal`
**Purpose**: Modal state management

```typescript
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const open = (item?: any) => {
    if (item) setEditingItem(item);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingItem(null);
  };

  return { isOpen, editingItem, open, close };
};
```

**Usage**: 8+ components with modals

### Hook 11: `useToggle`
**Purpose**: Boolean state toggle

```typescript
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = () => setValue(prev => !prev);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return [value, { toggle, setTrue, setFalse, setValue }] as const;
};
```

**Usage**: Various components

### Hook 12: `useLocalStorage`
**Purpose**: Persistent state in localStorage

```typescript
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};
```

**Usage**: Theme, language, user preferences

---

## 📊 Impact Analysis

### Before Custom Hooks:
- **Code Duplication**: 500+ lines of repeated logic
- **Maintainability**: Low - changes need updates in multiple files
- **Testability**: Hard - logic tied to components
- **Reusability**: None

### After Custom Hooks:
- **Code Reduction**: ~40% less code in components
- **Maintainability**: High - single source of truth
- **Testability**: Easy - hooks can be tested independently
- **Reusability**: Excellent - hooks used across multiple components

---

## 🎯 Success Criteria

- ✅ 12+ custom hooks created
- ✅ All identified patterns extracted
- ✅ 0 TypeScript errors
- ✅ Component code 40% smaller
- ✅ All components updated to use hooks
- ✅ Comprehensive documentation
- ✅ Unit tests for critical hooks

---

## 📝 Implementation Order

**Session 1**: Auth hooks (useAuth, useCurrentUser, useUserRole)  
**Session 2**: Data fetching hooks (useStudents, useAttendance, etc.)  
**Session 3**: Form hooks (useForm, useFormValidation)  
**Session 4**: UI hooks (useModal, useToggle, useLocalStorage)  
**Session 5**: Update components to use hooks  
**Session 6**: Testing and documentation

---

**Ready to start?** Let's begin with **Session 1: Auth Hooks** 🚀

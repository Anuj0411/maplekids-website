# React Context Mental Model: Understanding createContext Hook

## 🧠 The Mental Model - "The Broadcasting Station"

Think of React Context as a **broadcasting station** that eliminates "prop drilling":

```
WITHOUT CONTEXT (Prop Drilling):
App → Header → Navigation → UserMenu → UserProfile
     ↓        ↓            ↓          ↓
   (user)  (user)      (user)     (user)
   
WITH CONTEXT (Broadcasting):
App (broadcasts user data)
  ↓
  ├─ Header (ignores)
  ├─ Navigation (ignores)
  └─ UserProfile (tunes in and receives user data directly)
```

## 📐 The Architecture - Three Core Pieces

### 1. **The Context** (The Broadcasting Frequency)
```typescript
const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);
```
- Creates a "channel" that components can tune into
- Defines the TYPE of data that will be broadcast
- Initially has `undefined` (no broadcast yet)

### 2. **The Provider** (The Transmitter)
```typescript
export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
  // Provider holds the STATE and LOGIC
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Provider broadcasts the VALUE to all children
  return (
    <AnnouncementContext.Provider value={{
      announcements,
      loading,
      handleAnnouncementDismiss
    }}>
      {children}
    </AnnouncementContext.Provider>
  );
};
```
- **Manages the state** (what to broadcast)
- **Wraps children** components (who can receive)
- **Provides value** to all descendants

### 3. **The Hook** (The Receiver/Tuner)
```typescript
export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  return context;
};
```
- Custom hook to "tune in" to the broadcast
- Safety check: ensures you're inside the Provider
- Returns the broadcast value

---

## 🏗️ Real Example from Your Code

### Step 1: Define the Context Interface (What Data Will Be Shared)

```typescript
interface AnnouncementContextType {
  announcements: Announcement[];           // The data
  loading: boolean;                       // Loading state
  announcementDismissed: boolean;         // UI state
  handleAnnouncementDismiss: (id: string) => Promise<void>; // Actions
}
```

**Why?** TypeScript needs to know what shape the data has.

---

### Step 2: Create the Context

```typescript
const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);
```

**Mental Model:** Creating an empty "radio frequency" that doesn't broadcast anything yet.

**Key Points:**
- `undefined` as default means "no provider found"
- This will be checked in the custom hook

---

### Step 3: Build the Provider Component

```typescript
export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
  // 1. STATE MANAGEMENT (What to broadcast)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  
  // 2. SIDE EFFECTS (Fetching data, subscriptions)
  useEffect(() => {
    // Subscribe to Firebase real-time updates
    const unsubscribe = announcementService.subscribeToActiveAnnouncements(
      (activeAnnouncements) => {
        setAnnouncements(activeAnnouncements);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // 3. ACTIONS (Functions that modify state)
  const handleAnnouncementDismiss = async (announcementId: string) => {
    await announcementService.dismissAnnouncement(user.uid, announcementId);
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
    setAnnouncementDismissed(true);
  };

  // 4. BROADCAST THE VALUE
  return (
    <AnnouncementContext.Provider value={{
      announcements,
      loading,
      announcementDismissed,
      handleAnnouncementDismiss
    }}>
      {children}  {/* All children can now access this data */}
    </AnnouncementContext.Provider>
  );
};
```

**Mental Model:** The Provider is like a **smart component** that:
- Holds all the **state** (data storage)
- Contains all the **logic** (fetching, updating)
- Shares everything through the **value prop**
- Wraps **children** who need access

---

### Step 4: Create the Custom Hook (Convenience + Safety)

```typescript
export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  
  // SAFETY CHECK: Ensure we're inside a Provider
  if (context === undefined) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  
  return context;
};
```

**Why create a custom hook?**
1. **Safety:** Checks if component is wrapped in Provider
2. **Convenience:** Shorter syntax than `useContext(AnnouncementContext)`
3. **Better errors:** Clear error message if used incorrectly

---

## 🎯 How to Use It

### Step 1: Wrap Your App (High in the Tree)

```typescript
// In App.tsx
function App() {
  return (
    <AnnouncementProvider>  {/* Broadcasting starts here */}
      <AppContent />
    </AnnouncementProvider>
  );
}
```

**Mental Model:** The Provider creates a "broadcast zone" - any component inside can tune in.

---

### Step 2: Consume the Context (Anywhere Inside)

```typescript
// In AppContent.tsx or any nested component
const AppContent: React.FC = () => {
  const { announcementDismissed } = useAnnouncement(); // Tune in!
  
  return (
    <LanguageWrapper startLanguageTimer={announcementDismissed}>
      {/* Use the data */}
    </LanguageWrapper>
  );
};
```

**Key Points:**
- No need to pass props through intermediate components
- Direct access to the data
- Automatically re-renders when context value changes

---

## 🔄 The Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ App (Root)                                              │
│ └─ <AnnouncementProvider>  ← STATE LIVES HERE          │
│       ├─ value: {announcements, loading, ...}          │
│       ├─ useEffect: Subscribe to Firebase              │
│       └─ handleDismiss: Update state                   │
│                                                         │
│    ┌────────────────────────────────────────┐          │
│    │ Children (Can access context)          │          │
│    │                                        │          │
│    │  AppContent                            │          │
│    │    ├─ useAnnouncement() ← CONSUMES    │          │
│    │    └─ LanguageWrapper                 │          │
│    │         └─ AuthProvider                │          │
│    │              └─ Router                 │          │
│    │                   └─ Routes            │          │
│    │                        └─ HomePage     │          │
│    │                             └─ can use │          │
│    │                           useAnnouncement()       │          │
│    └────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 When to Use Context

### ✅ Good Use Cases:
1. **Theme data** (dark/light mode)
2. **Authentication** (user info, login/logout)
3. **Language/i18n** (current language, translations)
4. **UI State** (modals, notifications, announcements)
5. **App-wide settings** (preferences, feature flags)

### ❌ Avoid Context For:
1. **Frequent updates** (every keystroke) → Use local state
2. **Unrelated data** → Use multiple contexts
3. **Props only 1-2 levels deep** → Just pass props
4. **Complex state logic** → Consider Redux/Zustand

---

## 🧪 Step-by-Step: Create Your Own Context

### Example: Theme Context

```typescript
// 1. DEFINE THE INTERFACE
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. CREATE THE CONTEXT
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. BUILD THE PROVIDER
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. CREATE THE HOOK
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 5. WRAP YOUR APP
function App() {
  return (
    <ThemeProvider>
      <MyComponents />
    </ThemeProvider>
  );
}

// 6. USE IT ANYWHERE
function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className={theme}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

---

## 🔍 Common Patterns in Your Code

### Pattern 1: Context + Firebase Real-time Updates
```typescript
useEffect(() => {
  const unsubscribe = announcementService.subscribeToActiveAnnouncements(
    (activeAnnouncements) => {
      setAnnouncements(activeAnnouncements); // Update context state
    }
  );
  return () => unsubscribe(); // Cleanup
}, [user]);
```

**Mental Model:** The Provider listens to Firebase and automatically broadcasts updates to all consumers.

---

### Pattern 2: Conditional State Management
```typescript
const [announcementDismissed, setAnnouncementDismissed] = useState(false);

// In dismiss handler:
setAnnouncementDismissed(true); // Signal to other components
```

**Mental Model:** Context can manage **cross-component coordination** without tight coupling.

---

### Pattern 3: Multiple Providers (Composition)
```typescript
function App() {
  return (
    <AnnouncementProvider>
      <LanguageWrapper>
        <AuthProvider>
          <Router>
            {/* Your app */}
          </Router>
        </AuthProvider>
      </LanguageWrapper>
    </AnnouncementProvider>
  );
}
```

**Mental Model:** Each Provider handles **one concern** - separation of concerns at the architecture level.

---

## 🐛 Common Mistakes & Solutions

### Mistake 1: Using Context Outside Provider
```typescript
// ❌ ERROR: Component not wrapped in Provider
function MyComponent() {
  const { data } = useAnnouncement(); // Error!
}
```
**Solution:** Ensure component is inside `<AnnouncementProvider>`

---

### Mistake 2: Creating New Objects in Value
```typescript
// ❌ BAD: Creates new object every render → All consumers re-render
<Context.Provider value={{ data, setData }}>

// ✅ GOOD: Use useMemo for object/array values
const value = useMemo(() => ({ data, setData }), [data]);
<Context.Provider value={value}>
```

---

### Mistake 3: Too Much Data in One Context
```typescript
// ❌ BAD: Mixing unrelated concerns
interface AppContextType {
  user: User;
  theme: Theme;
  announcements: Announcement[];
  products: Product[];
}

// ✅ GOOD: Separate contexts
<UserProvider>
  <ThemeProvider>
    <AnnouncementProvider>
      <ProductProvider>
```

---

## 📊 Performance Considerations

### When Context Updates:
1. Provider re-renders
2. **ALL consumers re-render** (even if they only use part of the value)

### Optimization Strategies:

1. **Split contexts by update frequency:**
```typescript
// Fast changing data
<AuthProvider>
  {/* Slow changing data */}
  <SettingsProvider>
```

2. **Use memo for expensive computations:**
```typescript
const value = useMemo(() => ({
  announcements,
  loading,
  handleDismiss
}), [announcements, loading]); // Only recreate when these change
```

3. **Selective consumption:**
```typescript
// Only re-renders when 'loading' changes
const { loading } = useAnnouncement();
```

---

## 🎯 Summary: The Complete Mental Model

```
┌──────────────────────────────────────────────────────────┐
│                  REACT CONTEXT                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. CREATE CONTEXT (The Channel)                         │
│     const MyContext = createContext<Type | undefined>() │
│                                                          │
│  2. PROVIDER (The Transmitter)                           │
│     - Holds STATE                                        │
│     - Contains LOGIC                                     │
│     - Wraps CHILDREN                                     │
│     - Broadcasts VALUE                                   │
│                                                          │
│  3. HOOK (The Receiver)                                  │
│     - Tunes into context                                 │
│     - Validates usage                                    │
│     - Returns value                                      │
│                                                          │
│  4. USAGE                                                │
│     - Wrap app with Provider                             │
│     - Call hook in any child component                   │
│     - Access data without prop drilling                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Experiment:** Create a simple context (e.g., counter, theme)
2. **Refactor:** Identify prop drilling in your app → Replace with context
3. **Optimize:** Add `useMemo` to prevent unnecessary re-renders
4. **Pattern:** Follow the established pattern in your codebase

---

## 📚 Reference: Your Code Structure

```
src/features/announcements/
  ├── contexts/
  │   └── AnnouncementContext.tsx  ← Complete context implementation
  ├── components/
  │   ├── FlashAnnouncement.tsx    ← Consumer example
  │   └── AdminAnnouncementManager.tsx
  ├── services/
  │   └── announcement.service.ts  ← Business logic
  └── index.ts                     ← Public exports
```

**Key Takeaway:** Context handles STATE SHARING, Services handle BUSINESS LOGIC. Keep them separated!

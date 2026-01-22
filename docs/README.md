# MapleKids Documentation

Welcome to the MapleKids Pre-School Management System documentation!

## 🚀 Start Here

**New to the project?** Start with the **[Architecture Diagram](architecture/ARCHITECTURE_DIAGRAM.md)** to understand the complete system architecture.

## 📚 Documentation Overview

This documentation is organized into three main categories:

### 1. Architecture & Design 🏛️
**Location**: `/docs/architecture/`

Essential reading for understanding the system:
- **[ARCHITECTURE_DIAGRAM.md](architecture/ARCHITECTURE_DIAGRAM.md)** ⭐ **START HERE**
  - Complete system architecture
  - Visual diagrams
  - Data flow patterns
  - Component relationships
  
- [ARCHITECTURE_ANALYSIS.md](architecture/ARCHITECTURE_ANALYSIS.md) - Initial codebase analysis
- [ARCHITECTURE_IMPROVEMENT_SUMMARY.md](architecture/ARCHITECTURE_IMPROVEMENT_SUMMARY.md) - Improvements made
- [IMPLEMENTATION_GUIDE.md](architecture/IMPLEMENTATION_GUIDE.md) - Development guidelines

### 2. Setup & Configuration 🔧
**Location**: `/docs/firebase/`

Get your development environment running:
- [FIREBASE_SETUP.md](firebase/FIREBASE_SETUP.md) - Complete Firebase setup
- [FIREBASE_INTEGRATION_SUMMARY.md](firebase/FIREBASE_INTEGRATION_SUMMARY.md) - Integration details
- [firestore-rules-update.md](firebase/firestore-rules-update.md) - Security rules

### 3. Operational Guides 📖
**Location**: `/docs/guides/`

Day-to-day development references:
- [QUICK_REFERENCE.md](guides/QUICK_REFERENCE.md) - Common tasks
- [QUICK_FIX.md](guides/QUICK_FIX.md) - Troubleshooting
- [LANGUAGE_POPUP_CONFIG.md](guides/LANGUAGE_POPUP_CONFIG.md) - i18n configuration
- [STUDENT_SYNC_VERIFICATION.md](guides/STUDENT_SYNC_VERIFICATION.md) - Data sync
- [ASSESSMENT_TESTING.md](guides/ASSESSMENT_TESTING.md) - Testing
- [ICON_REPLACEMENT_GUIDE.md](guides/ICON_REPLACEMENT_GUIDE.md) - Icon system

## 🎯 Quick Navigation

### I want to...

**...understand the system**  
→ [Architecture Diagram](architecture/ARCHITECTURE_DIAGRAM.md)

**...add a new feature**  
→ [Implementation Guide](architecture/IMPLEMENTATION_GUIDE.md)

**...fix a bug**  
→ [Quick Fix Guide](guides/QUICK_FIX.md)

**...setup my environment**  
→ [Firebase Setup](firebase/FIREBASE_SETUP.md)

**...understand authentication**  
→ [Architecture Diagram - Auth Section](architecture/ARCHITECTURE_DIAGRAM.md#-authentication-architecture)

**...understand data flow**  
→ [Architecture Diagram - Data Flow](architecture/ARCHITECTURE_DIAGRAM.md#-data-flow-architecture)

## 📊 Project Status

✅ **Production Ready**
- 100% component migration complete (35/35 components)
- 0 TypeScript errors
- Centralized authentication via useAuth hook
- Consistent data management patterns
- Type-safe throughout

## 🏗️ Architecture Quick Overview

```
React Components (UI Layer)
    ↓
Custom Hooks (State & Logic)
    ↓
Firebase Services (Data Access)
    ↓
Firebase Backend (Auth, Firestore, Storage)
```

**Key Hooks**:
- `useAuth` - Authentication (6 methods)
- `useStudents` - Student management
- `useEvents` - Event management
- `useFinancialRecords` - Financial tracking
- `useAttendance` - Attendance tracking
- `useDashboardData` - Dashboard data
- `useForm` - Form state management

## 🚀 Technology Stack

- **Frontend**: React 19.1.1 + TypeScript 5.0.0
- **Backend**: Firebase 12.2.1 (Auth, Firestore, Storage, Functions)
- **Routing**: React Router v6
- **i18n**: react-i18next

## 📝 Documentation Index

For a complete overview of all documentation, see **[INDEX.md](INDEX.md)**.

## ✅ Getting Started Checklist

### For New Developers
- [ ] Read [Architecture Diagram](architecture/ARCHITECTURE_DIAGRAM.md)
- [ ] Review [Implementation Guide](architecture/IMPLEMENTATION_GUIDE.md)
- [ ] Setup Firebase using [Firebase Setup](firebase/FIREBASE_SETUP.md)
- [ ] Explore the codebase starting with `/src/hooks/`

### For Feature Development
- [ ] Understand the architecture pattern
- [ ] Find similar existing feature
- [ ] Use existing hooks as templates
- [ ] Maintain TypeScript type safety
- [ ] Follow the hook pattern (Component → Hook → Service)

### For Bug Fixing
- [ ] Check [Quick Fix Guide](guides/QUICK_FIX.md)
- [ ] Review error in browser console
- [ ] Trace data flow using [Architecture Diagram](architecture/ARCHITECTURE_DIAGRAM.md)
- [ ] Check Firebase console for backend issues

## 💡 Pro Tips

1. **Always start with the Architecture Diagram** - It shows you how everything connects
2. **Use existing hooks** - Don't reinvent the wheel, follow existing patterns
3. **TypeScript is your friend** - Let it guide you to correct implementations
4. **Check the guides** - Most common issues are already documented

## 🔗 Useful Links

- **Main Documentation Index**: [INDEX.md](INDEX.md)
- **Architecture Diagram**: [ARCHITECTURE_DIAGRAM.md](architecture/ARCHITECTURE_DIAGRAM.md)
- **Implementation Guide**: [IMPLEMENTATION_GUIDE.md](architecture/IMPLEMENTATION_GUIDE.md)

---

**Last Updated**: January 22, 2026  
**Status**: ✅ Production Ready

# 📊 Visual Folder Structure

## Overview Diagram

```
src/
│
├── 🚀 app/                          # Application Entry & Root
│   ├── App.tsx                      # Main App component with routing
│   ├── App.css                      # App-level styles
│   └── App.test.tsx                 # App tests
│
├── 🎯 features/                     # FEATURE-BASED MODULES
│   │
│   ├── 🔐 auth/                     # Authentication & Authorization
│   │   ├── components/
│   │   │   ├── SigninForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── AuthContext.tsx          # Auth context provider
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 📢 announcements/            # Announcements System
│   │   ├── components/
│   │   │   ├── AdminAnnouncementManager.tsx
│   │   │   └── FlashAnnouncement.tsx
│   │   ├── contexts/
│   │   │   └── AnnouncementContext.tsx
│   │   ├── services/
│   │   │   └── announcementService.ts
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 📅 attendance/               # Attendance Management
│   │   ├── components/
│   │   │   ├── AttendanceOverview.tsx
│   │   │   └── BulkAttendanceForm.tsx
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 📊 reports/                  # Academic Reports
│   │   ├── components/
│   │   │   ├── AcademicReportsManager.tsx
│   │   │   └── RemarksManager.tsx
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 👨‍🎓 students/                  # Student Management
│   │   ├── components/
│   │   │   ├── UserCreationModal.tsx
│   │   │   ├── BulkUserCreationModal.tsx
│   │   │   └── ExcelBulkUserCreationModal.tsx
│   │   ├── forms/
│   │   │   ├── EditStudentForm.tsx
│   │   │   └── EditUserForm.tsx
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 🎉 events/                   # Events & Photos
│   │   ├── components/
│   │   │   └── AddEventForm.tsx
│   │   ├── forms/
│   │   │   ├── EditEventForm.tsx
│   │   │   └── AddPhotoForm.tsx
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 💰 financial/                # Financial Records
│   │   ├── components/
│   │   │   └── AddFinancialRecordForm.tsx
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 📚 parent-guide/             # Parent Guide Content
│   │   ├── components/
│   │   │   ├── ParentGuidePage.tsx
│   │   │   └── IndianParentGuide.tsx
│   │   ├── content/
│   │   │   ├── IndianParentGuideContent.ts
│   │   │   └── IndianParentGuideContentLocalized.ts
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 🍼 childcare/                # Childcare Center
│   │   ├── components/
│   │   │   └── ChildCareCenter.tsx
│   │   ├── __tests__/
│   │   │   └── ChildCareCenter.test.tsx
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   ├── 📱 dashboards/               # Dashboard Views
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   └── GuestDashboard.tsx
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   └── 💬 enquiry/                  # Enquiry Forms
│       ├── components/
│       │   └── WhatsAppEnquiryForm.tsx
│       └── index.ts                 # ✨ Barrel export
│
├── 📄 pages/                        # PAGE COMPONENTS
│   ├── HomePage.tsx
│   ├── HomePage.css
│   └── index.ts                     # ✨ Barrel export
│
├── 🧩 components/                   # REUSABLE COMPONENTS
│   │
│   ├── common/                      # Generic UI Components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Carousel.tsx
│   │   ├── FormField.tsx
│   │   ├── Header.tsx
│   │   ├── Logo.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── index.ts                 # ✨ Barrel export
│   │
│   └── layout/                      # Layout Components
│       ├── LanguageWrapper.tsx
│       ├── LanguageSelectionPopup.tsx
│       └── index.ts                 # ✨ Barrel export
│
├── 🎨 assets/                       # STATIC ASSETS
│   └── images, fonts, etc.
│
├── ⚙️ constants/                    # CONFIGURATION
│   └── languagePopup.ts
│
├── 🔧 utils/                        # UTILITY FUNCTIONS
│   ├── assessmentScoring.ts
│   └── __tests__/
│       └── assessmentScoring.test.ts
│
├── 🪝 hooks/                        # CUSTOM REACT HOOKS
│   └── (ready for custom hooks)
│
├── 📝 types/                        # TYPESCRIPT TYPES
│   └── (ready for type definitions)
│
├── 💅 styles/                       # GLOBAL STYLES
│   ├── Forms.css
│   └── Dashboard.css
│
├── 🌍 i18n/                         # INTERNATIONALIZATION
│   ├── index.ts
│   └── locales/
│
├── 🔥 firebase/                     # FIREBASE CONFIG
│   ├── config.ts
│   ├── services.ts
│   └── demo.ts
│
├── 🧪 __tests__/                    # GLOBAL TESTS
│   ├── AssessmentIntegration.test.tsx
│   └── AssessmentScoring.test.tsx
│
└── 📋 Root Files
    ├── index.tsx                    # App entry point
    ├── index.css                    # Global styles
    ├── setupTests.ts                # Test configuration
    └── reportWebVitals.ts           # Performance monitoring
```

## Import Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         index.tsx                            │
│                    (Application Entry)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├── i18n/index.ts (Internationalization)
                  │
                  └── app/App.tsx
                      │
                      ├── features/auth
                      │   └── AuthContext (wraps entire app)
                      │
                      ├── features/announcements
                      │   └── AnnouncementContext
                      │
                      ├── components/layout
                      │   └── LanguageWrapper
                      │
                      ├── React Router
                      │   │
                      │   ├── pages/HomePage
                      │   ├── features/parent-guide/ParentGuidePage
                      │   ├── features/childcare/ChildCareCenter
                      │   │
                      │   └── Protected Routes
                      │       ├── features/dashboards/AdminDashboard
                      │       ├── features/dashboards/TeacherDashboard
                      │       ├── features/dashboards/StudentDashboard
                      │       ├── features/students/* (forms & modals)
                      │       ├── features/events/* (forms)
                      │       ├── features/financial/*
                      │       ├── features/attendance/*
                      │       └── features/reports/*
                      │
                      └── components/common
                          └── Button, Modal, Table, etc.
```

## Feature Module Structure Pattern

Each feature follows this pattern:

```
features/[feature-name]/
│
├── components/              # Feature-specific components
│   ├── Component1.tsx
│   ├── Component1.css
│   ├── Component2.tsx
│   └── Component2.css
│
├── forms/                   # Feature-specific forms (optional)
│   └── EditForm.tsx
│
├── hooks/                   # Feature-specific hooks (optional)
│   └── useFeature.ts
│
├── services/                # Feature-specific API calls (optional)
│   └── featureService.ts
│
├── contexts/                # Feature-specific contexts (optional)
│   └── FeatureContext.tsx
│
├── utils/                   # Feature-specific utilities (optional)
│   └── helpers.ts
│
├── types/                   # Feature-specific types (optional)
│   └── types.ts
│
├── __tests__/              # Feature-specific tests
│   └── Component.test.tsx
│
└── index.ts                # Barrel export - exports all public API
```

## Data Flow

```
┌──────────────┐
│   Firebase   │
└──────┬───────┘
       │
       ├─→ firebase/config.ts
       │
       └─→ features/*/services/*.ts
           │
           ├─→ features/*/contexts/*Context.tsx (State Management)
           │   │
           │   └─→ features/*/components/*.tsx (UI Components)
           │       │
           │       └─→ components/common/*.tsx (Reusable UI)
           │
           └─→ Direct component usage
```

## Dependency Hierarchy

```
Level 1: Core
├── firebase/
├── i18n/
├── constants/
└── utils/

Level 2: Shared
├── components/common/
├── components/layout/
├── hooks/
└── types/

Level 3: Features
└── features/*/
    (Can use Level 1 & 2, should not cross-depend on other features)

Level 4: Pages
└── pages/
    (Can use all levels below)

Level 5: App
└── app/
    (Orchestrates everything)
```

## Barrel Export Pattern

```typescript
// features/auth/index.ts
export { default as SigninForm } from './components/SigninForm';
export { default as SignupForm } from './components/SignupForm';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { AuthProvider, useAuth } from './AuthContext';

// Usage in other files
import { SigninForm, SignupForm, AuthProvider } from '../features/auth';
```

## Color Code Legend

- 🚀 Application Entry
- 🎯 Features (Business Logic)
- 📄 Pages (Route Components)
- 🧩 Reusable Components
- 🎨 Static Assets
- ⚙️ Configuration
- 🔧 Utilities
- 🪝 Custom Hooks
- 📝 Type Definitions
- 💅 Styles
- 🌍 Internationalization
- 🔥 Firebase
- 🧪 Tests

---

**Visual Guide Version**: 1.0.0  
**Last Updated**: December 17, 2025

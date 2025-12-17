# 📁 Folder Structure Guide

## Overview
This document explains the new organized folder structure following React best practices and feature-based architecture.

## 🏗️ Directory Structure

```
src/
├── app/                          # Application Root
│   ├── App.tsx                   # Main App component
│   ├── App.css                   # App styles
│   └── App.test.tsx             # App tests
│
├── features/                     # Feature-based modules
│   ├── auth/                    # Authentication feature
│   │   ├── components/
│   │   │   ├── SigninForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── AuthContext.tsx
│   │   └── index.ts             # Barrel export
│   │
│   ├── announcements/           # Announcements feature
│   │   ├── components/
│   │   │   ├── AdminAnnouncementManager.tsx
│   │   │   └── FlashAnnouncement.tsx
│   │   ├── contexts/
│   │   │   └── AnnouncementContext.tsx
│   │   ├── services/
│   │   │   └── announcementService.ts
│   │   └── index.ts
│   │
│   ├── attendance/              # Attendance management
│   │   ├── components/
│   │   │   ├── AttendanceOverview.tsx
│   │   │   └── BulkAttendanceForm.tsx
│   │   └── index.ts
│   │
│   ├── reports/                 # Academic reports & remarks
│   │   ├── components/
│   │   │   ├── AcademicReportsManager.tsx
│   │   │   └── RemarksManager.tsx
│   │   └── index.ts
│   │
│   ├── students/                # Student management
│   │   ├── components/
│   │   │   ├── UserCreationModal.tsx
│   │   │   ├── BulkUserCreationModal.tsx
│   │   │   └── ExcelBulkUserCreationModal.tsx
│   │   ├── forms/
│   │   │   ├── EditStudentForm.tsx
│   │   │   └── EditUserForm.tsx
│   │   └── index.ts
│   │
│   ├── events/                  # Event management
│   │   ├── components/
│   │   │   └── AddEventForm.tsx
│   │   ├── forms/
│   │   │   ├── EditEventForm.tsx
│   │   │   └── AddPhotoForm.tsx
│   │   └── index.ts
│   │
│   ├── financial/               # Financial records
│   │   ├── components/
│   │   │   └── AddFinancialRecordForm.tsx
│   │   └── index.ts
│   │
│   ├── parent-guide/            # Parent guide content
│   │   ├── components/
│   │   │   ├── ParentGuidePage.tsx
│   │   │   └── IndianParentGuide.tsx
│   │   ├── content/
│   │   │   ├── IndianParentGuideContent.ts
│   │   │   └── IndianParentGuideContentLocalized.ts
│   │   └── index.ts
│   │
│   ├── childcare/               # Childcare center
│   │   ├── components/
│   │   │   └── ChildCareCenter.tsx
│   │   ├── __tests__/
│   │   │   └── ChildCareCenter.test.tsx
│   │   └── index.ts
│   │
│   ├── dashboards/              # Dashboard views
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   └── GuestDashboard.tsx
│   │   └── index.ts
│   │
│   └── enquiry/                 # Enquiry forms
│       ├── components/
│       │   └── WhatsAppEnquiryForm.tsx
│       └── index.ts
│
├── pages/                       # Page-level components
│   ├── HomePage.tsx
│   ├── HomePage.css
│   └── index.ts
│
├── components/                  # Reusable UI components
│   ├── common/                 # Generic reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Carousel.tsx
│   │   ├── FormField.tsx
│   │   ├── Header.tsx
│   │   ├── Logo.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── index.ts
│   │
│   └── layout/                 # Layout components
│       ├── LanguageWrapper.tsx
│       ├── LanguageSelectionPopup.tsx
│       └── index.ts
│
├── assets/                      # Static assets
│   ├── images/
│   └── ...
│
├── constants/                   # Application constants
│   └── languagePopup.ts
│
├── contexts/                    # Global contexts (if any remain)
│
├── services/                    # Global services
│
├── hooks/                       # Custom React hooks
│
├── utils/                       # Utility functions
│   ├── assessmentScoring.ts
│   └── __tests__/
│
├── types/                       # TypeScript type definitions
│
├── styles/                      # Global styles
│   ├── Forms.css
│   └── Dashboard.css
│
├── i18n/                        # Internationalization
│   ├── index.ts
│   └── locales/
│
├── firebase/                    # Firebase configuration
│   ├── config.ts
│   ├── services.ts
│   └── demo.ts
│
├── __tests__/                   # Global tests
│   ├── AssessmentIntegration.test.tsx
│   └── AssessmentScoring.test.tsx
│
├── index.tsx                    # Application entry point
├── index.css                    # Global styles
├── setupTests.ts               # Test setup
└── reportWebVitals.ts          # Performance monitoring
```

## 🎯 Design Principles

### 1. **Feature-Based Organization**
Each feature is self-contained with its own:
- Components
- Contexts (if needed)
- Services (if needed)
- Forms (if applicable)
- Tests
- Types (if needed)

### 2. **Separation of Concerns**
- **Features**: Business logic and domain-specific components
- **Components**: Reusable UI components (common & layout)
- **Pages**: Top-level route components
- **Services**: API calls and data fetching
- **Utils**: Pure utility functions

### 3. **Barrel Exports (index.ts)**
Each feature folder has an `index.ts` file for clean imports:

```typescript
// Instead of:
import SigninForm from '../features/auth/components/SigninForm';
import SignupForm from '../features/auth/components/SignupForm';

// You can use:
import { SigninForm, SignupForm } from '../features/auth';
```

### 4. **Colocation**
Related files are kept together:
- Components with their CSS files
- Features with their tests
- Content with their components

## 📝 Import Examples

### Before Restructuring:
```typescript
import SigninForm from './components/SigninForm';
import AdminDashboard from './components/dashboards/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
```

### After Restructuring:
```typescript
import { SigninForm, ProtectedRoute } from './features/auth';
import { AdminDashboard } from './features/dashboards';
import { AuthProvider } from './features/auth';
```

## 🔄 Migration Checklist

- [x] Create new folder structure
- [x] Move files to appropriate locations
- [x] Create barrel exports (index.ts)
- [ ] Update import paths in App.tsx
- [ ] Update import paths in all feature components
- [ ] Update import paths in tests
- [ ] Test the application
- [ ] Update path aliases in tsconfig.json (optional)

## 🎨 Best Practices

### 1. **Component Naming**
- Use PascalCase for component files: `UserCreationModal.tsx`
- Use camelCase for utility files: `assessmentScoring.ts`
- Keep component names descriptive

### 2. **File Organization**
```
feature/
├── components/        # UI components
├── hooks/            # Custom hooks
├── services/         # API calls
├── utils/            # Helper functions
├── types/            # TypeScript types
├── constants/        # Feature constants
├── __tests__/        # Tests
└── index.ts          # Barrel export
```

### 3. **Import Order**
```typescript
// 1. External imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal features
import { useAuth } from '../features/auth';

// 3. Components
import { Button, Modal } from '../components/common';

// 4. Utils & constants
import { formatDate } from '../utils';

// 5. Types
import type { User } from '../types';

// 6. Styles
import './styles.css';
```

## 🚀 Benefits

1. **Scalability**: Easy to add new features without cluttering existing structure
2. **Maintainability**: Clear organization makes code easier to understand and maintain
3. **Reusability**: Common components are clearly separated from feature-specific ones
4. **Team Collaboration**: Multiple developers can work on different features without conflicts
5. **Testing**: Tests are located near the code they test
6. **Performance**: Easier to implement code splitting by feature

## 📚 Additional Resources

- [React Folder Structure Best Practices](https://www.robinwieruch.de/react-folder-structure/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)

## 🔧 Recommended Next Steps

1. **Add TypeScript path aliases** in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@features/*": ["features/*"],
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"],
      "@utils/*": ["utils/*"],
      "@hooks/*": ["hooks/*"],
      "@types/*": ["types/*"]
    }
  }
}
```

2. **Create README files** in each feature folder documenting:
   - Purpose of the feature
   - Available components
   - Usage examples

3. **Set up linting rules** to enforce import order and file organization

4. **Document component APIs** using JSDoc or TypeScript interfaces

---

**Last Updated**: December 17, 2025
**Version**: 1.0.0

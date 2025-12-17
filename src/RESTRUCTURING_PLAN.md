# Folder Restructuring Plan

## New Structure Overview

### 1. app/ - Application Root
- App.tsx, App.css, App.test.tsx

### 2. features/ - Feature-based Organization
**features/auth/**
- SigninForm, SignupForm, ProtectedRoute
- AuthContext

**features/announcements/**
- AdminAnnouncementManager, FlashAnnouncement
- AnnouncementContext, announcementService

**features/attendance/**
- AttendanceOverview, BulkAttendanceForm

**features/reports/**
- AcademicReportsManager, RemarksManager

**features/students/**
- UserCreationModal, BulkUserCreationModal, ExcelBulkUserCreationModal
- EditStudentForm

**features/events/**
- AddEventForm, EditEventForm, AddPhotoForm

**features/financial/**
- AddFinancialRecordForm

**features/parent-guide/**
- ParentGuidePage, IndianParentGuide
- IndianParentGuideContent, IndianParentGuideContentLocalized

**features/childcare/**
- ChildCareCenter

**features/dashboards/**
- AdminDashboard, TeacherDashboard, StudentDashboard, UserDashboard, GuestDashboard

**features/enquiry/**
- WhatsAppEnquiryForm

### 3. pages/ - Page Components
- HomePage

### 4. components/ - Reusable Components
**components/common/** (already exists, keep as is)
- Button, Card, Carousel, FormField, Header, Logo, Modal, Table, LanguageToggle

**components/layout/**
- LanguageWrapper, LanguageSelectionPopup

### 5. constants/ - Configuration
- languagePopup.ts (from config/)

### 6. styles/ - Global Styles
- index.css
- Forms.css (shared form styles)
- Dashboard.css (shared dashboard styles)

### 7. Root files stay in src/
- index.tsx
- setupTests.ts
- reportWebVitals.ts
- react-app-env.d.ts
- runAssessmentTests.js

## Migration Benefits
1. ✅ Feature-based organization for better scalability
2. ✅ Clear separation of concerns
3. ✅ Easier to find and maintain related files
4. ✅ Better code reusability
5. ✅ Improved developer experience
6. ✅ Follows React best practices

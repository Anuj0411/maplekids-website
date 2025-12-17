# Import Path Migration Map

This document maps old import paths to new import paths after restructuring.

## App Level Components

| Old Path | New Path |
|----------|----------|
| `'./App'` | `'./app/App'` |
| `'./App.css'` | `'./app/App.css'` |

## Authentication

| Old Path | New Path |
|----------|----------|
| `'./components/SigninForm'` | `'./features/auth'` (named: SigninForm) |
| `'./components/SignupForm'` | `'./features/auth'` (named: SignupForm) |
| `'./components/ProtectedRoute'` | `'./features/auth'` (named: ProtectedRoute) |
| `'./contexts/AuthContext'` | `'./features/auth'` (named: AuthProvider, useAuth) |

## Announcements

| Old Path | New Path |
|----------|----------|
| `'./components/AdminAnnouncementManager'` | `'./features/announcements'` (named: AdminAnnouncementManager) |
| `'./components/FlashAnnouncement'` | `'./features/announcements'` (named: FlashAnnouncement) |
| `'./contexts/AnnouncementContext'` | `'./features/announcements'` (named: AnnouncementProvider, useAnnouncement) |
| `'./services/announcementService'` | `'./features/announcements'` |

## Attendance

| Old Path | New Path |
|----------|----------|
| `'./components/AttendanceOverview'` | `'./features/attendance'` (named: AttendanceOverview) |
| `'./components/BulkAttendanceForm'` | `'./features/attendance'` (named: BulkAttendanceForm) |

## Reports

| Old Path | New Path |
|----------|----------|
| `'./components/AcademicReportsManager'` | `'./features/reports'` (named: AcademicReportsManager) |
| `'./components/RemarksManager'` | `'./features/reports'` (named: RemarksManager) |

## Students

| Old Path | New Path |
|----------|----------|
| `'./components/UserCreationModal'` | `'./features/students'` (named: UserCreationModal) |
| `'./components/BulkUserCreationModal'` | `'./features/students'` (named: BulkUserCreationModal) |
| `'./components/ExcelBulkUserCreationModal'` | `'./features/students'` (named: ExcelBulkUserCreationModal) |
| `'./components/forms/EditStudentForm'` | `'./features/students'` (named: EditStudentForm) |
| `'./components/forms/EditUserForm'` | `'./features/students'` (named: EditUserForm) |

## Events

| Old Path | New Path |
|----------|----------|
| `'./components/AddEventForm'` | `'./features/events'` (named: AddEventForm) |
| `'./components/forms/EditEventForm'` | `'./features/events'` (named: EditEventForm) |
| `'./components/forms/AddPhotoForm'` | `'./features/events'` (named: AddPhotoForm) |

## Financial

| Old Path | New Path |
|----------|----------|
| `'./components/AddFinancialRecordForm'` | `'./features/financial'` (named: AddFinancialRecordForm) |

## Parent Guide

| Old Path | New Path |
|----------|----------|
| `'./components/ParentGuidePage'` | `'./features/parent-guide'` (named: ParentGuidePage) |
| `'./components/IndianParentGuide'` | `'./features/parent-guide'` (named: IndianParentGuide) |
| `'./components/IndianParentGuideContent'` | `'./features/parent-guide'` |
| `'./components/IndianParentGuideContentLocalized'` | `'./features/parent-guide'` |

## Childcare

| Old Path | New Path |
|----------|----------|
| `'./components/ChildCareCenter'` | `'./features/childcare'` (named: ChildCareCenter) |

## Dashboards

| Old Path | New Path |
|----------|----------|
| `'./components/dashboards/AdminDashboard'` | `'./features/dashboards'` (named: AdminDashboard) |
| `'./components/dashboards/TeacherDashboard'` | `'./features/dashboards'` (named: TeacherDashboard) |
| `'./components/dashboards/StudentDashboard'` | `'./features/dashboards'` (named: StudentDashboard) |
| `'./components/dashboards/UserDashboard'` | `'./features/dashboards'` (named: UserDashboard) |
| `'./components/dashboards/GuestDashboard'` | `'./features/dashboards'` (named: GuestDashboard) |

## Enquiry

| Old Path | New Path |
|----------|----------|
| `'./components/WhatsAppEnquiryForm'` | `'./features/enquiry'` (named: WhatsAppEnquiryForm) |

## Pages

| Old Path | New Path |
|----------|----------|
| `'./components/HomePage'` | `'./pages'` (named: HomePage) |

## Layout Components

| Old Path | New Path |
|----------|----------|
| `'./components/LanguageWrapper'` | `'./components/layout'` (named: LanguageWrapper) |
| `'./components/LanguageSelectionPopup'` | `'./components/layout'` (named: LanguageSelectionPopup) |

## Common Components (No change)

| Old Path | New Path |
|----------|----------|
| `'./components/common/Button'` | `'./components/common'` (named: Button) |
| `'./components/common/Card'` | `'./components/common'` (named: Card) |
| `'./components/common/Carousel'` | `'./components/common'` (named: Carousel) |
| `'./components/common/FormField'` | `'./components/common'` (named: FormField) |
| `'./components/common/Header'` | `'./components/common'` (named: Header) |
| `'./components/common/Logo'` | `'./components/common'` (named: Logo) |
| `'./components/common/Modal'` | `'./components/common'` (named: Modal) |
| `'./components/common/Table'` | `'./components/common'` (named: Table) |
| `'./components/common/LanguageToggle'` | `'./components/common'` (named: LanguageToggle) |

## Constants

| Old Path | New Path |
|----------|----------|
| `'./config/languagePopup'` | `'./constants/languagePopup'` |

## Styles

| Old Path | New Path |
|----------|----------|
| `'./components/Forms.css'` | `'./styles/Forms.css'` |
| `'./components/Dashboard.css'` | `'./styles/Dashboard.css'` |

## Example Conversion

### Before:
```typescript
import SigninForm from './components/SigninForm';
import SignupForm from './components/SignupForm';
import { AuthProvider } from './contexts/AuthContext';
import AdminDashboard from './components/dashboards/AdminDashboard';
import HomePage from './components/HomePage';
```

### After:
```typescript
import { SigninForm, SignupForm, AuthProvider } from './features/auth';
import { AdminDashboard } from './features/dashboards';
import { HomePage } from './pages';
```

## Automated Migration (Find & Replace)

You can use these regex patterns for automated migration:

1. Auth imports:
   - Find: `from ['"]\.\/components\/(SigninForm|SignupForm|ProtectedRoute)['"]`
   - Replace: `from './features/auth'`

2. Dashboard imports:
   - Find: `from ['"]\.\/components\/dashboards\/(Admin|Teacher|Student|User|Guest)Dashboard['"]`
   - Replace: `from './features/dashboards'`

3. Context imports:
   - Find: `from ['"]\.\/contexts\/(Auth|Announcement)Context['"]`
   - Replace: Check appropriate feature folder

**Note**: Make sure to update default imports to named imports where applicable.

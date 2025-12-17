#!/bin/bash

echo "🚀 Starting folder restructure..."

# Create new directory structure
echo "📁 Creating new directories..."
mkdir -p app
mkdir -p features/auth/components
mkdir -p features/announcements/components
mkdir -p features/announcements/contexts
mkdir -p features/announcements/services
mkdir -p features/attendance/components
mkdir -p features/reports/components
mkdir -p features/students/components
mkdir -p features/students/forms
mkdir -p features/events/components
mkdir -p features/events/forms
mkdir -p features/financial/components
mkdir -p features/parent-guide/components
mkdir -p features/parent-guide/content
mkdir -p features/childcare/components
mkdir -p features/childcare/__tests__
mkdir -p features/dashboards/components
mkdir -p features/enquiry/components
mkdir -p pages
mkdir -p components/layout
mkdir -p constants
mkdir -p styles
mkdir -p hooks
mkdir -p types
mkdir -p __tests__

echo "📦 Moving files to new structure..."

# Move App files
mv App.tsx app/ 2>/dev/null
mv App.css app/ 2>/dev/null
mv App.test.tsx app/ 2>/dev/null

# Move Auth related
mv components/SigninForm.tsx features/auth/components/ 2>/dev/null
mv components/SigninForm.css features/auth/components/ 2>/dev/null
mv components/SignupForm.tsx features/auth/components/ 2>/dev/null
mv components/SignupForm.css features/auth/components/ 2>/dev/null
mv components/ProtectedRoute.tsx features/auth/components/ 2>/dev/null
mv contexts/AuthContext.tsx features/auth/ 2>/dev/null

# Move Announcements
mv components/AdminAnnouncementManager.tsx features/announcements/components/ 2>/dev/null
mv components/AdminAnnouncementManager.css features/announcements/components/ 2>/dev/null
mv components/FlashAnnouncement.tsx features/announcements/components/ 2>/dev/null
mv components/FlashAnnouncement.css features/announcements/components/ 2>/dev/null
mv contexts/AnnouncementContext.tsx features/announcements/contexts/ 2>/dev/null
mv services/announcementService.ts features/announcements/services/ 2>/dev/null

# Move Attendance
mv components/AttendanceOverview.tsx features/attendance/components/ 2>/dev/null
mv components/AttendanceOverview.css features/attendance/components/ 2>/dev/null
mv components/BulkAttendanceForm.tsx features/attendance/components/ 2>/dev/null
mv components/BulkAttendanceForm.css features/attendance/components/ 2>/dev/null

# Move Reports
mv components/AcademicReportsManager.tsx features/reports/components/ 2>/dev/null
mv components/AcademicReportsManager.css features/reports/components/ 2>/dev/null
mv components/RemarksManager.tsx features/reports/components/ 2>/dev/null
mv components/RemarksManager.css features/reports/components/ 2>/dev/null

# Move Students
mv components/UserCreationModal.tsx features/students/components/ 2>/dev/null
mv components/UserCreationModal.css features/students/components/ 2>/dev/null
mv components/BulkUserCreationModal.tsx features/students/components/ 2>/dev/null
mv components/BulkUserCreationModal.css features/students/components/ 2>/dev/null
mv components/ExcelBulkUserCreationModal.tsx features/students/components/ 2>/dev/null
mv components/ExcelBulkUserCreationModal.css features/students/components/ 2>/dev/null
mv components/forms/EditStudentForm.tsx features/students/forms/ 2>/dev/null

# Move Events
mv components/AddEventForm.tsx features/events/components/ 2>/dev/null
mv components/forms/EditEventForm.tsx features/events/forms/ 2>/dev/null
mv components/forms/AddPhotoForm.tsx features/events/forms/ 2>/dev/null

# Move Financial
mv components/AddFinancialRecordForm.tsx features/financial/components/ 2>/dev/null

# Move Parent Guide
mv components/ParentGuidePage.tsx features/parent-guide/components/ 2>/dev/null
mv components/ParentGuidePage.css features/parent-guide/components/ 2>/dev/null
mv components/IndianParentGuide.tsx features/parent-guide/components/ 2>/dev/null
mv components/IndianParentGuide.css features/parent-guide/components/ 2>/dev/null
mv components/IndianParentGuideContent.ts features/parent-guide/content/ 2>/dev/null
mv components/IndianParentGuideContentLocalized.ts features/parent-guide/content/ 2>/dev/null

# Move Childcare
mv components/ChildCareCenter.tsx features/childcare/components/ 2>/dev/null
mv components/ChildCareCenter.css features/childcare/components/ 2>/dev/null
mv components/__tests__/ChildCareCenter.test.tsx features/childcare/__tests__/ 2>/dev/null

# Move Dashboards
mv components/dashboards features/dashboards/components 2>/dev/null

# Move Enquiry
mv components/WhatsAppEnquiryForm.tsx features/enquiry/components/ 2>/dev/null
mv components/WhatsAppEnquiryForm.css features/enquiry/components/ 2>/dev/null

# Move Pages
mv components/HomePage.tsx pages/ 2>/dev/null
mv components/HomePage.css pages/ 2>/dev/null

# Move Layout components
mv components/LanguageWrapper.tsx components/layout/ 2>/dev/null
mv components/LanguageSelectionPopup.tsx components/layout/ 2>/dev/null
mv components/LanguageSelectionPopup.css components/layout/ 2>/dev/null

# Move shared styles
mv components/Forms.css styles/ 2>/dev/null
mv components/Dashboard.css styles/ 2>/dev/null

# Move constants
mv config/languagePopup.ts constants/ 2>/dev/null

# Move tests
mv components/__tests__/AssessmentIntegration.test.tsx __tests__/ 2>/dev/null
mv components/__tests__/AssessmentScoring.test.tsx __tests__/ 2>/dev/null

# Move User form if exists
mv components/forms/EditUserForm.tsx features/students/forms/ 2>/dev/null

echo "✨ Creating index files for better imports..."

# Create index files for features
cat > features/auth/index.ts << 'AUTHINDEX'
export { default as SigninForm } from './components/SigninForm';
export { default as SignupForm } from './components/SignupForm';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { AuthProvider, useAuth } from './AuthContext';
AUTHINDEX

cat > features/announcements/index.ts << 'ANNINDEX'
export { default as AdminAnnouncementManager } from './components/AdminAnnouncementManager';
export { default as FlashAnnouncement } from './components/FlashAnnouncement';
export { AnnouncementProvider, useAnnouncement } from './contexts/AnnouncementContext';
export * from './services/announcementService';
ANNINDEX

cat > features/attendance/index.ts << 'ATTINDEX'
export { default as AttendanceOverview } from './components/AttendanceOverview';
export { default as BulkAttendanceForm } from './components/BulkAttendanceForm';
ATTINDEX

cat > features/reports/index.ts << 'REPINDEX'
export { default as AcademicReportsManager } from './components/AcademicReportsManager';
export { default as RemarksManager } from './components/RemarksManager';
REPINDEX

cat > features/students/index.ts << 'STUINDEX'
export { default as UserCreationModal } from './components/UserCreationModal';
export { default as BulkUserCreationModal } from './components/BulkUserCreationModal';
export { default as ExcelBulkUserCreationModal } from './components/ExcelBulkUserCreationModal';
export { default as EditStudentForm } from './forms/EditStudentForm';
export { default as EditUserForm } from './forms/EditUserForm';
STUINDEX

cat > features/events/index.ts << 'EVTINDEX'
export { default as AddEventForm } from './components/AddEventForm';
export { default as EditEventForm } from './forms/EditEventForm';
export { default as AddPhotoForm } from './forms/AddPhotoForm';
EVTINDEX

cat > features/financial/index.ts << 'FININDEX'
export { default as AddFinancialRecordForm } from './components/AddFinancialRecordForm';
FININDEX

cat > features/parent-guide/index.ts << 'PARINDEX'
export { default as ParentGuidePage } from './components/ParentGuidePage';
export { default as IndianParentGuide } from './components/IndianParentGuide';
export * from './content/IndianParentGuideContent';
export * from './content/IndianParentGuideContentLocalized';
PARINDEX

cat > features/childcare/index.ts << 'CHILDINDEX'
export { default as ChildCareCenter } from './components/ChildCareCenter';
CHILDINDEX

cat > features/dashboards/index.ts << 'DASHINDEX'
export { default as AdminDashboard } from './components/AdminDashboard';
export { default as TeacherDashboard } from './components/TeacherDashboard';
export { default as StudentDashboard } from './components/StudentDashboard';
export { default as UserDashboard } from './components/UserDashboard';
export { default as GuestDashboard } from './components/GuestDashboard';
DASHINDEX

cat > features/enquiry/index.ts << 'ENQINDEX'
export { default as WhatsAppEnquiryForm } from './components/WhatsAppEnquiryForm';
ENQINDEX

cat > pages/index.ts << 'PAGEINDEX'
export { default as HomePage } from './HomePage';
PAGEINDEX

cat > components/layout/index.ts << 'LAYOUTINDEX'
export { default as LanguageWrapper } from './LanguageWrapper';
export { default as LanguageSelectionPopup } from './LanguageSelectionPopup';
LAYOUTINDEX

echo "🧹 Cleaning up empty directories..."
rmdir config 2>/dev/null
rmdir contexts 2>/dev/null
rmdir services 2>/dev/null
rmdir components/forms 2>/dev/null
rmdir components/__tests__ 2>/dev/null

echo "✅ Restructuring complete!"
echo ""
echo "📊 Summary of changes:"
echo "  • Created feature-based organization"
echo "  • Separated pages from components"
echo "  • Organized layouts separately"
echo "  • Grouped related files together"
echo "  • Created barrel exports (index.ts) for cleaner imports"
echo ""
echo "⚠️  Next steps:"
echo "  1. Update import paths in all files"
echo "  2. Review and test the application"
echo "  3. Update any absolute imports if using path aliases"

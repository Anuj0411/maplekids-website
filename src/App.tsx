import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './i18n'; // Import i18n configuration
import { AuthProvider } from './contexts/AuthContext';
import { AnnouncementProvider, useAnnouncement } from './contexts/AnnouncementContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import LanguageWrapper from './components/LanguageWrapper';

import SigninForm from './components/SigninForm';
import AddFinancialRecordForm from './components/AddFinancialRecordForm';
import AddEventForm from './components/AddEventForm';
import AdminDashboard from './components/dashboards/AdminDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';

import AddPhotoForm from './components/forms/AddPhotoForm';
import EditStudentForm from './components/forms/EditStudentForm';
import EditEventForm from './components/forms/EditEventForm';
import EditUserForm from './components/forms/EditUserForm';
import ParentGuidePage from './components/ParentGuidePage';
import ChildCareCenter from './components/ChildCareCenter';

// Component that uses announcement context and controls language timer
const AppContent: React.FC = () => {
  const { announcementDismissed } = useAnnouncement();
  
  return (
    <LanguageWrapper startLanguageTimer={announcementDismissed}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/parent-guide" element={<ParentGuidePage />} />
            <Route path="/childcare-center" element={<ChildCareCenter />} />

            <Route path="/signin" element={<SigninForm />} />


            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/edit-student/:rollNumber" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <EditStudentForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/add-financial" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AddFinancialRecordForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/add-photo" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AddPhotoForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/add-event" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AddEventForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/edit-event/:eventId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <EditEventForm />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/edit-user/:userId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <EditUserForm />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </LanguageWrapper>
  );
};

function App() {
  return (
    <AnnouncementProvider>
      <AppContent />
    </AnnouncementProvider>
  );
}

export default App;

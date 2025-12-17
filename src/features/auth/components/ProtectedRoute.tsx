import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/signin' 
}) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser || !userData) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && userData.role !== requiredRole) {
    // Redirect based on user role
    switch (userData.role) {
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'teacher':
        return <Navigate to="/teacher-dashboard" replace />;
      case 'student':
        return <Navigate to="/student-dashboard" replace />;
      default:
        return <Navigate to="/student-dashboard" replace />; // Default to student dashboard
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

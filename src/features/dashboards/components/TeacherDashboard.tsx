import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/Dashboard.css';
import { Button } from '@/components/common';
import BulkAttendanceForm from '@/features/attendance/components/BulkAttendanceForm';
import AcademicReportsManager from '@/features/reports/components/AcademicReportsManager';
import RemarksManager from '@/features/reports/components/RemarksManager';
import PasswordResetModal from '@/features/auth/components/PasswordResetModal';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
import { useUserRole } from '@/hooks/auth/useUserRole';
import { useStudents } from '@/hooks/data/useStudents';
import { useAttendance } from '@/hooks/data/useAttendance';

const TeacherDashboard: React.FC = () => {
  // Use custom hooks for auth and data
  const { signOut: authSignOut } = useAuth();
  const { userData: user } = useCurrentUser();
  const { isTeacher } = useUserRole();
  const { students } = useStudents();
  
  // UI state
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'reports' | 'remarks'>('attendance');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();

  // Use attendance hook with date filter only (class filtering is done on students)
  const { 
    attendance, 
    refetch: refetchAttendance
  } = useAttendance({
    filterByDate: selectedDate
  });

  // Check user role on mount and redirect if not teacher
  useEffect(() => {
    console.log('TeacherDashboard: Checking user role...');
    if (user && !isTeacher) {
      console.log('TeacherDashboard: User is not a teacher, redirecting to user dashboard');
      navigate('/user-dashboard');
    }
  }, [user, isTeacher, navigate]);

  // Handle sign out
  const handleSignOut = async () => {
    await authSignOut();
    navigate('/');
  };

  // Format numbers with abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };


  const getAttendanceStatus = (studentId: string) => {
    if (!attendance.length) return '';
    const student = students.find(s => s.id === studentId);
    if (!student) return '';
    const rollNumber = student.rollNumber;
    const record = attendance[0].students.find(
      (s: any) => s.studentId === rollNumber
    );
    return record ? record.status : '';
  };


  const filteredStudents = selectedClass === 'all' 
    ? students 
    : students.filter(s => s.class === selectedClass);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="brand-icon">🏫</span>
          <h1>Maplekids Play School - Teacher</h1>
        </div>
        <div className="nav-user">
          <span>Teacher: {user.firstName} {user.lastName}</span>
          <div className="nav-user-actions">
            <Button 
              onClick={() => setShowPasswordReset(true)} 
              className="btn-secondary"
            >
              🔐 Change Password
            </Button>
            <Button onClick={handleSignOut} className="btn-signout">Sign Out</Button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Teacher Dashboard 👨‍🏫</h2>
          <p>Track student attendance and manage your class records.</p>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            📊 Attendance
          </button>
          <button 
            className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => {
              console.log('TeacherDashboard: Switching to reports tab, selectedClass:', selectedClass);
              setActiveTab('reports');
            }}
          >
            📈 Academic Reports
          </button>
          <button 
            className={`tab-button ${activeTab === 'remarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('remarks')}
          >
            📝 Student Remarks
          </button>
        </div>

        {/* Class Selection */}
        <div className="class-selection">
          <div className="control-group">
            <label htmlFor="class-select">Select Class:</label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => {
                console.log('TeacherDashboard: Class selection changed from', selectedClass, 'to', e.target.value);
                setSelectedClass(e.target.value);
              }}
              className="class-select"
            >
              <option value="all">All Classes</option>
              <option value="play">Play</option>
              <option value="nursery">Nursery</option>
              <option value="lkg">LKG</option>
              <option value="ukg">UKG</option>
              <option value="1st">1st</option>
            </select>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'attendance' && (
          <>
            {/* Attendance Summary */}
            <div className="attendance-summary">
              <div className="summary-card present">
                <h4>Present</h4>
                <p>{formatNumber(filteredStudents.filter(s => s.id && getAttendanceStatus(s.id!) === 'present').length)}</p>
              </div>
              <div className="summary-card absent">
                <h4>Absent</h4>
                <p>{formatNumber(filteredStudents.filter(s => s.id && getAttendanceStatus(s.id!) === 'absent').length)}</p>
              </div>
              <div className="summary-card late">
                <h4>Late</h4>
                <p>{formatNumber(filteredStudents.filter(s => s.id && getAttendanceStatus(s.id!) === 'late').length)}</p>
              </div>
              <div className="summary-card total">
                <h4>Total</h4>
                <p>{formatNumber(filteredStudents.length)}</p>
              </div>
            </div>

            {/* Date Selection for Attendance */}
            <div className="attendance-controls">
              <div className="control-group">
                <label htmlFor="date-select">Select Date:</label>
                <input
                  type="date"
                  id="date-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>

            {/* Bulk Attendance Form */}
            <BulkAttendanceForm
              selectedClass={selectedClass}
              selectedDate={selectedDate}
              onAttendanceSaved={() => {
                // Reload attendance data after saving
                refetchAttendance();
              }}
            />
          </>
        )}

        {activeTab === 'reports' && (
          <>
            {console.log('TeacherDashboard: Rendering AcademicReportsManager with selectedClass:', selectedClass)}
            <AcademicReportsManager selectedClass={selectedClass} />
          </>
        )}

        {activeTab === 'remarks' && (
          <RemarksManager selectedClass={selectedClass} />
        )}
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        userEmail={user?.email || ''}
        mode="self"
      />
    </div>
  );
};

export default TeacherDashboard;
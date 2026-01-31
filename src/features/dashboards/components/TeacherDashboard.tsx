import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/Dashboard.css';
import { Button } from '@/components/common';
import { holidayService } from '@/firebase/services';
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
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
  const [dateError, setDateError] = useState<string>('');
  const navigate = useNavigate();

  // Function to reload holidays
  const reloadHolidays = async () => {
    const currentYear = new Date().getFullYear();
    const dates = await holidayService.getHolidayDatesSet(currentYear);
    setHolidayDates(dates);
  };

  // Use attendance hook with date filter only (class filtering is done on students)
  const { 
    attendance, 
    refetch: refetchAttendance
  } = useAttendance({
    filterByDate: selectedDate
  });

  // Load holidays for the current year
  useEffect(() => {
    const loadHolidays = async () => {
      const currentYear = new Date().getFullYear();
      const dates = await holidayService.getHolidayDatesSet(currentYear);
      setHolidayDates(dates);
    };
    loadHolidays();
    
    // Also reload when window gets focus (in case admin added holidays in another tab)
    const handleFocus = () => {
      loadHolidays();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Helper functions for date validation
  const getMaxAllowedDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinAllowedDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 3);
    return date.toISOString().split('T')[0];
  };

  const isDateAllowed = (dateStr: string): boolean => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Check if date is within last 3 days
    if (date < threeDaysAgo || date > today) {
      return false;
    }

    // Check if it's Sunday (0 = Sunday)
    if (date.getDay() === 0) {
      return false;
    }

    // Check if it's a holiday
    if (holidayDates.has(dateStr)) {
      return false;
    }

    return true;
  };

  const getDateValidationMessage = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    if (date > today) {
      return '⚠️ Cannot mark attendance for future dates';
    }

    if (date < threeDaysAgo) {
      return '⚠️ Can only edit attendance for the last 3 days';
    }

    if (date.getDay() === 0) {
      return '🚫 Cannot mark attendance on Sundays';
    }

    if (holidayDates.has(dateStr)) {
      return '🚫 Cannot mark attendance on holidays';
    }

    return '';
  };

  // Validate date whenever it changes
  useEffect(() => {
    const error = getDateValidationMessage(selectedDate);
    setDateError(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, holidayDates]);

  // Handle date change with validation
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  // Add effect to style the date picker with custom CSS for disabled dates
  useEffect(() => {
    const dateInput = document.getElementById('date-select');
    if (!dateInput) return;

    // Create a custom style for the calendar
    const styleId = 'calendar-disabled-dates-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Generate CSS to show visual hints (this is limited for native date inputs)
    // We'll add a pulsing border when an invalid date is selected
    styleElement.textContent = `
      input[type="date"].date-input-error::-webkit-calendar-picker-indicator {
        filter: invert(27%) sepia(98%) saturate(2476%) hue-rotate(346deg) brightness(94%) contrast(97%);
      }
    `;

    return () => {
      // Cleanup if needed
    };
  }, [holidayDates]);


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

        {/* Class and Date Selection - Side by Side */}
        <div className="filters-container">
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

          {activeTab === 'attendance' && (
            <div className="control-group">
              <label htmlFor="date-select">Select Date:</label>
              <input
                type="date"
                id="date-select"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={getMinAllowedDate()}
                max={getMaxAllowedDate()}
                className={`date-input ${!isDateAllowed(selectedDate) ? 'date-input-error' : ''}`}
                title={dateError || 'Select a date within the last 3 days (excluding Sundays and holidays)'}
              />
              {dateError && (
                <span className="date-error-message">{dateError}</span>
              )}
              
              {/* Show blocked dates info */}
              <div className="blocked-dates-info">
                <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                  🚫 Blocked dates this month: {(() => {
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    const blockedDates = [];
                    
                    // Get Sundays in current month
                    const firstDay = new Date(currentYear, currentMonth, 1);
                    const lastDay = new Date(currentYear, currentMonth + 1, 0);
                    
                    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                      if (d.getDay() === 0) { // Sunday
                        blockedDates.push({
                          date: new Date(d),
                          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' (Sun)'
                        });
                      }
                    }
                    
                    // Add holidays from current month
                    Array.from(holidayDates)
                      .filter(date => {
                        const d = new Date(date + 'T00:00:00');
                        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                      })
                      .forEach(date => {
                        const d = new Date(date + 'T00:00:00');
                        blockedDates.push({
                          date: d,
                          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' (Holiday)'
                        });
                      });
                    
                    // Sort by date and format
                    blockedDates.sort((a, b) => a.date.getTime() - b.date.getTime());
                    return blockedDates.length > 0 
                      ? blockedDates.map(item => item.label).join(', ')
                      : 'None';
                  })()}
                </small>
              </div>
              
              <div className="date-picker-info">
                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  ℹ️ Sundays and holidays are not available
                </small>
              </div>
            </div>
          )}
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

            {/* Bulk Attendance Form */}
            <BulkAttendanceForm
              selectedClass={selectedClass}
              selectedDate={selectedDate}
              isDateDisabled={!isDateAllowed(selectedDate)}
              dateErrorMessage={dateError}
              onAttendanceSaved={() => {
                // Reload attendance data and holidays after saving
                refetchAttendance();
                reloadHolidays();
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
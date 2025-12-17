import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../../styles/Dashboard.css';
import { authService, studentService, attendanceService, Student } from '../../../../firebase/services';
import { Button } from '../../../../components/common';
import BulkAttendanceForm from '../../../attendance/components/BulkAttendanceForm';
import AcademicReportsManager from '../../../reports/components/AcademicReportsManager';
import RemarksManager from '../../../reports/components/RemarksManager';

// Use User type from services.ts
type User = import("../../../../firebase/services").User;

// Use Student from services.ts

// Remove local Attendance interface. Use imported Attendance type from services.ts

const TeacherDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<import("../../../../firebase/services").Attendance[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'reports' | 'remarks'>('attendance');
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from Firebase Auth
    const fetchUser = async () => {
      try {
        console.log('TeacherDashboard: Fetching user data...');
        const userData = await authService.getCurrentUserData();
        if (!userData) {
          console.log('TeacherDashboard: No user data, redirecting to signin');
          navigate('/signin');
          return;
        }
        if (userData.role !== 'teacher') {
          console.log('TeacherDashboard: User is not a teacher, redirecting to user dashboard');
          navigate('/user-dashboard');
          return;
        }
        console.log('TeacherDashboard: User authenticated as teacher:', userData);
        setUser(userData);
        
        // Load students and attendance data
        console.log('TeacherDashboard: Loading students data...');
        const studentsData = await studentService.getAllStudents();
        console.log('TeacherDashboard: Loaded students:', studentsData.length);
        setStudents(studentsData);
        
        // Only load attendance for specific classes, not for 'all'
        if (selectedClass !== 'all') {
          console.log('TeacherDashboard: Loading attendance for class:', selectedClass);
          try {
            const attendanceData = await attendanceService.getAttendanceByClassAndDate(selectedClass, selectedDate);
            console.log('TeacherDashboard: Loaded attendance data:', attendanceData);
            setAttendance(attendanceData ? [attendanceData] : []);
          } catch (attendanceError) {
            console.error('Error loading attendance:', attendanceError);
            setAttendance([]);
          }
        } else {
          console.log('TeacherDashboard: Selected class is "all", setting attendance to empty');
          setAttendance([]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        navigate('/signin');
      }
    };
    fetchUser();
  }, [navigate, selectedClass, selectedDate]);

  const loadAttendanceData = async () => {
    if (selectedClass !== 'all') {
      try {
        const attendanceData = await attendanceService.getAttendanceByClassAndDate(selectedClass, selectedDate);
        setAttendance(attendanceData ? [attendanceData] : []);
      } catch (attendanceError) {
        console.error('Error loading attendance:', attendanceError);
        setAttendance([]);
      }
    } else {
      setAttendance([]);
    }
  };





  // Removed unused loadStudents and loadAttendance functions

  const handleSignOut = async () => {
    await authService.signOut();
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
          <Button onClick={handleSignOut} className="btn-signout">Sign Out</Button>
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
                if (selectedClass !== 'all') {
                  loadAttendanceData();
                }
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
    </div>
  );
};

export default TeacherDashboard;
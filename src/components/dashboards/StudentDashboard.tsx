import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService, attendanceService, Student, Attendance } from '../../firebase/services';
import { Button, Card } from '../common';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './StudentDashboard.css';

interface SubjectResult {
  subject: string;
  marks: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

interface AcademicReport {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  subjects: SubjectResult[];
  term: string;
  createdAt: any;
  createdBy: string;
}

const StudentDashboard: React.FC = () => {
  const { userData, currentUser } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [academicReports, setAcademicReports] = useState<AcademicReport[]>([]);
  const [remarks, setRemarks] = useState<{
    id?: string;
    studentId: string;
    studentName: string;
    class: string;
    subject: string;
    remark: string;
    type: 'positive' | 'negative' | 'neutral';
    date: string;
    createdAt: any;
    createdBy: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Attendance pagination and filtering state
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);
  const [attendanceItemsPerPage] = useState(20);
  
  // Report card expansion state
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  

  const loadAcademicReports = useCallback(async () => {
    if (!student) {
      console.log('StudentDashboard: No student record available for loading reports');
      return;
    }

    try {
      console.log('StudentDashboard: Loading academic reports for studentId:', student.rollNumber);
      const reportsQuery = query(
        collection(db, 'academicReports'),
        where('studentId', '==', student.rollNumber)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      console.log('StudentDashboard: Academic reports query result:', reportsSnapshot.docs.length, 'documents');
      
      const reportsData = reportsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('StudentDashboard: Report data:', data);
        return {
          id: doc.id,
          ...data
        };
      }) as AcademicReport[];
      
      // Sort by createdAt in descending order (newest first)
      reportsData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      });
      
      setAcademicReports(reportsData);
      console.log('StudentDashboard: Set academic reports:', reportsData.length);
    } catch (error) {
      console.error('Error loading academic reports:', error);
    }
  }, [student]);

  const loadRemarks = useCallback(async () => {
    if (!student) {
      console.log('StudentDashboard: No student record available for loading remarks');
      return;
    }

    try {
      console.log('StudentDashboard: Loading remarks for studentId:', student.rollNumber);
      const remarksQuery = query(
        collection(db, 'remarks'),
        where('studentId', '==', student.rollNumber)
      );
      const remarksSnapshot = await getDocs(remarksQuery);
      console.log('StudentDashboard: Remarks query result:', remarksSnapshot.docs.length, 'documents');
      
      const remarksData = remarksSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('StudentDashboard: Remark data:', data);
        return {
          id: doc.id,
          ...data
        } as {
          id: string;
          studentId: string;
          studentName: string;
          class: string;
          subject: string;
          remark: string;
          type: 'positive' | 'negative' | 'neutral';
          date: string;
          createdAt: any;
          createdBy: string;
        };
      });
      
      // Sort by createdAt in descending order (newest first)
      remarksData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      });
      
      setRemarks(remarksData);
      console.log('StudentDashboard: Set remarks:', remarksData.length);
    } catch (error) {
      console.error('Error loading remarks:', error);
    }
  }, [student]);

  useEffect(() => {
    if (userData && userData.role === 'student') {
      loadStudentData();
    }
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'report') {
      console.log('StudentDashboard: Reports tab activated, academicReports.length:', academicReports.length);
      // Reload academic reports when switching to reports tab
      if (student) {
        console.log('StudentDashboard: Reloading academic reports for fresh data');
        loadAcademicReports();
      }
    } else if (activeTab === 'remarks') {
      console.log('StudentDashboard: Remarks tab activated, remarks.length:', remarks.length);
      // Reload remarks when switching to remarks tab
      if (student) {
        console.log('StudentDashboard: Reloading remarks for fresh data');
        loadRemarks();
      }
    }
  }, [activeTab, student, loadAcademicReports, loadRemarks, academicReports.length, remarks.length]);


  const loadStudentData = async () => {
    try {
      setLoading(true);
      console.log('StudentDashboard: Loading student data for user:', currentUser?.uid);
      
      // Find student record by authUid (Firebase Auth UID) or userId (roll number)
      const students = await studentService.getAllStudents();
      console.log('StudentDashboard: Loaded students:', students.length);
      
      const studentRecord = students.find(s => 
        s.authUid === currentUser?.uid || s.userId === currentUser?.uid
      );
      
      console.log('StudentDashboard: Found student record:', studentRecord);
      
      if (studentRecord) {
        setStudent(studentRecord);
        console.log('StudentDashboard: Student roll number:', studentRecord.rollNumber);
        
        // Load attendance data for this student using roll number
        const attendanceData = await attendanceService.getAttendanceByStudent(studentRecord.rollNumber);
        console.log('StudentDashboard: Loaded attendance data:', attendanceData.length, 'records');
        setAttendance(attendanceData);
        
        // Load academic reports for this student
        await loadAcademicReports();
        
        // Load remarks for this student
        await loadRemarks();
      } else {
        console.log('StudentDashboard: No student record found for user:', currentUser?.uid);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };




  const getAttendanceStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => {
      const studentAttendance = a.students.find(s => s.rollNumber === student?.rollNumber);
      return studentAttendance?.status === 'present';
    }).length;
    
    const absentDays = attendance.filter(a => {
      const studentAttendance = a.students.find(s => s.rollNumber === student?.rollNumber);
      return studentAttendance?.status === 'absent';
    }).length;
    
    const lateDays = attendance.filter(a => {
      const studentAttendance = a.students.find(s => s.rollNumber === student?.rollNumber);
      return studentAttendance?.status === 'late';
    }).length;
    
    return { totalDays, presentDays, absentDays, lateDays };
  };

  // Filter and paginate attendance records
  const getFilteredAttendance = () => {
    let filtered = attendance.filter(record => {
      const studentAttendance = record.students.find(s => s.rollNumber === student?.rollNumber);
      const status = studentAttendance?.status || 'unmarked';
      
      // Search filter
      const matchesSearch = attendanceSearchTerm === '' || 
        record.date.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
        (studentAttendance?.remarks || '').toLowerCase().includes(attendanceSearchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = attendanceStatusFilter === 'all' || status === attendanceStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return filtered;
  };

  const getPaginatedAttendance = () => {
    const filtered = getFilteredAttendance();
    const startIndex = (attendanceCurrentPage - 1) * attendanceItemsPerPage;
    const endIndex = startIndex + attendanceItemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getAttendancePaginationInfo = () => {
    const filtered = getFilteredAttendance();
    const totalPages = Math.ceil(filtered.length / attendanceItemsPerPage);
    const startIndex = (attendanceCurrentPage - 1) * attendanceItemsPerPage + 1;
    const endIndex = Math.min(attendanceCurrentPage * attendanceItemsPerPage, filtered.length);
    
    return {
      totalItems: filtered.length,
      totalPages,
      startIndex,
      endIndex,
      currentPage: attendanceCurrentPage
    };
  };

  // Toggle report card expansion
  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="error-container">
        <h2>Student Record Not Found</h2>
        <p>Your student record could not be found. Please contact the administrator.</p>
      </div>
    );
  }

  const stats = getAttendanceStats();
  const attendancePercentage = stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Student Dashboard</h1>
            <div className="student-info">
              <h2>Welcome, {student.firstName} {student.lastName}!</h2>
              <p>Class: {student.class} | Roll Number: {student.rollNumber}</p>
            </div>
          </div>
          <div className="header-right">
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="logout-btn"
            >
              <span className="btn-icon">🚪</span>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          📅 Attendance
        </button>
        <button 
          className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          📋 Report Card
        </button>
        <button 
          className={`tab-button ${activeTab === 'remarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('remarks')}
        >
          💬 Teacher Remarks
        </button>
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="stats-grid">
              <Card className="stat-card">
                <h3>📊 Attendance Overview</h3>
                <div className="stat-value">{attendancePercentage}%</div>
                <p>Overall Attendance</p>
              </Card>
              
              <Card className="stat-card">
                <h3>✅ Present Days</h3>
                <div className="stat-value">{stats.presentDays}</div>
                <p>Out of {stats.totalDays} days</p>
              </Card>
              
              <Card className="stat-card">
                <h3>❌ Absent Days</h3>
                <div className="stat-value">{stats.absentDays}</div>
                <p>Total absences</p>
              </Card>
              
              <Card className="stat-card">
                <h3>⏰ Late Days</h3>
                <div className="stat-value">{stats.lateDays}</div>
                <p>Total late arrivals</p>
              </Card>
            </div>

            <Card className="recent-activity">
              <h3>📈 Recent Activity</h3>
              <div className="activity-list">
                {(() => {
                  const activities: Array<{
                    id: string;
                    type: 'report' | 'remark';
                    date: string;
                    title: string;
                    description: string;
                    icon: string;
                    color: string;
                  }> = [];

                  // Add recent academic reports
                  academicReports.slice(0, 3).forEach((report) => {
                    activities.push({
                      id: `report-${report.id}`,
                      type: 'report',
                      date: new Date(report.createdAt?.toDate?.() || report.createdAt).toLocaleDateString(),
                      title: `📊 ${report.term} Report`,
                      description: `${report.subjects.length} subjects - ${report.term} term`,
                      icon: '📊',
                      color: 'blue'
                    });
                  });

                  // Add recent remarks
                  remarks.slice(0, 2).forEach((remark) => {
                    activities.push({
                      id: `remark-${remark.id}`,
                      type: 'remark',
                      date: new Date(remark.createdAt?.toDate?.() || remark.createdAt).toLocaleDateString(),
                      title: `💬 ${remark.type === 'positive' ? 'Positive' : remark.type === 'negative' ? 'Needs Attention' : 'General'} Remark`,
                      description: remark.remark.length > 50 ? remark.remark.substring(0, 50) + '...' : remark.remark,
                      icon: remark.type === 'positive' ? '✅' : remark.type === 'negative' ? '⚠️' : '💬',
                      color: remark.type === 'positive' ? 'green' : remark.type === 'negative' ? 'red' : 'blue'
                    });
                  });

                  // Sort by date (most recent first)
                  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  // Show only the 5 most recent activities
                  return activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-content">
                        <div className="activity-header">
                          <span className="activity-icon">{activity.icon}</span>
                          <span className="activity-title">{activity.title}</span>
                          <span className="activity-date">{activity.date}</span>
                        </div>
                        <p className="activity-description">{activity.description}</p>
                      </div>
                    </div>
                  ));
                })()}
                
                {academicReports.length === 0 && remarks.length === 0 && (
                  <div className="no-activity">
                    <p>📝 No recent activity to show</p>
                    <p className="sub-text">Academic reports and remarks will appear here</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="tab-content">
            <Card>
              <div className="attendance-header">
                <h3>📅 Attendance History</h3>
                <div className="attendance-summary">
                  <span className="summary-text">
                    Showing {getAttendancePaginationInfo().startIndex}-{getAttendancePaginationInfo().endIndex} of {getAttendancePaginationInfo().totalItems} records
                  </span>
                </div>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="attendance-controls">
                <div className="search-control">
                  <input
                    type="text"
                    placeholder="Search by date or remarks..."
                    value={attendanceSearchTerm}
                    onChange={(e) => {
                      setAttendanceSearchTerm(e.target.value);
                      setAttendanceCurrentPage(1); // Reset to first page when searching
                    }}
                    className="search-input"
                  />
                </div>
                <div className="filter-control">
                  <select
                    value={attendanceStatusFilter}
                    onChange={(e) => {
                      setAttendanceStatusFilter(e.target.value);
                      setAttendanceCurrentPage(1); // Reset to first page when filtering
                    }}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="unmarked">Not Marked</option>
                  </select>
                </div>
              </div>

              <div className="attendance-table">
                <div className="table-header">
                  <span>Date</span>
                  <span>Status</span>
                  <span>Remarks</span>
                </div>
                {getPaginatedAttendance().map((record) => {
                  const studentAttendance = record.students.find(s => s.rollNumber === student.rollNumber);
                  return (
                    <div key={record.id} className="table-row">
                      <span>{record.date}</span>
                      <span className={`status-badge status-${studentAttendance?.status || 'unmarked'}`}>
                        {studentAttendance?.status || 'Not marked'}
                      </span>
                      <span>{studentAttendance?.remarks || '-'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {getAttendancePaginationInfo().totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    onClick={() => setAttendanceCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={attendanceCurrentPage === 1}
                    className="pagination-btn prev-btn"
                  >
                    ← Previous
                  </button>
                  
                  <div className="pagination-info">
                    <span>Page {attendanceCurrentPage} of {getAttendancePaginationInfo().totalPages}</span>
                  </div>
                  
                  <button
                    onClick={() => setAttendanceCurrentPage(prev => Math.min(getAttendancePaginationInfo().totalPages, prev + 1))}
                    disabled={attendanceCurrentPage === getAttendancePaginationInfo().totalPages}
                    className="pagination-btn next-btn"
                  >
                    Next →
                  </button>
                </div>
              )}

              {getAttendancePaginationInfo().totalItems === 0 && (
                <div className="no-data">
                  <p>No attendance records found matching your criteria.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="tab-content">
            <Card>
              <div className="report-header-controls">
                <h3>📋 Academic Report Card</h3>
                <Button
                  variant="secondary"
                  onClick={loadAcademicReports}
                  className="refresh-btn"
                >
                  🔄 Refresh Reports
                </Button>
              </div>
              {academicReports.length === 0 ? (
                <div className="no-data">
                  <p>No academic reports available yet.</p>
                  <p>Your teachers will add your academic reports here once they are created.</p>
                  <p><strong>Debug Info:</strong> Student ID: {student?.rollNumber}, Reports found: {academicReports.length}</p>
                </div>
              ) : (
                <div className="reports-list">
                  {academicReports.map((report, reportIndex) => {
                    // Calculate overall grade for this specific report
                    const totalMarks = report.subjects?.reduce((sum, s) => sum + (s.marks || 0), 0) || 0;
                    const totalMaxMarks = report.subjects?.reduce((sum, s) => sum + (s.maxMarks || 0), 0) || 0;
                    const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
                    
                    // Calculate overall grade based on percentage
                    let overallGrade = 'F';
                    if (percentage >= 90) overallGrade = 'A+';
                    else if (percentage >= 80) overallGrade = 'A';
                    else if (percentage >= 70) overallGrade = 'B+';
                    else if (percentage >= 60) overallGrade = 'B';
                    else if (percentage >= 50) overallGrade = 'C+';
                    else if (percentage >= 40) overallGrade = 'C';

                    const reportId = report.id || `report-${reportIndex}`;
                    const isExpanded = expandedReports.has(reportId);

                    return (
                      <div key={reportId} className="report-card">
                        <div 
                          className="report-header" 
                          onClick={() => toggleReportExpansion(reportId)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="report-header-left">
                            <h4>📋 {report.term} Report</h4>
                            <div className="report-date">
                              {report.createdAt && (
                                <span>
                                  {report.createdAt.toDate ? 
                                    report.createdAt.toDate().toLocaleDateString() : 
                                    new Date(report.createdAt).toLocaleDateString()
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="report-header-right">
                            <div className="report-summary-compact">
                              <div className="summary-item">
                                <span className="summary-label">Grade:</span>
                                <span className={`grade-badge grade-${overallGrade}`}>{overallGrade}</span>
                              </div>
                              <div className="summary-item">
                                <span className="summary-label">Percentage:</span>
                                <span className="summary-value">{Math.round(percentage * 10) / 10}%</span>
                              </div>
                              <div className="summary-item">
                                <span className="summary-label">Marks:</span>
                                <span className="summary-value">{totalMarks}/{totalMaxMarks}</span>
                              </div>
                            </div>
                            <div className="expand-icon">
                              {isExpanded ? '▼' : '▶'}
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="report-details">
                            <div className="subjects-list">
                              <h5 className="subjects-title">Subject-wise Performance</h5>
                              
                              {/* Desktop Table View */}
                              <table className="subjects-table">
                                <thead>
                                  <tr>
                                    <th>Subject</th>
                                    <th>Grade</th>
                                    <th>Marks</th>
                                    <th>Remarks</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {report.subjects?.map((subject, subjectIndex) => (
                                    <tr key={subjectIndex}>
                                      <td className="subject-name">{subject.subject || 'Unknown Subject'}</td>
                                      <td className="subject-grade">
                                        <span className={`grade-badge grade-${subject.grade || 'F'}`}>
                                          {subject.grade || 'F'}
                                        </span>
                                      </td>
                                      <td className="subject-marks">
                                        {subject.marks || 0}/{subject.maxMarks || 0}
                                      </td>
                                      <td className="subject-remarks">
                                        {subject.remarks || '-'}
                                      </td>
                                    </tr>
                                  )) || []}
                                </tbody>
                              </table>
                              
                              {/* Mobile Card View */}
                              <div className="subjects-mobile">
                                {report.subjects?.map((subject, subjectIndex) => (
                                  <div key={subjectIndex} className="subject-mobile-card">
                                    <div className="subject-mobile-header">
                                      <span className="subject-mobile-name">{subject.subject || 'Unknown Subject'}</span>
                                      <span className={`grade-badge grade-${subject.grade || 'F'}`}>
                                        {subject.grade || 'F'}
                                      </span>
                                    </div>
                                    <div className="subject-mobile-details">
                                      <div className="subject-mobile-marks">
                                        <span className="subject-mobile-marks-label">Marks:</span>
                                        <span className="subject-mobile-marks-value">
                                          {subject.marks || 0}/{subject.maxMarks || 0}
                                        </span>
                                      </div>
                                      {subject.remarks && (
                                        <div className="subject-mobile-remarks">
                                          {subject.remarks}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )) || []}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'remarks' && (
          <div className="tab-content">
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>💬 Teacher Remarks & Feedback</h3>
                <Button
                  variant="secondary"
                  onClick={loadRemarks}
                  style={{ padding: '8px 16px' }}
                >
                  🔄 Refresh Remarks
                </Button>
              </div>
              <div className="remarks-list">
                {remarks.length === 0 ? (
                  <div className="no-data">
                    <p>No teacher remarks available yet.</p>
                    <p>Your teachers will add remarks and feedback here once they are created.</p>
                    <p><strong>Debug Info:</strong> Student ID: {student?.rollNumber}, Remarks found: {remarks.length}</p>
                  </div>
                ) : (
                  <div className="remarks-grid">
                    {remarks.map((remark, index) => (
                      <div key={remark.id || index} className={`remark-card remark-${remark.type}`}>
                        <div className="remark-header">
                          <div className="remark-student">
                            <h4>{remark.studentName || 'Unknown Student'}</h4>
                            <span className="remark-subject">{remark.subject || 'General'}</span>
                          </div>
                          <div className="remark-meta">
                            <span className={`remark-type remark-type-${remark.type}`}>
                              {remark.type === 'positive' ? '😊' : remark.type === 'negative' ? '😞' : '😐'} 
                              {remark.type ? remark.type.charAt(0).toUpperCase() + remark.type.slice(1) : 'Neutral'}
                            </span>
                            <span className="remark-date">
                              {remark.date ? new Date(remark.date).toLocaleDateString() : 'No date'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="remark-content">
                          <p>{remark.remark || 'No remark content'}</p>
                        </div>
                        
                        <div className="remark-footer">
                          <small>
                            Created: {remark.createdAt ? 
                              (remark.createdAt.toDate ? 
                                remark.createdAt.toDate().toLocaleDateString() : 
                                new Date(remark.createdAt).toLocaleDateString()
                              ) : 'Unknown date'
                            }
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="tab-content">
            <Card>
              <h3>👤 Student Profile</h3>
              <div className="profile-info">
                <div className="profile-field">
                  <label>Full Name:</label>
                  <span>{student.firstName} {student.lastName}</span>
                </div>
                <div className="profile-field">
                  <label>Email:</label>
                  <span>{student.email}</span>
                </div>
                <div className="profile-field">
                  <label>Phone:</label>
                  <span>{student.phone}</span>
                </div>
                <div className="profile-field">
                  <label>Class:</label>
                  <span>{student.class}</span>
                </div>
                <div className="profile-field">
                  <label>Roll Number:</label>
                  <span>{student.rollNumber}</span>
                </div>
                <div className="profile-field">
                  <label>Address:</label>
                  <span>{student.address}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button, Card } from '@/components/common';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useStudentDashboardData } from '@/hooks/data/useStudentDashboardData';
import PasswordResetModal from '@/features/auth/components/PasswordResetModal';
import StudentOverview from './tabs/StudentOverview';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Use custom hook for student dashboard data
  const {
    student,
    attendance,
    academicReports,
    remarks,
    loading,
    refetchReports,
    refetchRemarks
  } = useStudentDashboardData({
    authUid: currentUser?.uid
  });
  
  // UI state only
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // Attendance pagination and filtering state
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);
  const [attendanceItemsPerPage] = useState(20);
  
  // Report card expansion state
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  
  // Refetch data when tab changes
  useEffect(() => {
    if (activeTab === 'report' && student) {
      console.log('StudentDashboard: Reports tab activated, refreshing data');
      refetchReports();
    } else if (activeTab === 'remarks' && student) {
      console.log('StudentDashboard: Remarks tab activated, refreshing data');
      refetchRemarks();
    }
  }, [activeTab, student, refetchReports, refetchRemarks]);

  // Used in Attendance tab
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              onClick={() => setShowPasswordReset(true)}
              className="password-reset-btn"
            >
              <span className="btn-icon">🔐</span>
              Change Password
            </Button>
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
          <StudentOverview
            student={student}
            attendance={attendance}
            academicReports={academicReports}
            remarks={remarks}
          />
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
                  <span>Marked By</span>
                </div>
                {getPaginatedAttendance().map((record) => {
                  const studentAttendance = record.students.find(s => s.rollNumber === student.rollNumber);
                  
                  // Get audit info
                  let auditInfo = '';
                  if (record.updatedBy) {
                    auditInfo = `Updated by ${record.updatedBy.name}`;
                  } else if (record.markedBy) {
                    auditInfo = `Marked by ${record.markedBy.name}`;
                  }
                  
                  return (
                    <div key={record.id} className="table-row">
                      <span>{record.date}</span>
                      <span className={`status-badge status-${studentAttendance?.status || 'unmarked'}`}>
                        {studentAttendance?.status || 'Not marked'}
                      </span>
                      <span>{studentAttendance?.remarks || '-'}</span>
                      <span className="audit-info-cell">
                        {auditInfo || '-'}
                      </span>
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
                  onClick={refetchReports}
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
                            {(report.createdByInfo || report.updatedByInfo) && (
                              <div className="report-audit-info">
                                {report.updatedByInfo ? (
                                  <span className="audit-text">
                                    Updated by {report.updatedByInfo.userName} ({report.updatedByInfo.userRole})
                                    {report.updatedAt && ` on ${report.updatedAt.toDate ? report.updatedAt.toDate().toLocaleDateString() : new Date(report.updatedAt).toLocaleDateString()}`}
                                  </span>
                                ) : report.createdByInfo && (
                                  <span className="audit-text">
                                    Created by {report.createdByInfo.userName} ({report.createdByInfo.userRole})
                                  </span>
                                )}
                              </div>
                            )}
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
                  onClick={refetchRemarks}
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
                          {(remark.createdByInfo || remark.updatedByInfo) && (
                            <div className="remark-audit-info">
                              {remark.updatedByInfo ? (
                                <small className="audit-text">
                                  Updated by {remark.updatedByInfo.userName} ({remark.updatedByInfo.userRole})
                                  {remark.updatedAt && ` on ${remark.updatedAt.toDate ? remark.updatedAt.toDate().toLocaleDateString() : new Date(remark.updatedAt).toLocaleDateString()}`}
                                </small>
                              ) : remark.createdByInfo && (
                                <small className="audit-text">
                                  Created by {remark.createdByInfo.userName} ({remark.createdByInfo.userRole})
                                </small>
                              )}
                            </div>
                          )}
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

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        userEmail={student?.email || currentUser?.email || ''}
        mode="self"
      />
    </div>
  );
};

export default StudentDashboard;

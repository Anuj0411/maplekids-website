import React, { useState, useEffect } from 'react';
import { authService, studentService, attendanceService, Student } from '../firebase/services';
import { Button } from './common';
import './BulkAttendanceForm.css';

interface BulkAttendanceFormProps {
  selectedClass: string;
  selectedDate: string;
  onAttendanceSaved: () => void;
}

interface StudentAttendance {
  studentId: string;
  rollNumber: string;
  name: string;
  status: 'present' | 'absent' | 'late' | 'unmarked';
  remarks: string;
}

const BulkAttendanceForm: React.FC<BulkAttendanceFormProps> = ({
  selectedClass,
  selectedDate,
  onAttendanceSaved
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load students for the selected class
  useEffect(() => {
    const loadStudents = async () => {
      if (selectedClass === 'all') {
        setStudents([]);
        setStudentAttendance([]);
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        const allStudents = await studentService.getAllStudents();
        const classStudents = allStudents.filter(student => student.class === selectedClass);
        setStudents(classStudents);

        // Initialize attendance data
        const attendanceData: StudentAttendance[] = classStudents.map(student => ({
          studentId: student.rollNumber || '', // Use roll number as studentId
          rollNumber: student.rollNumber || '',
          name: `${student.firstName} ${student.lastName}`,
          status: 'unmarked',
          remarks: ''
        }));

        // Load existing attendance for the date
        try {
          const existingAttendance = await attendanceService.getAttendanceByClassAndDate(selectedClass, selectedDate);
          if (existingAttendance && existingAttendance.students) {
            // Update attendance data with existing records
            attendanceData.forEach(attendance => {
              const existingRecord = existingAttendance.students.find(
                s => s.studentId === attendance.studentId
              );
              if (existingRecord) {
                attendance.status = existingRecord.status;
                attendance.remarks = existingRecord.remarks || '';
              }
            });
          }
        } catch (attendanceError) {
          console.log('No existing attendance found for this date');
        }

        setStudentAttendance(attendanceData);
      } catch (err) {
        console.error('Error loading students:', err);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [selectedClass, selectedDate]);

  const updateStudentStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'unmarked') => {
    setStudentAttendance(prev => 
      prev.map(student => 
        student.studentId === studentId 
          ? { ...student, status }
          : student
      )
    );
  };

  const updateStudentRemarks = (studentId: string, remarks: string) => {
    setStudentAttendance(prev => 
      prev.map(student => 
        student.studentId === studentId 
          ? { ...student, remarks }
          : student
      )
    );
  };

  const bulkSelectAll = (status: 'present' | 'absent' | 'late') => {
    setStudentAttendance(prev => 
      prev.map(student => ({ ...student, status }))
    );
  };

  const saveAttendance = async () => {
    if (selectedClass === 'all') {
      setError('Please select a specific class');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Get current user info
      const currentUser = await authService.getCurrentUserData();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Filter out unmarked students
      const markedStudents = studentAttendance.filter(student => student.status !== 'unmarked');
      
      if (markedStudents.length === 0) {
        setError('Please mark attendance for at least one student');
        setSaving(false);
        return;
      }

      // Prepare attendance data
      const attendanceData = {
        class: selectedClass,
        date: selectedDate,
        students: markedStudents.map(student => ({
          studentId: student.studentId,
          rollNumber: student.rollNumber,
          status: student.status as 'present' | 'absent' | 'late',
          remarks: student.remarks
        })),
        markedBy: {
          userId: currentUser.id,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          email: currentUser.email
        },
        createdAt: new Date().toISOString()
      };

      // Save attendance
      await attendanceService.markAttendance(attendanceData);
      
      setSuccess(`Attendance saved successfully for ${markedStudents.length} students`);
      onAttendanceSaved();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Error saving attendance:', err);
      setError('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#10b981';
      case 'absent': return '#ef4444';
      case 'late': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'late': return '⏰';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="bulk-attendance-loading">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  if (selectedClass === 'all') {
    return (
      <div className="bulk-attendance-placeholder">
        <p>Please select a specific class to mark attendance</p>
      </div>
    );
  }

  return (
    <div className="bulk-attendance-form">
      <div className="attendance-header">
        <h3>📋 Bulk Attendance - {selectedClass.toUpperCase()}</h3>
        <div className="attendance-info">
          <span className="date-info">📅 {new Date(selectedDate).toLocaleDateString()}</span>
          <span className="count-info">👥 {students.length} Students</span>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="success-banner">
          <span className="success-icon">✅</span>
          {success}
        </div>
      )}

      {/* Bulk Actions */}
      <div className="bulk-actions">
        <h4>Quick Actions:</h4>
        <div className="bulk-buttons">
          <Button
            variant="secondary"
            onClick={() => bulkSelectAll('present')}
            className="bulk-btn present"
          >
            ✅ Mark All Present
          </Button>
          <Button
            variant="secondary"
            onClick={() => bulkSelectAll('absent')}
            className="bulk-btn absent"
          >
            ❌ Mark All Absent
          </Button>
          <Button
            variant="secondary"
            onClick={() => bulkSelectAll('late')}
            className="bulk-btn late"
          >
            ⏰ Mark All Late
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {studentAttendance.map((student) => (
              <tr key={student.studentId}>
                <td className="roll-number">{student.rollNumber}</td>
                <td className="student-name">{student.name}</td>
                <td className="status-cell">
                  <div className="status-buttons">
                    <button
                      className={`status-btn present ${student.status === 'present' ? 'active' : ''}`}
                      onClick={() => updateStudentStatus(student.studentId, 'present')}
                    >
                      ✅ Present
                    </button>
                    <button
                      className={`status-btn absent ${student.status === 'absent' ? 'active' : ''}`}
                      onClick={() => updateStudentStatus(student.studentId, 'absent')}
                    >
                      ❌ Absent
                    </button>
                    <button
                      className={`status-btn late ${student.status === 'late' ? 'active' : ''}`}
                      onClick={() => updateStudentStatus(student.studentId, 'late')}
                    >
                      ⏰ Late
                    </button>
                  </div>
                  <div className="current-status">
                    <span 
                      className="status-indicator"
                      style={{ color: getStatusColor(student.status) }}
                    >
                      {getStatusIcon(student.status)} {student.status.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="remarks-cell">
                  <input
                    type="text"
                    placeholder="Add remarks..."
                    value={student.remarks}
                    onChange={(e) => updateStudentRemarks(student.studentId, e.target.value)}
                    className="remarks-input"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary and Save */}
      <div className="attendance-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Present:</span>
            <span className="stat-value present">
              {studentAttendance.filter(s => s.status === 'present').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Absent:</span>
            <span className="stat-value absent">
              {studentAttendance.filter(s => s.status === 'absent').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Late:</span>
            <span className="stat-value late">
              {studentAttendance.filter(s => s.status === 'late').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unmarked:</span>
            <span className="stat-value unmarked">
              {studentAttendance.filter(s => s.status === 'unmarked').length}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={saveAttendance}
          disabled={saving || studentAttendance.filter(s => s.status !== 'unmarked').length === 0}
          className="save-attendance-btn"
        >
          {saving ? (
            <>
              <span className="spinner"></span>
              Saving...
            </>
          ) : (
            <>
              <span className="btn-icon">💾</span>
              Save Attendance ({studentAttendance.filter(s => s.status !== 'unmarked').length} students)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BulkAttendanceForm;

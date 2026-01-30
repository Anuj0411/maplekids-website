import React, { useState, useEffect } from 'react';
import { Button, Card } from '@/components/common';
import { useStudents } from '@/hooks/data/useStudents';
import { useAuth } from '@/features/auth';
import type { Student } from '@/firebase/types';
import { db } from '@/firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import './AcademicReportsManager.css';

interface SubjectResult {
  subject: string;
  marks: number;
  maxMarks: number;
  grade: string;
  remarks: string;
  notApplicable?: boolean; // Flag to mark subject as N/A
}

interface AuditInfo {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  timestamp: any;
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
  createdByInfo?: AuditInfo; // Enhanced audit info
  updatedAt?: any;
  updatedBy?: string;
  updatedByInfo?: AuditInfo; // Enhanced audit info for updates
}

interface AcademicReportsManagerProps {
  selectedClass: string;
  onClose?: () => void;
}

const AcademicReportsManager: React.FC<AcademicReportsManagerProps> = ({ selectedClass, onClose }) => {
  console.log('AcademicReportsManager: Component initialized with selectedClass:', selectedClass);
  
  const { students: allStudents, loading: studentsLoading } = useStudents({ autoFetch: true });
  const { userData } = useAuth(); // Get current logged-in user info
  
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<AcademicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReport, setEditingReport] = useState<AcademicReport | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [formData, setFormData] = useState({
    studentId: '',
    subjects: [] as SubjectResult[],
    term: 'Term 1'
  });

  const subjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'General Knowledge', 'Art & Craft', 'Physical Education', 'Music', 'Computer Science'];
  const terms = ['Term 1', 'Term 2', 'Term 3', 'Final Exam'];

  useEffect(() => {
    loadData();
  }, [selectedClass]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading data for class:', selectedClass);
      
      // Filter students for the selected class (from hook)
      console.log('Filtering students from hook, total students:', allStudents.length);
      
      const classStudents = selectedClass === 'all' 
        ? allStudents 
        : allStudents.filter(s => s.class === selectedClass);
      setStudents(classStudents);
      console.log('Filtered students for class:', classStudents.length);
      console.log('Students available for reports:', classStudents.map(s => ({
        rollNumber: s.rollNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        class: s.class
      })));

      // Load academic reports for the selected class
      if (selectedClass === 'all') {
        console.log('Selected class is "all", setting reports to empty array');
        setReports([]);
      } else {
        console.log('Loading academic reports for class:', selectedClass);
        const reportsQuery = query(collection(db, 'academicReports'), where('class', '==', selectedClass));
        const reportsSnapshot = await getDocs(reportsQuery);
        console.log('Academic reports query result:', reportsSnapshot.docs.length, 'documents');
        
        const reportsData = reportsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Report data:', data);
          
          // Ensure subjects is always an array
          const reportData = {
            id: doc.id,
            ...data,
            subjects: Array.isArray(data.subjects) ? data.subjects : []
          } as AcademicReport;
          
          // Validate the report data structure
          if (!reportData.studentId || !reportData.studentName || !reportData.class) {
            console.warn('AcademicReportsManager: Report missing required fields:', reportData);
          }
          
          return reportData;
        });
        
        setReports(reportsData);
        console.log('Set reports:', reportsData.length);
      }
    } catch (error) {
      console.error('Error loading academic reports:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        selectedClass
      });
      // Show user-friendly error message
      alert(`Error loading data: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'D';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting form with data:', formData);
      console.log('Selected student ID from filter:', selectedStudentId);
      
      // Use selectedStudentId if formData.studentId is empty
      const studentId = formData.studentId || selectedStudentId;
      
      if (!studentId) {
        alert('Please select a student');
        return;
      }
      
      const student = students.find(s => s.rollNumber === studentId);
      if (!student) {
        alert('Student not found');
        return;
      }

      console.log('Found student:', student);

      // Filter out subjects that are marked as Not Applicable or have no marks entered
      const validSubjects = formData.subjects.filter(s => !s.notApplicable && s.marks > 0);
      console.log('Valid subjects (excluding N/A):', validSubjects);
      
      // Keep all subjects in the report but filter for validation
      const allSubjects = formData.subjects;
      
      if (validSubjects.length === 0 && allSubjects.every(s => s.notApplicable)) {
        alert('Please enter marks for at least one subject or mark at least one subject as applicable');
        return;
      }

      // Create audit info with current user details
      const currentAuditInfo: AuditInfo = {
        userId: userData?.id || 'unknown',
        userName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown User',
        userEmail: userData?.email || 'unknown@email.com',
        userRole: userData?.role || 'unknown',
        timestamp: serverTimestamp()
      };

      const reportData: Partial<AcademicReport> = editingReport ? {
        // For updates, keep existing createdBy info and add updated info
        studentId: studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        class: student.class,
        subjects: allSubjects,
        term: formData.term,
        updatedAt: serverTimestamp(),
        updatedBy: userData?.id || 'unknown',
        updatedByInfo: currentAuditInfo
      } : {
        // For new reports, set createdBy info
        studentId: studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        class: student.class,
        subjects: allSubjects,
        term: formData.term,
        createdAt: serverTimestamp(),
        createdBy: userData?.id || 'unknown',
        createdByInfo: currentAuditInfo
      };

      console.log('Report data to save:', reportData);
      console.log('Current user audit info:', currentAuditInfo);
      console.log('Student details:', {
        rollNumber: student.rollNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        class: student.class
      });
      console.log('Resolved student ID:', studentId);
      console.log('Form data studentId:', formData.studentId);
      console.log('Selected filter studentId:', selectedStudentId);

      if (editingReport) {
        // Update existing report
        console.log('Updating existing report:', editingReport.id);
        await updateDoc(doc(db, 'academicReports', editingReport.id!), reportData);
        console.log('Report updated successfully');
      } else {
        // Add new report
        console.log('Adding new report to Firestore');
        const docRef = await addDoc(collection(db, 'academicReports'), reportData);
        console.log('Report added successfully with ID:', docRef.id);
      }

      // Reset form and reload data
      setFormData({
        studentId: '',
        subjects: [],
        term: 'Term 1'
      });
      setShowAddForm(false);
      setEditingReport(null);
      setSelectedStudentId('');
      
      console.log('Reloading data...');
      await loadData();
      console.log('Data reloaded successfully');
      
    } catch (error) {
      console.error('Error saving academic report:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData
      });
      alert(`Error saving academic report: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  const handleEdit = (report: AcademicReport) => {
    setEditingReport(report);
    setFormData({
      studentId: report.studentId,
      subjects: report.subjects,
      term: report.term
    });
    setShowAddForm(true);
  };

  const handleDelete = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this academic report? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'academicReports', reportId));
        loadData(); // Reload the data
        alert('Academic report deleted successfully');
      } catch (error) {
        console.error('Error deleting academic report:', error);
        alert('Error deleting academic report. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingReport(null);
    setSelectedStudentId('');
    setFormData({
      studentId: '',
      subjects: [],
      term: 'Term 1'
    });
  };

  // Test function to verify data consistency
  const testDataConsistency = async () => {
    console.log('=== Testing Data Consistency ===');
    console.log('Available students:', students.map(s => ({ rollNumber: s.rollNumber, name: `${s.firstName} ${s.lastName}` })));
    console.log('Current reports:', reports.map(r => ({ id: r.id, studentId: r.studentId, studentName: r.studentName })));
    
    // Test if we can find a student by roll number
    if (students.length > 0) {
      const testStudent = students[0];
      console.log('Testing with student:', testStudent.rollNumber);
      
      // Try to find reports for this student
      const testQuery = query(collection(db, 'academicReports'), where('studentId', '==', testStudent.rollNumber));
      const testSnapshot = await getDocs(testQuery);
      console.log(`Found ${testSnapshot.docs.length} reports for student ${testStudent.rollNumber}`);
      
      testSnapshot.docs.forEach(doc => {
        console.log('Report data:', doc.data());
      });
    }
    console.log('=== End Data Consistency Test ===');
  };

  // Safety check for selectedClass
  if (!selectedClass) {
    console.error('AcademicReportsManager: selectedClass is undefined or null');
    return (
      <div className="academic-reports-manager">
        <div className="error">Error: No class selected</div>
      </div>
    );
  }

  if (loading || studentsLoading) {
    return (
      <div className="academic-reports-manager">
        <div className="loading">Loading academic reports...</div>
      </div>
    );
  }

  try {
    return (
    <div className="academic-reports-manager">
      <div className="reports-header">
        <h2>📊 Academic Reports Management</h2>
        <div className="header-actions">
          <Button
            variant="primary"
            onClick={() => {
              // When opening the form, pre-fill with selected student if available
              if (selectedStudentId) {
                setFormData({
                  studentId: selectedStudentId,
                  subjects: [],
                  term: 'Term 1'
                });
              }
              setShowAddForm(true);
            }}
            disabled={showAddForm || selectedClass === 'all' || students.length === 0}
          >
            <span className="btn-icon">➕</span>
            Add Report
          </Button>
          <Button
            variant="secondary"
            onClick={testDataConsistency}
            style={{ marginLeft: '10px' }}
          >
            🔍 Test Data
          </Button>
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Student Filter */}
      {selectedClass !== 'all' && students.length > 0 && (
        <div className="student-filter">
          <div className="filter-header">
            <h4>📚 Students in {selectedClass}</h4>
            <p>Filter by specific student or view all students</p>
          </div>
          <div className="filter-controls">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="student-select"
            >
              <option value="">👥 All Students ({students.length})</option>
              {students.map(student => (
                <option key={student.rollNumber} value={student.rollNumber}>
                  {student.rollNumber} - {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {showAddForm && (
        <Card className="add-report-form">
          <div className="form-header">
            <h3>📋 {editingReport ? 'Edit Academic Report' : 'Add New Academic Report'}</h3>
            <p>Create a comprehensive report card with all subjects for the selected student</p>
          </div>
          
          <form onSubmit={handleSubmit} className="report-card-form">
            {/* Student Selection */}
            <div className="form-section">
              <h4>👤 Student Information</h4>
              {/* Only show student selector if no student is filtered */}
              {!selectedStudentId ? (
                <div className="form-group">
                  <label>Select Student</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                    className="student-select-input"
                  >
                    <option value="">Choose a student...</option>
                    {students.map(student => (
                      <option key={student.rollNumber} value={student.rollNumber}>
                        {student.rollNumber} - {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="selected-student-display">
                  <label>Selected Student</label>
                  <div className="student-info-display">
                    <strong>
                      {students.find(s => s.rollNumber === selectedStudentId)?.rollNumber} - {' '}
                      {students.find(s => s.rollNumber === selectedStudentId)?.firstName} {' '}
                      {students.find(s => s.rollNumber === selectedStudentId)?.lastName}
                    </strong>
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Term</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                >
                  {terms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subjects Performance */}
            <div className="form-section">
              <h4>📚 Subjects Performance</h4>
              <p>Enter marks and remarks for each subject</p>
              
              {subjects.map((subject, index) => {
                const subjectData = formData.subjects.find(s => s.subject === subject) || {
                  subject,
                  marks: 0,
                  maxMarks: 100,
                  grade: 'D',
                  remarks: '',
                  notApplicable: false
                };
                
                return (
                  <div key={subject} className={`subject-entry ${subjectData.notApplicable ? 'not-applicable' : ''}`}>
                    <div className="subject-header">
                      <h5>{subject}</h5>
                      <label className="na-checkbox">
                        <input
                          type="checkbox"
                          checked={subjectData.notApplicable || false}
                          onChange={(e) => {
                            const isNA = e.target.checked;
                            const updatedSubjects = formData.subjects.filter(s => s.subject !== subject);
                            updatedSubjects.push({
                              subject,
                              marks: isNA ? 0 : subjectData.marks,
                              maxMarks: subjectData.maxMarks,
                              grade: isNA ? 'N/A' : subjectData.grade,
                              remarks: isNA ? 'Not Applicable' : subjectData.remarks,
                              notApplicable: isNA
                            });
                            setFormData({ ...formData, subjects: updatedSubjects });
                          }}
                        />
                        <span>Not Applicable</span>
                      </label>
                    </div>
                    <div className="subject-inputs">
                      <div className="marks-row">
                        <div className="form-group">
                          <label>Marks Obtained</label>
                          <input
                            type="number"
                            value={subjectData.marks}
                            onChange={(e) => {
                              const marks = parseInt(e.target.value) || 0;
                              const maxMarks = subjectData.maxMarks;
                              const grade = calculateGrade(marks, maxMarks);
                              const updatedSubjects = formData.subjects.filter(s => s.subject !== subject);
                              updatedSubjects.push({
                                subject,
                                marks,
                                maxMarks,
                                grade,
                                remarks: subjectData.remarks,
                                notApplicable: false
                              });
                              setFormData({ ...formData, subjects: updatedSubjects });
                            }}
                            min="0"
                            placeholder="0"
                            disabled={subjectData.notApplicable}
                          />
                        </div>
                        <div className="marks-separator">/</div>
                        <div className="form-group">
                          <label>Max Marks</label>
                          <input
                            type="number"
                            value={subjectData.maxMarks}
                            onChange={(e) => {
                              const maxMarks = parseInt(e.target.value) || 100;
                              const marks = subjectData.marks;
                              const grade = calculateGrade(marks, maxMarks);
                              const updatedSubjects = formData.subjects.filter(s => s.subject !== subject);
                              updatedSubjects.push({
                                subject,
                                marks,
                                maxMarks,
                                grade,
                                remarks: subjectData.remarks,
                                notApplicable: false
                              });
                              setFormData({ ...formData, subjects: updatedSubjects });
                            }}
                            min="1"
                            placeholder="100"
                            disabled={subjectData.notApplicable}
                          />
                        </div>
                        <div className="grade-display">
                          <label>Grade</label>
                          <span className={`grade-badge grade-${subjectData.notApplicable ? 'na' : subjectData.grade}`}>
                            {subjectData.notApplicable ? 'N/A' : subjectData.grade}
                          </span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Remarks for {subject}</label>
                        <textarea
                          value={subjectData.remarks}
                          onChange={(e) => {
                            const updatedSubjects = formData.subjects.filter(s => s.subject !== subject);
                            updatedSubjects.push({
                              ...subjectData,
                              remarks: e.target.value
                            });
                            setFormData({ ...formData, subjects: updatedSubjects });
                          }}
                          placeholder={subjectData.notApplicable ? 'Not Applicable' : `Enter remarks for ${subject}...`}
                          rows={2}
                          className="subject-remarks"
                          disabled={subjectData.notApplicable}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary" className="submit-btn">
                {editingReport ? '✏️ Update Report' : '➕ Add Report'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel} className="cancel-btn">
                ❌ Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="reports-list">
        <h3>
          Academic Reports ({selectedStudentId ? reports.filter(r => r.studentId === selectedStudentId).length : reports.length})
          {selectedStudentId && (
            <span className="filter-info"> - Filtered for selected student</span>
          )}
        </h3>
        {reports.length === 0 ? (
          <div className="no-data">
            {selectedClass === 'all' 
              ? 'Please select a class to view academic reports.' 
              : 'No academic reports found for this class.'}
          </div>
        ) : (
          <div className="reports-grid">
            {(selectedStudentId ? reports.filter(r => r.studentId === selectedStudentId) : reports).map(report => {
              // Safety check for report.subjects
              if (!report.subjects || !Array.isArray(report.subjects)) {
                console.error('AcademicReportsManager: Report has invalid subjects data:', report);
                return (
                  <Card key={report.id} className="report-card error-card">
                    <div className="report-header">
                      <h4>{report.studentName || 'Unknown Student'}</h4>
                    </div>
                    <div className="report-details">
                      <p><strong>Error:</strong> Invalid subjects data</p>
                      <p><strong>Report ID:</strong> {report.id}</p>
                    </div>
                  </Card>
                );
              }

              // Calculate overall grade (excluding N/A subjects)
              const applicableSubjects = report.subjects.filter(s => !s.notApplicable);
              const totalMarks = applicableSubjects.reduce((sum, s) => sum + (s.marks || 0), 0);
              const totalMaxMarks = applicableSubjects.reduce((sum, s) => sum + (s.maxMarks || 0), 0);
              const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
              const overallGrade = totalMaxMarks > 0 ? calculateGrade(totalMarks, totalMaxMarks) : 'N/A';
              
              return (
                <Card key={report.id} className="report-card">
                  <div className="report-header">
                    <h4>{report.studentName}</h4>
                    <div className="overall-grade">
                      <span className={`report-grade grade-${overallGrade.replace('+', '\\+')}`}>{overallGrade}</span>
                      <span className="percentage">({Math.round(overallPercentage)}%)</span>
                    </div>
                  </div>
                  <div className="report-details">
                    <p><strong>Term:</strong> {report.term}</p>
                    <p><strong>Subjects:</strong> {report.subjects.length} ({applicableSubjects.length} applicable)</p>
                  </div>
                  <div className="subjects-summary">
                    <h5>Subject Performance:</h5>
                    <div className="subjects-list">
                      {report.subjects.map((subject, index) => {
                        // Safety check for subject data
                        if (!subject || typeof subject !== 'object') {
                          console.error('AcademicReportsManager: Invalid subject data:', subject);
                          return (
                            <div key={index} className="subject-item error">
                              <span className="subject-name">Invalid Subject Data</span>
                              <span className="subject-grade">-</span>
                              <span className="subject-marks">-/-</span>
                            </div>
                          );
                        }
                        
                        const isNA = subject.notApplicable;
                        
                        return (
                          <div key={index} className={`subject-item ${isNA ? 'na-subject' : ''}`}>
                            <span className="subject-name">{subject.subject || 'Unknown Subject'}</span>
                            <span className={`subject-grade grade-${isNA ? 'na' : (subject.grade || 'F').replace('+', '\\+')}`}>
                              {isNA ? 'N/A' : (subject.grade || 'F')}
                            </span>
                            <span className="subject-marks">
                              {isNA ? 'N/A' : `${subject.marks || 0}/${subject.maxMarks || 0}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="report-actions">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(report)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(report.id!)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
    );
  } catch (error) {
    console.error('AcademicReportsManager: Unexpected error in render:', error);
    return (
      <div className="academic-reports-manager">
        <div className="error">
          <h2>❌ Error</h2>
          <p>An unexpected error occurred: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <p>Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }
};

export default AcademicReportsManager;

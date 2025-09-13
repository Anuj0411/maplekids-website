import React, { useState, useEffect } from 'react';
import { studentService, Student } from '../firebase/services';
import { Button, Card } from './common';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import './AcademicReportsManager.css';

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

interface AcademicReportsManagerProps {
  selectedClass: string;
  onClose?: () => void;
}

const AcademicReportsManager: React.FC<AcademicReportsManagerProps> = ({ selectedClass, onClose }) => {
  console.log('AcademicReportsManager: Component initialized with selectedClass:', selectedClass);
  
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

  const subjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Art & Craft', 'Physical Education', 'Music', 'Computer Science'];
  const terms = ['Term 1', 'Term 2', 'Term 3', 'Final Exam'];

  useEffect(() => {
    loadData();
  }, [selectedClass]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading data for class:', selectedClass);
      
      // Load students for the selected class
      console.log('Loading students...');
      const allStudents = await studentService.getAllStudents();
      console.log('Loaded students:', allStudents.length);
      
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
      
      const student = students.find(s => s.rollNumber === formData.studentId);
      if (!student) {
        alert('Student not found');
        return;
      }

      console.log('Found student:', student);

      // Filter out subjects with no marks entered
      const validSubjects = formData.subjects.filter(s => s.marks > 0);
      console.log('Valid subjects:', validSubjects);
      
      if (validSubjects.length === 0) {
        alert('Please enter marks for at least one subject');
        return;
      }

      const reportData = {
        studentId: formData.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        class: student.class,
        subjects: validSubjects,
        term: formData.term,
        createdAt: serverTimestamp(),
        createdBy: 'teacher' // This should be the actual teacher ID
      };

      console.log('Report data to save:', reportData);
      console.log('Student details:', {
        rollNumber: student.rollNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        class: student.class
      });
      console.log('Form data studentId:', formData.studentId);
      console.log('Are they equal?', formData.studentId === student.rollNumber);

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

  if (loading) {
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
            onClick={() => setShowAddForm(true)}
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
                  grade: 'F',
                  remarks: ''
                };
                
                return (
                  <div key={subject} className="subject-entry">
                    <div className="subject-header">
                      <h5>{subject}</h5>
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
                                remarks: subjectData.remarks
                              });
                              setFormData({ ...formData, subjects: updatedSubjects });
                            }}
                            min="0"
                            placeholder="0"
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
                                remarks: subjectData.remarks
                              });
                              setFormData({ ...formData, subjects: updatedSubjects });
                            }}
                            min="1"
                            placeholder="100"
                          />
                        </div>
                        <div className="grade-display">
                          <label>Grade</label>
                          <span className={`grade-badge grade-${subjectData.grade}`}>
                            {subjectData.grade}
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
                          placeholder={`Enter remarks for ${subject}...`}
                          rows={2}
                          className="subject-remarks"
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

              // Calculate overall grade
              const totalMarks = report.subjects.reduce((sum, s) => sum + (s.marks || 0), 0);
              const totalMaxMarks = report.subjects.reduce((sum, s) => sum + (s.maxMarks || 0), 0);
              const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
              const overallGrade = calculateGrade(totalMarks, totalMaxMarks);
              
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
                    <p><strong>Subjects:</strong> {report.subjects.length}</p>
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
                        
                        return (
                          <div key={index} className="subject-item">
                            <span className="subject-name">{subject.subject || 'Unknown Subject'}</span>
                            <span className={`subject-grade grade-${(subject.grade || 'F').replace('+', '\\+')}`}>
                              {subject.grade || 'F'}
                            </span>
                            <span className="subject-marks">
                              {subject.marks || 0}/{subject.maxMarks || 0}
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

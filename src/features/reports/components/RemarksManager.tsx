import React, { useState, useEffect } from 'react';
import { studentService, Student } from '../../../firebase/services';
import { Button, Card } from '../../../components/common';
import { db } from '../../../firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, deleteDoc } from 'firebase/firestore';
import './RemarksManager.css';

interface Remark {
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
}

interface RemarksManagerProps {
  selectedClass: string;
  onClose?: () => void;
}

const RemarksManager: React.FC<RemarksManagerProps> = ({ selectedClass, onClose }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRemark, setEditingRemark] = useState<Remark | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    remark: '',
    type: 'positive' as 'positive' | 'negative' | 'neutral',
    date: new Date().toISOString().split('T')[0]
  });

  const subjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Art & Craft', 'Physical Education', 'Music', 'Computer Science', 'General'];

  useEffect(() => {
    loadData();
  }, [selectedClass]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load students for the selected class
      const allStudents = await studentService.getAllStudents();
      const classStudents = selectedClass === 'all' 
        ? allStudents 
        : allStudents.filter(s => s.class === selectedClass);
      setStudents(classStudents);

      // Load remarks
      const remarksQuery = selectedClass === 'all' 
        ? query(collection(db, 'remarks'))
        : query(collection(db, 'remarks'), where('class', '==', selectedClass));
      
      const remarksSnapshot = await getDocs(remarksQuery);
      const remarksData = remarksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Remark[];
      
      // Sort by date (newest first)
      remarksData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRemarks(remarksData);
    } catch (error) {
      console.error('Error loading remarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const student = students.find(s => s.rollNumber === formData.studentId);
      if (!student) {
        alert('Student not found');
        return;
      }

      const remarkData = {
        studentId: formData.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        class: student.class,
        subject: formData.subject,
        remark: formData.remark,
        type: formData.type,
        date: formData.date,
        createdAt: serverTimestamp(),
        createdBy: 'teacher' // This should be the actual teacher ID
      };

      if (editingRemark) {
        // Update existing remark
        await updateDoc(doc(db, 'remarks', editingRemark.id!), remarkData);
      } else {
        // Add new remark
        await addDoc(collection(db, 'remarks'), remarkData);
      }

      // Reset form and reload data
      setFormData({
        studentId: '',
        subject: '',
        remark: '',
        type: 'positive',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setEditingRemark(null);
      loadData();
      
    } catch (error) {
      console.error('Error saving remark:', error);
      alert('Error saving remark. Please try again.');
    }
  };

  const handleEdit = (remark: Remark) => {
    setEditingRemark(remark);
    setFormData({
      studentId: remark.studentId,
      subject: remark.subject,
      remark: remark.remark,
      type: remark.type,
      date: remark.date
    });
    setShowAddForm(true);
  };

  const handleDelete = async (remarkId: string) => {
    if (window.confirm('Are you sure you want to delete this remark?')) {
      try {
        await deleteDoc(doc(db, 'remarks', remarkId));
        loadData();
      } catch (error) {
        console.error('Error deleting remark:', error);
        alert('Error deleting remark. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingRemark(null);
    setFormData({
      studentId: '',
      subject: '',
      remark: '',
      type: 'positive',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '📝';
    }
  };



  if (loading) {
    return (
      <div className="remarks-manager">
        <div className="loading">Loading remarks...</div>
      </div>
    );
  }

  return (
    <div className="remarks-manager">
      <div className="remarks-header">
        <h2>📝 Student Remarks Management</h2>
        <div className="header-actions">
          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <span className="btn-icon">➕</span>
            Add Remark
          </Button>
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {showAddForm && (
        <Card className="add-remark-form">
          <h3>{editingRemark ? 'Edit Remark' : 'Add New Remark'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.rollNumber} value={student.rollNumber}>
                      {student.rollNumber} - {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'positive' | 'negative' | 'neutral' })}
                >
                  <option value="positive">😊 Positive</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="negative">😞 Needs Improvement</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Remark</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                placeholder="Enter your remark about the student..."
                rows={4}
                required
              />
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary">
                {editingRemark ? 'Update Remark' : 'Add Remark'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="remarks-list">
        <h3>Student Remarks ({remarks.length})</h3>
        {remarks.length === 0 ? (
          <div className="no-data">No remarks found for this class.</div>
        ) : (
          <div className="remarks-grid">
            {remarks.map(remark => (
              <Card 
                key={remark.id} 
                className={`remark-card remark-${remark.type}`}
              >
                <div className="remark-header">
                  <div className="remark-student">
                    <h4>{remark.studentName}</h4>
                    <span className="remark-subject">{remark.subject}</span>
                  </div>
                  <div className="remark-meta">
                    <span className="remark-type">
                      {getTypeIcon(remark.type)} {remark.type.charAt(0).toUpperCase() + remark.type.slice(1)}
                    </span>
                    <span className="remark-date">{new Date(remark.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="remark-content">
                  <p>{remark.remark}</p>
                </div>
                
                <div className="remark-actions">
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(remark)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(remark.id!)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemarksManager;

import React, { useState } from 'react';
import { Button, Card } from '@/components/common';
import { useStudents } from '@/hooks/data/useStudents';
import { useRemarks, Remark } from '@/hooks/data/useRemarks';
import { useForm } from '@/hooks/form/useForm';
import { useFormValidation } from '@/hooks/form/useFormValidation';
import './RemarksManager.css';

interface RemarkFormData {
  studentId: string;
  subject: string;
  remark: string;
  type: 'positive' | 'negative' | 'neutral';
  date: string;
}

interface RemarksManagerProps {
  selectedClass: string;
  onClose?: () => void;
}

const RemarksManager: React.FC<RemarksManagerProps> = ({ selectedClass, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRemark, setEditingRemark] = useState<Remark | null>(null);

  const subjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Art & Craft', 'Physical Education', 'Music', 'Computer Science', 'General'];

  // Use custom hooks
  const { students, loading: studentsLoading } = useStudents({
    className: selectedClass === 'all' ? undefined : selectedClass,
  });
  
  const { remarks, loading: remarksLoading, addRemark, updateRemark, deleteRemark } = useRemarks({
    classFilter: selectedClass,
  });

  const validation = useFormValidation();

  const { values, errors, handleChange, handleSubmit, isSubmitting, setFieldValue, reset } = useForm<RemarkFormData>({
    initialValues: {
      studentId: '',
      subject: '',
      remark: '',
      type: 'positive',
      date: new Date().toISOString().split('T')[0]
    },
    validate: (values) => ({
      studentId: validation.rules.required('Please select a student')(values.studentId),
      subject: validation.rules.required('Please select a subject')(values.subject),
      remark: validation.composeValidators(
        validation.rules.required('Remark is required'),
        validation.rules.minLength(10, 'Remark must be at least 10 characters long')
      )(values.remark),
      date: validation.rules.required('Date is required')(values.date),
    }),
    onSubmit: async (values) => {
      const student = students.find(s => s.rollNumber === values.studentId);
      if (!student) {
        alert('Student not found');
        return;
      }

      const remarkData = {
        studentId: values.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        class: student.class,
        subject: values.subject,
        remark: values.remark,
        type: values.type,
        date: values.date,
        createdBy: 'teacher' // This should be the actual teacher ID
      };

      if (editingRemark) {
        await updateRemark(editingRemark.id!, remarkData);
      } else {
        await addRemark(remarkData);
      }

      handleCancel();
    }
  });

  const handleEdit = (remark: Remark) => {
    setEditingRemark(remark);
    setFieldValue('studentId', remark.studentId);
    setFieldValue('subject', remark.subject);
    setFieldValue('remark', remark.remark);
    setFieldValue('type', remark.type);
    setFieldValue('date', remark.date);
    setShowAddForm(true);
  };

  const handleDelete = async (remarkId: string) => {
    if (window.confirm('Are you sure you want to delete this remark?')) {
      try {
        await deleteRemark(remarkId);
      } catch (error) {
        alert('Error deleting remark. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingRemark(null);
    reset();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '📝';
    }
  };



  const loading = studentsLoading || remarksLoading;

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
                  name="studentId"
                  value={values.studentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.rollNumber} value={student.rollNumber}>
                      {student.rollNumber} - {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
                {errors.studentId && <span className="error-message">{errors.studentId}</span>}
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select
                  name="subject"
                  value={values.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={values.type}
                  onChange={handleChange}
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
                  name="date"
                  value={values.date}
                  onChange={handleChange}
                  required
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Remark</label>
              <textarea
                name="remark"
                value={values.remark}
                onChange={handleChange}
                placeholder="Enter your remark about the student..."
                rows={4}
                required
              />
              {errors.remark && <span className="error-message">{errors.remark}</span>}
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingRemark ? 'Update Remark' : 'Add Remark'}
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

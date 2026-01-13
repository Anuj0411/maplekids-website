import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/Forms.css';
import { financialService, studentService, Student } from '@/firebase/services';
import { FormField, Button } from '@/components/common';

interface FinancialFormData {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptNumber: string;
  studentName?: string;
  studentClass?: string;
  month?: string;
  academicYear?: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddFinancialRecordForm: React.FC = () => {
  const [formData, setFormData] = useState<FinancialFormData>({
    type: 'income',
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    studentName: '',
    studentClass: '',
    month: '',
    academicYear: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const navigate = useNavigate();

  // Load students when component mounts
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoadingStudents(true);
        const studentsData = await studentService.getAllStudents();
        setStudents(studentsData);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, []);

  // Filter students when class changes
  useEffect(() => {
    if (formData.studentClass && students.length > 0) {
      const filtered = students.filter(student => student.class === formData.studentClass);
      setFilteredStudents(filtered);
      
      // Clear student name if it's not in the filtered list
      if (formData.studentName && !filtered.some(s => s.firstName + ' ' + s.lastName === formData.studentName)) {
        setFormData(prev => ({ ...prev, studentName: '' }));
      }
    } else {
      setFilteredStudents([]);
    }
  }, [formData.studentClass, formData.studentName, students]);

  const initialFormData: FinancialFormData = {
    type: 'income',
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    studentName: '',
    studentClass: '',
    month: '',
    academicYear: ''
  };

  const incomeCategories = [
    'Tuition Fees',
    'Admission Fees',
    'Transportation Fees',
    'Van Fees',
    'Meal Charges',
    'Activity Fees',
    'Uniform Fees',
    'Book Fees',
    'Exam Fees',
    'Donations',
    'Other Income'
  ];

  const expenseCategories = [
    'Staff Salaries',
    'Teacher Salaries',
    'Van Driver Salaries',
    'Utilities',
    'Electricity',
    'Water',
    'Internet',
    'Maintenance',
    'Building Maintenance',
    'Van Maintenance',
    'Supplies',
    'Stationery',
    'Teaching Materials',
    'Food & Catering',
    'Transportation',
    'Van Fuel & Maintenance',
    'Marketing',
    'Insurance',
    'Van Insurance',
    'School Insurance',
    'Other Expenses'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.type === 'income' && !formData.receiptNumber.trim()) {
      newErrors.receiptNumber = 'Receipt number is required for income records';
    }

    // Validate student information for income records with student-related categories
    if (formData.type === 'income' && ['Tuition Fees', 'Admission Fees', 'Transportation Fees', 'Van Fees'].includes(formData.category)) {
      if (!formData.studentClass.trim()) {
        newErrors.studentClass = 'Student class is required for this income category';
      }
      if (!formData.studentName.trim()) {
        newErrors.studentName = 'Student name is required for this income category';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Firebase instead of localStorage
      await financialService.addFinancialRecord({
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
        receiptNumber: formData.receiptNumber,
        studentName: formData.studentName,
        studentClass: formData.studentClass,
        month: formData.month,
        academicYear: formData.academicYear
      });

      setFormData(initialFormData);
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding financial record:', error);
  // Optionally show error in UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  // ...existing code...

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>💰 Add Financial Record</h1>
          <p>Record income or expense transactions for the school</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h3>📊 Record Type & Category</h3>
            <div className="form-row">
              <div className="form-group">
                <FormField
                  label="Record Type *"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  as="select"
                  options={[{ value: 'income', label: '💰 Income' }, { value: 'expense', label: '💸 Expense' }]}
                  className="form-select"
                />
              </div>

              <div className="form-group">
                <FormField
                  label="Category *"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  as="select"
                  options={formData.type === 'income' ? incomeCategories.map(cat => ({ value: cat, label: cat })) : expenseCategories.map(cat => ({ value: cat, label: cat }))}
                  error={errors.category}
                  className={errors.category ? 'error' : ''}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>💵 Amount & Description</h3>
            <div className="form-row">
              <div className="form-group">
                <FormField
                  label="Amount (₹) *"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  error={errors.amount}
                  className={errors.amount ? 'error' : ''}
                />
              </div>

              <div className="form-group">
                <FormField
                  label="Date *"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  error={errors.date}
                  className={errors.date ? 'error' : ''}
                />
              </div>
            </div>

            <div className="form-group">
              <FormField
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                as="textarea"
                placeholder="Provide detailed description of the transaction"
                rows={3}
                error={errors.description}
                className={errors.description ? 'error' : ''}
              />
            </div>
          </div>

          {/* Additional fields for tuition fees and detailed records */}
          {(formData.type === 'income' && ['Tuition Fees', 'Admission Fees', 'Transportation Fees', 'Van Fees'].includes(formData.category)) && (
            <div className="form-section">
              <h3>👨‍🎓 Student Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <FormField
                    label="Student Class *"
                    name="studentClass"
                    value={formData.studentClass || ''}
                    onChange={handleInputChange}
                    as="select"
                    options={[
                      { value: '', label: 'Select Class First' },
                      { value: 'play', label: 'Play' },
                      { value: 'nursery', label: 'Nursery' },
                      { value: 'lkg', label: 'LKG' },
                      { value: 'ukg', label: 'UKG' },
                      { value: '1st', label: '1st' }
                    ]}
                    error={errors.studentClass}
                    required
                  />
                  <small className="form-help">
                    Select the class first to see available students
                  </small>
                </div>
                <div className="form-group">
                  <FormField
                    label="Student Name *"
                    name="studentName"
                    value={formData.studentName || ''}
                    onChange={handleInputChange}
                    as="select"
                    options={[
                      { value: '', label: filteredStudents.length === 0 ? 'Select Class First' : 'Select Student' },
                      ...filteredStudents.map(student => ({
                        value: `${student.firstName} ${student.lastName}`,
                        label: `${student.firstName} ${student.lastName} (Roll: ${student.rollNumber})`
                      }))
                    ]}
                    disabled={!formData.studentClass || isLoadingStudents}
                    error={errors.studentName}
                    required
                  />
                  {isLoadingStudents && (
                    <small className="form-help">Loading students...</small>
                  )}
                  {formData.studentClass && filteredStudents.length === 0 && !isLoadingStudents && (
                    <small className="form-help text-warning">
                      No students found in {formData.studentClass} class
                    </small>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <FormField
                    label="Month"
                    name="month"
                    value={formData.month || ''}
                    onChange={handleInputChange}
                    as="select"
                    options={[
                      { value: '', label: 'Select Month' },
                      { value: 'January', label: 'January' },
                      { value: 'February', label: 'February' },
                      { value: 'March', label: 'March' },
                      { value: 'April', label: 'April' },
                      { value: 'May', label: 'May' },
                      { value: 'June', label: 'June' },
                      { value: 'July', label: 'July' },
                      { value: 'August', label: 'August' },
                      { value: 'September', label: 'September' },
                      { value: 'October', label: 'October' },
                      { value: 'November', label: 'November' },
                      { value: 'December', label: 'December' }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <FormField
                    label="Academic Year"
                    name="academicYear"
                    value={formData.academicYear || ''}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="e.g., 2024-25"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>🧾 Receipt Information</h3>
            <div className="form-group">
              <FormField
                label={formData.type === 'income' ? 'Receipt Number *' : 'Reference Number (Optional)'}
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleInputChange}
                type="text"
                placeholder={formData.type === 'income' ? 'Enter receipt number' : 'Enter reference number'}
                error={errors.receiptNumber}
                className={errors.receiptNumber ? 'error' : ''}
              />
              <small className="form-help">
                {formData.type === 'income' 
                  ? 'Receipt number is required for income records to track payments'
                  : 'Reference number helps track expense records and invoices'
                }
              </small>
            </div>
          </div>

          <div className="form-summary">
            <h3>📋 Record Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Type:</span>
                <span className={`summary-value ${formData.type}`}>
                  {formData.type === 'income' ? '💰 Income' : '💸 Expense'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Category:</span>
                <span className="summary-value">{formData.category || 'Not selected'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Amount:</span>
                <span className="summary-value amount">₹{formData.amount.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">{formData.date ? new Date(formData.date).toLocaleDateString() : 'Not selected'}</span>
              </div>
              {formData.studentName && (
                <div className="summary-item">
                  <span className="summary-label">Student:</span>
                  <span className="summary-value">{formData.studentName} ({formData.studentClass})</span>
                </div>
              )}
              {formData.month && (
                <div className="summary-item">
                  <span className="summary-label">Month:</span>
                  <span className="summary-value">{formData.month}</span>
                </div>
              )}
              {formData.academicYear && (
                <div className="summary-item">
                  <span className="summary-label">Academic Year:</span>
                  <span className="summary-value">{formData.academicYear}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Adding Record...
                </>
              ) : (
                'Add Financial Record'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFinancialRecordForm;

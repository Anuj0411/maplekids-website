import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/Forms.css';
import { Student } from '@/firebase/services';
import { FormField, Button } from '@/components/common';
import { useForm } from '@/hooks/form/useForm';
import { useFormValidation } from '@/hooks/form/useFormValidation';
import { useStudents } from '@/hooks/data/useStudents';
import { useFinancialRecords } from '@/hooks/data/useFinancialRecords';

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

const AddFinancialRecordForm: React.FC = () => {
  const navigate = useNavigate();
  const validation = useFormValidation();
  
  // Use custom hooks for students and financial records
  const { students, loading: isLoadingStudents } = useStudents();
  const { addRecord, stats } = useFinancialRecords({ autoFetch: true });
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

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

  // Custom validator for student-related income categories
  const validateStudentInfo = (values: FinancialFormData) => {
    const studentRelatedCategories = ['Tuition Fees', 'Admission Fees', 'Transportation Fees', 'Van Fees'];
    if (values.type === 'income' && studentRelatedCategories.includes(values.category)) {
      return {
        studentClass: validation.rules.required('Student class is required for this income category')(values.studentClass),
        studentName: validation.rules.required('Student name is required for this income category')(values.studentName),
      };
    }
    return {};
  };

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm<FinancialFormData>({
    initialValues: {
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
    },
    validate: (values) => {
      const baseErrors: Record<string, string | undefined> = {
        category: validation.rules.required('Category is required')(values.category),
        amount: values.amount <= 0 ? 'Amount must be greater than 0' : undefined,
        description: validation.composeValidators(
          validation.rules.required('Description is required'),
          validation.rules.minLength(10, 'Description must be at least 10 characters')
        )(values.description),
        date: validation.rules.required('Date is required')(values.date),
      };

      // Conditional validation for income type
      if (values.type === 'income') {
        baseErrors.receiptNumber = validation.rules.required('Receipt number is required for income records')(values.receiptNumber);
      }

      // Add student-specific validation
      const studentErrors = validateStudentInfo(values);

      return { ...baseErrors, ...studentErrors };
    },
    onSubmit: async (values) => {
      try {
        // Save to Firebase using useFinancialRecords hook
        await addRecord({
          type: values.type,
          category: values.category,
          amount: values.amount,
          description: values.description,
          date: values.date,
          receiptNumber: values.receiptNumber,
          studentName: values.studentName,
          studentClass: values.studentClass,
          month: values.month,
          academicYear: values.academicYear
        });

        // Redirect after successful submission
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 2000);
        
      } catch (error) {
        console.error('Error adding financial record:', error);
        // Optionally show error in UI
      }
    }
  });

  // Filter students when class changes
  useEffect(() => {
    if (values.studentClass && students.length > 0) {
      const filtered = students.filter(student => student.class === values.studentClass);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [values.studentClass, students]);

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

        {/* Financial Statistics Summary */}
        <div className="form-section" style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📊 Current Financial Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Total Income</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                ₹{stats.totalIncome.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Total Expense</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                ₹{stats.totalExpense.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Net Balance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stats.balance >= 0 ? '#28a745' : '#dc3545' }}>
                ₹{stats.balance.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Total Records</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                {stats.recordCount}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h3>📊 Record Type & Category</h3>
            <div className="form-row">
              <div className="form-group">
                <FormField
                  label="Record Type *"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  as="select"
                  options={[{ value: 'income', label: '💰 Income' }, { value: 'expense', label: '💸 Expense' }]}
                  className="form-select"
                />
              </div>

              <div className="form-group">
                <FormField
                  label="Category *"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  as="select"
                  options={values.type === 'income' ? incomeCategories.map(cat => ({ value: cat, label: cat })) : expenseCategories.map(cat => ({ value: cat, label: cat }))}
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
                  value={values.amount}
                  onChange={handleChange}
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
                  value={values.date}
                  onChange={handleChange}
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
                value={values.description}
                onChange={handleChange}
                as="textarea"
                placeholder="Provide detailed description of the transaction"
                rows={3}
                error={errors.description}
                className={errors.description ? 'error' : ''}
              />
            </div>
          </div>

          {/* Additional fields for tuition fees and detailed records */}
          {(values.type === 'income' && ['Tuition Fees', 'Admission Fees', 'Transportation Fees', 'Van Fees'].includes(values.category)) && (
            <div className="form-section">
              <h3>👨‍🎓 Student Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <FormField
                    label="Student Class *"
                    name="studentClass"
                    value={values.studentClass || ''}
                    onChange={handleChange}
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
                    value={values.studentName || ''}
                    onChange={handleChange}
                    as="select"
                    options={[
                      { value: '', label: filteredStudents.length === 0 ? 'Select Class First' : 'Select Student' },
                      ...filteredStudents.map(student => ({
                        value: `${student.firstName} ${student.lastName}`,
                        label: `${student.firstName} ${student.lastName} (Roll: ${student.rollNumber})`
                      }))
                    ]}
                    disabled={!values.studentClass || isLoadingStudents}
                    error={errors.studentName}
                    required
                  />
                  {isLoadingStudents && (
                    <small className="form-help">Loading students...</small>
                  )}
                  {values.studentClass && filteredStudents.length === 0 && !isLoadingStudents && (
                    <small className="form-help text-warning">
                      No students found in {values.studentClass} class
                    </small>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <FormField
                    label="Month"
                    name="month"
                    value={values.month || ''}
                    onChange={handleChange}
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
                    value={values.academicYear || ''}
                    onChange={handleChange}
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
                label={values.type === 'income' ? 'Receipt Number *' : 'Reference Number (Optional)'}
                name="receiptNumber"
                value={values.receiptNumber}
                onChange={handleChange}
                type="text"
                placeholder={values.type === 'income' ? 'Enter receipt number' : 'Enter reference number'}
                error={errors.receiptNumber}
                className={errors.receiptNumber ? 'error' : ''}
              />
              <small className="form-help">
                {values.type === 'income' 
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
                <span className={`summary-value ${values.type}`}>
                  {values.type === 'income' ? '💰 Income' : '💸 Expense'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Category:</span>
                <span className="summary-value">{values.category || 'Not selected'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Amount:</span>
                <span className="summary-value amount">₹{values.amount.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">{values.date ? new Date(values.date).toLocaleDateString() : 'Not selected'}</span>
              </div>
              {values.studentName && (
                <div className="summary-item">
                  <span className="summary-label">Student:</span>
                  <span className="summary-value">{values.studentName} ({values.studentClass})</span>
                </div>
              )}
              {values.month && (
                <div className="summary-item">
                  <span className="summary-label">Month:</span>
                  <span className="summary-value">{values.month}</span>
                </div>
              )}
              {values.academicYear && (
                <div className="summary-item">
                  <span className="summary-label">Academic Year:</span>
                  <span className="summary-value">{values.academicYear}</span>
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

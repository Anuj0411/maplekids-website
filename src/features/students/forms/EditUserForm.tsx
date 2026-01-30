import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '@/styles/Forms.css';
import { FormField, Button } from '@/components/common';
import { userService } from '@/firebase/services';
import { useForm } from '@/hooks/form';
import { useFormValidation } from '@/hooks/form/useFormValidation';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: 'admin' | 'teacher' | 'student';
  // Student-specific fields
  rollNumber?: string;
  class?: 'play' | 'nursery' | 'lkg' | 'ukg' | '1st';
  age?: number;
  parentName?: string;
  parentPhone?: string;
  admissionDate?: string;
}

const EditUserForm: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const validation = useFormValidation();
  const navigate = useNavigate();
  
  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    handleSubmit: formHandleSubmit
  } = useForm<UserFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      role: 'student',
      rollNumber: '',
      class: 'play',
      age: undefined,
      parentName: '',
      parentPhone: '',
      admissionDate: ''
    },
    validate: (values) => ({
      firstName: validation.composeValidators(
        validation.rules.required('First name is required'),
        validation.rules.minLength(2, 'First name must be at least 2 characters')
      )(values.firstName),
      lastName: validation.composeValidators(
        validation.rules.required('Last name is required'),
        validation.rules.minLength(2, 'Last name must be at least 2 characters')
      )(values.lastName),
      email: validation.composeValidators(
        validation.rules.required('Email is required'),
        validation.rules.email('Please enter a valid email address')
      )(values.email),
      phone: validation.composeValidators(
        validation.rules.required('Phone number is required'),
        validation.rules.phone('Please enter a valid 10-digit phone number')
      )(values.phone),
      address: validation.composeValidators(
        validation.rules.required('Address is required'),
        validation.rules.minLength(10, 'Address must be at least 10 characters')
      )(values.address)
    }),
    onSubmit: async (values) => {
      if (!userId) {
        throw new Error('User ID is missing');
      }

      const updateData: any = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        role: values.role
      };

      // Include student-specific fields if user is a student
      if (values.role === 'student') {
        if (values.rollNumber) updateData.rollNumber = values.rollNumber.trim();
        if (values.class) updateData.class = values.class;
        if (values.age) updateData.age = values.age;
        if (values.parentName) updateData.parentName = values.parentName.trim();
        if (values.parentPhone) updateData.parentPhone = values.parentPhone.trim();
        if (values.admissionDate) updateData.admissionDate = values.admissionDate;
      }

      await userService.updateUser(userId, updateData);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        setErrorMessage('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all users and find the one we need
        const allUsers = await userService.getAllUsers();
        const user = allUsers.find(u => u.id === userId);
        
        if (user) {
          setFieldValue('firstName', user.firstName);
          setFieldValue('lastName', user.lastName);
          setFieldValue('email', user.email);
          setFieldValue('phone', user.phone || '');
          setFieldValue('address', user.address || '');
          setFieldValue('role', user.role);
          
          // Load student-specific fields if user is a student
          if (user.role === 'student') {
            setFieldValue('rollNumber', (user as any).rollNumber || '');
            setFieldValue('class', (user as any).class || 'play');
            setFieldValue('age', (user as any).age || undefined);
            setFieldValue('parentName', (user as any).parentName || '');
            setFieldValue('parentPhone', (user as any).parentPhone || '');
            setFieldValue('admissionDate', (user as any).admissionDate || '');
          }
        } else {
          setErrorMessage('User not found');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setErrorMessage('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId, setFieldValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await formHandleSubmit();
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDescription = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Full access to all system features and user management';
      case 'teacher':
        return 'Access to student management, attendance, and reports';
      case 'student':
        return 'Access to personal dashboard with attendance and profile information';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <h1>Loading User Data...</h1>
            <p>Please wait while we load the user information.</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <div className="success-icon">✅</div>
            <h1>User Updated Successfully!</h1>
            <p>The user information has been updated successfully.</p>
            <p>Redirecting to admin dashboard...</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/admin-dashboard')}
              className="btn-primary"
            >
              Go to Admin Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>✏️ Edit User</h1>
          <p>Update user information and access permissions</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <FormField
                label="First Name *"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                type="text"
                placeholder="Enter first name"
                error={errors.firstName}
                className={errors.firstName ? 'error' : ''}
              />
              <FormField
                label="Last Name *"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Enter last name"
                error={errors.lastName}
                className={errors.lastName ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <FormField
                label="Email Address *"
                name="email"
                value={values.email}
                onChange={handleChange}
                type="email"
                placeholder="Enter email address"
                error={errors.email}
                className={errors.email ? 'error' : ''}
              />
              <small className="help-text">This is used for login</small>
            </div>

            <div className="form-group">
              <FormField
                label="Phone Number *"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                type="tel"
                placeholder="Enter 10-digit phone number"
                error={errors.phone}
                className={errors.phone ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <FormField
                label="Address *"
                name="address"
                value={values.address}
                onChange={handleChange}
                as="textarea"
                placeholder="Enter complete address"
                rows={3}
                error={errors.address}
                className={errors.address ? 'error' : ''}
              />
              <small className="help-text">Minimum 10 characters</small>
            </div>
          </div>

          {/* Student-Specific Fields */}
          {values.role === 'student' && (
            <div className="form-section">
              <h3>Student Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <FormField
                    label="Roll Number *"
                    name="rollNumber"
                    value={values.rollNumber || ''}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter roll number"
                    error={errors.rollNumber}
                    className={errors.rollNumber ? 'error' : ''}
                    disabled
                  />
                  <small className="help-text">Roll number cannot be changed</small>
                </div>
                <div className="form-group">
                  <label htmlFor="class">Class *</label>
                  <select
                    id="class"
                    name="class"
                    value={values.class || 'play'}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="play">Play</option>
                    <option value="nursery">Nursery</option>
                    <option value="lkg">LKG</option>
                    <option value="ukg">UKG</option>
                    <option value="1st">1st</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <FormField
                    label="Age"
                    name="age"
                    value={values.age?.toString() || ''}
                    onChange={(e) => setFieldValue('age', e.target.value ? parseInt(e.target.value) : undefined)}
                    type="number"
                    placeholder="Enter age"
                    min="2"
                    max="10"
                  />
                </div>
                <div className="form-group">
                  <FormField
                    label="Admission Date"
                    name="admissionDate"
                    value={values.admissionDate || ''}
                    onChange={handleChange}
                    type="date"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <FormField
                    label="Parent Name"
                    name="parentName"
                    value={values.parentName || ''}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter parent/guardian name"
                  />
                </div>
                <div className="form-group">
                  <FormField
                    label="Parent Phone"
                    name="parentPhone"
                    value={values.parentPhone || ''}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Enter parent/guardian phone"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Only show Access Level section for non-student users */}
          {values.role !== 'student' && (
            <div className="form-section">
              <h3>Access Level</h3>
              
              <div className="form-group">
                <label htmlFor="role">User Role *</label>
                <select
                  id="role"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  className={`form-select ${errors.role ? 'error' : ''}`}
                >
                  <option value="teacher">Teacher - Educational Access</option>
                  <option value="admin">Admin - Full Access</option>
                </select>
                {errors.role && <span className="error-text">{errors.role}</span>}
                <small className="help-text">{getRoleDescription(values.role)}</small>
              </div>
            </div>
          )}

          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Updating User...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Update User
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin-dashboard')}
              className="btn-secondary"
            >
              <span className="btn-icon">↩️</span>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Forms.css';
import { FormField, Button } from '../common';
import { userService } from '../../firebase/services';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: 'admin' | 'teacher' | 'student';
}

interface FormErrors {
  [key: string]: string;
}

const EditUserForm: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: 'student'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        setErrorMessage('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const users = await userService.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
          setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role
          });
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
  }, [userId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Clear general error message
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!userId) {
      setErrorMessage('User ID is missing');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        // Only include role in update if it's not a student
        ...(formData.role !== 'student' && { role: formData.role })
      };

      await userService.updateUser(userId, updateData);
      
      setSubmitSuccess(true);
      
      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Update error:', error);
      setErrorMessage('An error occurred while updating the user. Please try again.');
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
                value={formData.firstName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter first name"
                error={errors.firstName}
                className={errors.firstName ? 'error' : ''}
              />
              <FormField
                label="Last Name *"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
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
                value={formData.email}
                onChange={handleInputChange}
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
                value={formData.phone}
                onChange={handleInputChange}
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
                value={formData.address}
                onChange={handleInputChange}
                as="textarea"
                placeholder="Enter complete address"
                rows={3}
                error={errors.address}
                className={errors.address ? 'error' : ''}
              />
              <small className="help-text">Minimum 10 characters</small>
            </div>
          </div>

          {/* Only show Access Level section for non-student users */}
          {formData.role !== 'student' && (
            <div className="form-section">
              <h3>Access Level</h3>
              
              <div className="form-group">
                <label htmlFor="role">User Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`form-select ${errors.role ? 'error' : ''}`}
                >
                  <option value="teacher">Teacher - Educational Access</option>
                  <option value="admin">Admin - Full Access</option>
                </select>
                {errors.role && <span className="error-text">{errors.role}</span>}
                <small className="help-text">{getRoleDescription(formData.role)}</small>
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

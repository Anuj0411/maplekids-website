import React, { useState } from 'react';
import { Button, FormField, Modal } from '@/components/common';
import { useUsers } from '@/hooks/data/useUsers';
import { useStudents } from '@/hooks/data/useStudents';
import './UserCreationModal.css';

interface UserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: 'admin' | 'teacher' | 'student';
  class?: string;
  rollNumber?: string;
  age?: number;
  parentName?: string;
  parentPhone?: string;
  admissionDate?: string;
  photo?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: string;
  class?: string;
  rollNumber?: string;
  age?: string;
  parentName?: string;
  parentPhone?: string;
  admissionDate?: string;
}

const UserCreationModal: React.FC<UserCreationModalProps> = ({
  isOpen,
  onClose,
  onUserCreated
}) => {
  const { addUser } = useUsers({ autoFetch: false });
  const { students } = useStudents({ autoFetch: true });
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'student',
    age: 3,
    parentName: '',
    parentPhone: '',
    admissionDate: new Date().toISOString().split('T')[0],
    photo: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');


  const checkRollNumberExists = async (rollNumber: string): Promise<boolean> => {
    try {
      return students.some(student => student.rollNumber === rollNumber);
    } catch (error) {
      console.error('Error checking roll number:', error);
      return false;
    }
  };

  const generateRollNumber = (classValue: string, rollNumberInput: string): string => {
    if (!classValue || !rollNumberInput) return '';
    
    // Get class prefix (first 3 letters of class name, handle special cases)
    let classPrefix = classValue.substring(0, 3).toUpperCase();
    if (classValue === '1st') {
      classPrefix = '1ST';
    }
    
    // Use the user input as suffix, pad with leading zeros
    const suffix = rollNumberInput.padStart(2, '0');
    return `${classPrefix}${suffix}`;
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.role === 'student') {
      if (!formData.class) {
        newErrors.class = 'Class is required for students';
      }
      if (!formData.rollNumber) {
        newErrors.rollNumber = 'Roll number is required for students';
      } else {
        // Check if roll number already exists
        const fullRollNumber = generateRollNumber(formData.class, formData.rollNumber);
        const exists = await checkRollNumberExists(fullRollNumber);
        if (exists) {
          newErrors.rollNumber = `Roll number ${fullRollNumber} already exists`;
        }
      }
      if (!formData.age || formData.age < 1 || formData.age > 20) {
        newErrors.age = 'Age must be between 1 and 20';
      }
      if (!formData.parentName?.trim()) {
        newErrors.parentName = 'Parent name is required for students';
      }
      if (!formData.parentPhone?.trim()) {
        newErrors.parentPhone = 'Parent phone is required for students';
      } else if (!/^[0-9]{10}$/.test(formData.parentPhone.replace(/\s/g, ''))) {
        newErrors.parentPhone = 'Please enter a valid 10-digit parent phone number';
      }
      if (!formData.admissionDate?.trim()) {
        newErrors.admissionDate = 'Admission date is required for students';
      }
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
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role,
        ...(formData.role === 'student' && {
          class: formData.class,
          rollNumber: generateRollNumber(formData.class!, formData.rollNumber!),
          age: formData.age,
          parentName: formData.parentName?.trim(),
          parentPhone: formData.parentPhone?.trim(),
          admissionDate: formData.admissionDate,
          photo: formData.photo
        })
      };

      await addUser(formData.email, formData.password, userData);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'student',
        age: 3,
        parentName: '',
        parentPhone: '',
        admissionDate: new Date().toISOString().split('T')[0],
        photo: ''
      });
      
      onUserCreated();
      onClose();
      
      // Show success message with better UX
      setSubmitSuccess('User created successfully! The user can now sign in with their credentials.');
      
      // Auto-close modal after 2 seconds and redirect to sign-in
      setTimeout(() => {
        onClose();
        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1000);
      }, 2000);

    } catch (error: any) {
      console.error('User creation error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setSubmitError('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        setSubmitError('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setSubmitError('Please enter a valid email address.');
      } else if (error.message.includes('Permission denied') || error.message.includes('permissions') || error.message.includes('Missing or insufficient permissions')) {
        setSubmitError('❌ PERMISSION ERROR: Please update your Firestore security rules.\n\n🔧 QUICK FIX:\n1. Go to Firebase Console → Firestore Database → Rules\n2. Replace all rules with the simple rule in QUICK_FIX.md\n3. Click "Publish"\n\n📖 See QUICK_FIX.md for detailed instructions.');
      } else {
        setSubmitError('An error occurred while creating the user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
      <div className="user-creation-modal">
        {submitError && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="success-banner">
            <span className="success-icon">✅</span>
            {submitSuccess}
            <div className="redirect-message">
              Redirecting to sign-in page...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-creation-form">
          {/* Role Selection */}
          <div className="form-section">
            <h3>👤 User Type</h3>
            <div className="role-selection">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleInputChange}
                />
                <div className="role-card">
                  <div className="role-icon">👦</div>
                  <div className="role-info">
                    <h4>Student</h4>
                    <p>Student account with class assignment</p>
                  </div>
                </div>
              </label>

              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === 'teacher'}
                  onChange={handleInputChange}
                />
                <div className="role-card">
                  <div className="role-icon">👩‍🏫</div>
                  <div className="role-info">
                    <h4>Teacher</h4>
                    <p>Class management and attendance</p>
                  </div>
                </div>
              </label>

              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleInputChange}
                />
                <div className="role-card">
                  <div className="role-icon">👨‍💼</div>
                  <div className="role-info">
                    <h4>Admin</h4>
                    <p>Full system access and management</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h3>📝 Personal Information</h3>
            <div className="form-row">
              <FormField
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter first name"
                error={errors.firstName}
              />
              <FormField
                label="Last Name *"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter last name"
                error={errors.lastName}
              />
            </div>

            <FormField
              label="Email *"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              placeholder="Enter email address"
              error={errors.email}
            />

            <div className="form-row">
              <FormField
                label="Phone *"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                type="tel"
                placeholder="Enter 10-digit phone number"
                error={errors.phone}
              />
              <FormField
                label="Password *"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                type="password"
                placeholder="Create password"
                error={errors.password}
              />
            </div>

            <FormField
              label="Address *"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              as="textarea"
              placeholder="Enter complete address"
              rows={3}
              error={errors.address}
            />
          </div>

          {/* Student-specific fields */}
          {formData.role === 'student' && (
            <div className="form-section">
              <h3>🎓 Student Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="class">Class *</label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class || ''}
                    onChange={handleInputChange}
                    className={`form-input ${errors.class ? 'error' : ''}`}
                  >
                    <option value="">Select Class</option>
                    <option value="play">Play Group</option>
                    <option value="nursery">Nursery</option>
                    <option value="lkg">LKG</option>
                    <option value="ukg">UKG</option>
                    <option value="1st">1st Standard</option>
                  </select>
                  {errors.class && <span className="error-message">{errors.class}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="rollNumber">Roll Number *</label>
                  <div className="roll-number-input">
                    <input
                      id="rollNumber"
                      name="rollNumber"
                      value={formData.rollNumber || ''}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="Enter number (e.g., 1, 2, 3...)"
                      className={`form-input ${errors.rollNumber ? 'error' : ''}`}
                      min="1"
                      max="999"
                    />
                  </div>
                  {formData.class && formData.rollNumber && (
                    <div className="roll-number-preview">
                      <strong>Generated Roll Number: </strong>
                      <span className="generated-roll">
                        {generateRollNumber(formData.class, formData.rollNumber)}
                      </span>
                    </div>
                  )}
                  {errors.rollNumber && <span className="error-message">{errors.rollNumber}</span>}
                  <small className="help-text">
                    Enter a number (1-999). Roll number will be generated as: {formData.class ? formData.class.substring(0, 3).toUpperCase() : 'CLASS'} + your number
                  </small>
                </div>
              </div>

              <div className="form-row">
                <FormField
                  label="Age *"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Enter age"
                  error={errors.age}
                />
                <FormField
                  label="Admission Date *"
                  name="admissionDate"
                  value={formData.admissionDate || ''}
                  onChange={handleInputChange}
                  type="date"
                  placeholder="Select admission date"
                  error={errors.admissionDate}
                />
              </div>

              <div className="form-row">
                <FormField
                  label="Parent Name *"
                  name="parentName"
                  value={formData.parentName || ''}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter parent/guardian name"
                  error={errors.parentName}
                />
                <FormField
                  label="Parent Phone *"
                  name="parentPhone"
                  value={formData.parentPhone || ''}
                  onChange={handleInputChange}
                  type="tel"
                  placeholder="Enter parent phone number"
                  error={errors.parentPhone}
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating User...
                </>
              ) : (
                <>
                  <span className="btn-icon">👤</span>
                  Create User
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UserCreationModal;

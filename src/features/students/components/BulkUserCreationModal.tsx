import React, { useState, useEffect } from 'react';
import { Button, Card, Modal } from '@/components/common';
import { useUsers } from '@/hooks/data/useUsers';
import './BulkUserCreationModal.css';

interface BulkUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  class?: string;
  rollNumber?: string;
  isValid: boolean;
  errors: string[];
}

interface BulkUserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersCreated: () => void;
}

const BulkUserCreationModal: React.FC<BulkUserCreationModalProps> = ({ isOpen, onClose, onUsersCreated }) => {
  const { addUser } = useUsers({ autoFetch: false });
  const [step, setStep] = useState<'type' | 'template' | 'review' | 'creating' | 'success'>('type');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [quantity, setQuantity] = useState<number>(5);
  const [templateData, setTemplateData] = useState({
    firstName: '',
    lastName: '',
    emailPrefix: '',
    phoneBase: '',
    address: '',
    password: '',
    class: 'play'
  });
  const [users, setUsers] = useState<BulkUser[]>([]);

  const [creationResults, setCreationResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  }>({ successful: 0, failed: 0, errors: [] });

  const classes = ['play', 'nursery', 'lkg', 'ukg', '1st'];

  useEffect(() => {
    if (step === 'template' && templateData.emailPrefix && templateData.password) {
      generateUsers();
    }
  }, [templateData, quantity, userType, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateUsers = () => {
    const generatedUsers: BulkUser[] = [];
    
    for (let i = 1; i <= quantity; i++) {
      const userNumber = i.toString().padStart(2, '0');
      
      // Generate unique email
      const email = `${templateData.emailPrefix}${userNumber}@maplekids.com`;
      
      // Generate unique phone number
      let phone = '';
      if (templateData.phoneBase) {
        const baseNumber = templateData.phoneBase.replace(/\D/g, '');
        const lastDigits = (parseInt(baseNumber.slice(-2)) + i - 1).toString().padStart(2, '0');
        phone = baseNumber.slice(0, -2) + lastDigits;
      } else {
        phone = (9238612960 + i - 1).toString();
      }
      
      // Generate unique roll number for students
      let rollNumber = '';
      if (userType === 'student') {
        const classPrefix = templateData.class.substring(0, 3).toUpperCase();
        rollNumber = `${classPrefix}${userNumber}`;
      }

      const user: BulkUser = {
        id: `user-${i}`,
        firstName: '', // Leave empty for admin to fill individually
        lastName: '', // Leave empty for admin to fill individually
        email,
        phone,
        address: '', // Leave empty for admin to fill individually
        password: templateData.password,
        class: userType === 'student' ? templateData.class : undefined,
        rollNumber: userType === 'student' ? rollNumber : undefined,
        isValid: false, // Start as invalid since required fields are empty
        errors: ['First name is required', 'Last name is required', 'Address is required']
      };

      generatedUsers.push(user);
    }

    setUsers(generatedUsers);
  };

  const validateUser = (user: BulkUser): BulkUser => {
    const errors: string[] = [];
    
    if (!user.firstName.trim()) errors.push('First name is required');
    if (!user.lastName.trim()) errors.push('Last name is required');
    if (!user.email.trim()) errors.push('Email is required');
    if (!user.phone.trim()) errors.push('Phone is required');
    if (!user.password.trim()) errors.push('Password is required');
    if (userType === 'student' && !user.class) errors.push('Class is required');
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user.email && !emailRegex.test(user.email)) {
      errors.push('Invalid email format');
    }
    
    // Phone number validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (user.phone && !phoneRegex.test(user.phone)) {
      errors.push('Phone must be exactly 10 digits');
    }

    return {
      ...user,
      isValid: errors.length === 0,
      errors
    };
  };

  const updateUser = (userId: string, field: keyof BulkUser, value: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const updatedUser = { ...user, [field]: value };
        return validateUser(updatedUser);
      }
      return user;
    }));
  };

  const validateAllUsers = () => {
    setUsers(prev => prev.map(validateUser));
    const allValid = users.every(user => user.isValid);
    return allValid;
  };

  const handleCreateUsers = async () => {
    if (!validateAllUsers()) {
      alert('Please fix all validation errors before creating users.');
      return;
    }

    setStep('creating');
    
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      // Create users one by one to handle individual failures
      for (const user of users) {
        try {
          const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: userType,
            ...(userType === 'student' && {
              class: user.class,
              rollNumber: user.rollNumber
            })
          };

          await addUser(user.email, user.password, userData);
          results.successful++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${user.email}: ${error.message}`);
        }
      }

      setCreationResults(results);
      setStep('success');
      onUsersCreated();
    } catch (error) {
      console.error('Bulk creation error:', error);
      results.errors.push(`General error: ${error}`);
      setCreationResults(results);
      setStep('success');
    }
  };

  const resetModal = () => {
    setStep('type');
    setUserType('student');
    setQuantity(5);
    setTemplateData({
      firstName: '',
      lastName: '',
      emailPrefix: '',
      phoneBase: '',
      address: '',
      password: '',
      class: 'play'
    });
    setUsers([]);
    setCreationResults({ successful: 0, failed: 0, errors: [] });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'type':
        return (
          <div className="step-content">
            <h3>Select User Type and Quantity</h3>
            <div className="type-selection">
              <div className="type-option">
                <input
                  type="radio"
                  id="student"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={(e) => setUserType(e.target.value as 'student' | 'teacher')}
                />
                <label htmlFor="student" className="type-card">
                  <div className="type-icon">🎓</div>
                  <div className="type-info">
                    <h4>Students</h4>
                    <p>Create multiple student accounts with class assignments</p>
                  </div>
                </label>
              </div>
              <div className="type-option">
                <input
                  type="radio"
                  id="teacher"
                  name="userType"
                  value="teacher"
                  checked={userType === 'teacher'}
                  onChange={(e) => setUserType(e.target.value as 'student' | 'teacher')}
                />
                <label htmlFor="teacher" className="type-card">
                  <div className="type-icon">👨‍🏫</div>
                  <div className="type-info">
                    <h4>Teachers</h4>
                    <p>Create multiple teacher accounts</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="quantity-selector">
              <label htmlFor="quantity">Number of users to create:</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'template':
        return (
          <div className="step-content">
            <h3>Configure Auto-Generated Fields</h3>
            <p className="step-description">
              Set up the fields that will be auto-generated. Individual details (names, addresses) will be filled in the next step.
            </p>
            <div className="template-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Email Prefix</label>
                  <input
                    type="text"
                    value={templateData.emailPrefix}
                    onChange={(e) => setTemplateData({ ...templateData, emailPrefix: e.target.value })}
                    placeholder="e.g., student"
                    required
                  />
                  <small>Will generate: student01@maplekids.com, student02@maplekids.com, etc.</small>
                </div>
                <div className="form-group">
                  <label>Base Phone Number</label>
                  <input
                    type="text"
                    value={templateData.phoneBase}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      if (value.length <= 10) {
                        setTemplateData({ ...templateData, phoneBase: value });
                      }
                    }}
                    placeholder="e.g., 9238612960"
                    maxLength={10}
                    required
                  />
                  <small>Will generate: 9238612960, 9876543211, 9876543212, etc.</small>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Default Password</label>
                  <input
                    type="password"
                    value={templateData.password}
                    onChange={(e) => setTemplateData({ ...templateData, password: e.target.value })}
                    placeholder="Password for all users"
                    required
                  />
                  <small>Same password will be used for all {quantity} users</small>
                </div>
                {userType === 'student' && (
                  <div className="form-group">
                    <label>Class</label>
                    <select
                      value={templateData.class}
                      onChange={(e) => setTemplateData({ ...templateData, class: e.target.value })}
                    >
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls.toUpperCase()}</option>
                      ))}
                    </select>
                    <small>All students will be assigned to this class</small>
                  </div>
                )}
              </div>
              
              <div className="info-box">
                <h4>📝 What happens next:</h4>
                <ul>
                  <li><strong>Auto-generated:</strong> Email addresses, phone numbers, roll numbers (for students)</li>
                  <li><strong>You'll fill individually:</strong> First names, last names, addresses for each user</li>
                  <li><strong>Same for all:</strong> Password and class (for students)</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="step-content">
            <h3>Fill Individual User Details</h3>
            <p className="step-description">
              Fill in the individual details for each user. Email, phone, and roll numbers are auto-generated. You need to provide names and addresses for each user.
            </p>
            <div className="users-list">
              {users.map((user, index) => (
                <Card key={user.id} className={`user-card ${!user.isValid ? 'invalid' : ''}`}>
                  <div className="user-header">
                    <h4>User #{index + 1}</h4>
                    {!user.isValid && <span className="error-badge">Has Errors</span>}
                  </div>
                  <div className="user-fields">
                    <div className="field-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={user.firstName}
                        onChange={(e) => updateUser(user.id, 'firstName', e.target.value)}
                        className={user.errors.includes('First name is required') ? 'error' : ''}
                      />
                    </div>
                    <div className="field-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={user.lastName}
                        onChange={(e) => updateUser(user.id, 'lastName', e.target.value)}
                        className={user.errors.includes('Last name is required') ? 'error' : ''}
                      />
                    </div>
                    <div className="field-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={user.email}
                        onChange={(e) => updateUser(user.id, 'email', e.target.value)}
                        className={user.errors.some(e => e.includes('email')) ? 'error' : ''}
                      />
                    </div>
                    <div className="field-group">
                      <label>Phone</label>
                      <input
                        type="text"
                        value={user.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                          if (value.length <= 10) {
                            updateUser(user.id, 'phone', value);
                          }
                        }}
                        className={user.errors.some(e => e.includes('Phone')) ? 'error' : ''}
                        placeholder="10 digit number"
                      />
                    </div>
                    {userType === 'student' && (
                      <>
                        <div className="field-group">
                          <label>Class</label>
                          <select
                            value={user.class || ''}
                            onChange={(e) => updateUser(user.id, 'class', e.target.value)}
                          >
                            {classes.map(cls => (
                              <option key={cls} value={cls}>{cls.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field-group">
                          <label>Roll Number</label>
                          <input
                            type="text"
                            value={user.rollNumber || ''}
                            onChange={(e) => updateUser(user.id, 'rollNumber', e.target.value)}
                            readOnly
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {user.errors.length > 0 && (
                    <div className="user-errors">
                      {user.errors.map((error, idx) => (
                        <span key={idx} className="error-message">{error}</span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case 'creating':
        return (
          <div className="step-content creating">
            <div className="creating-animation">
              <div className="spinner"></div>
              <h3>Creating Users...</h3>
              <p>Please wait while we create {quantity} {userType}s. This may take a moment.</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="step-content success">
            <div className="success-icon">✅</div>
            <h3>Bulk User Creation Complete!</h3>
            <div className="results-summary">
              <div className="result-item success">
                <span className="result-number">{creationResults.successful}</span>
                <span className="result-label">Users Created Successfully</span>
              </div>
              {creationResults.failed > 0 && (
                <div className="result-item error">
                  <span className="result-number">{creationResults.failed}</span>
                  <span className="result-label">Failed to Create</span>
                </div>
              )}
            </div>
            {creationResults.errors.length > 0 && (
              <div className="error-details">
                <h4>Errors:</h4>
                <ul>
                  {creationResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'type': return 'Bulk User Creation - Step 1';
      case 'template': return 'Bulk User Creation - Step 2';
      case 'review': return 'Bulk User Creation - Step 3';
      case 'creating': return 'Creating Users...';
      case 'success': return 'Creation Complete';
      default: return 'Bulk User Creation';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'type':
        return userType && quantity > 0;
      case 'template':
        return templateData.emailPrefix && templateData.password && (userType === 'teacher' || templateData.class);
      case 'review':
        return users.length > 0 && users.every(user => user.isValid);
      default:
        return false;
    }
  };

  const getNextButtonText = () => {
    switch (step) {
      case 'type': return 'Next: Configure Settings';
      case 'template': return 'Next: Fill User Details';
      case 'review': return 'Create Users';
      default: return 'Next';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getStepTitle()}>
      <div className="bulk-user-creation-modal">
        <div className="step-indicator">
          <div className={`step ${step === 'type' ? 'active' : step === 'template' || step === 'review' || step === 'creating' || step === 'success' ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Select Type</span>
          </div>
          <div className={`step ${step === 'template' ? 'active' : step === 'review' || step === 'creating' || step === 'success' ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Template</span>
          </div>
          <div className={`step ${step === 'review' ? 'active' : step === 'creating' || step === 'success' ? 'completed' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Review</span>
          </div>
          <div className={`step ${step === 'creating' ? 'active' : step === 'success' ? 'completed' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Create</span>
          </div>
        </div>

        {renderStepContent()}

        <div className="modal-actions">
          {step !== 'creating' && step !== 'success' && (
            <>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              {step !== 'type' && (
                <Button variant="secondary" onClick={() => setStep(step === 'template' ? 'type' : 'template')}>
                  Previous
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => {
                  if (step === 'type') setStep('template');
                  else if (step === 'template') setStep('review');
                  else if (step === 'review') handleCreateUsers();
                }}
                disabled={!canProceed()}
              >
                {getNextButtonText()}
              </Button>
            </>
          )}
          {step === 'success' && (
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BulkUserCreationModal;

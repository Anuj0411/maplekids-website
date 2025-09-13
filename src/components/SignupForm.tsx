import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../firebase/services';
import './SignupForm.css';
import { FormField, Button } from './common';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  role: 'admin' | 'teacher' | 'general' | 'guest';
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  address?: string;
  role?: string;
}

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'guest'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string>('');
  // Removed unused step tracking - simplified form flow
  const [progress, setProgress] = useState(0);

  // Calculate progress based on filled fields
  useEffect(() => {
    const filledFields = Object.values(formData).filter(value => value !== '').length;
    const totalFields = Object.keys(formData).length;
    setProgress((filledFields / totalFields) * 100);
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.required');
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('validation.minLength', { min: 2 });
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.required');
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('validation.minLength', { min: 2 });
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.email');
    }

    if (!formData.password) {
      newErrors.password = t('validation.required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('validation.minLength', { min: 6 });
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('validation.required');
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('validation.phoneInvalid');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('validation.required');
    } else if (formData.address.trim().length < 10) {
      newErrors.address = t('validation.addressMin');
    }

    // Role is always 'guest' for new users, no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Clear Firebase error when user starts typing
    if (firebaseError) {
      setFirebaseError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFirebaseError('');

    try {
      // Create user with Firebase Auth
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: formData.role
      };

      await authService.signUp(formData.email, formData.password, userData);
      
      setSubmitSuccess(true);
      
      // Redirect to signin after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);

    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setFirebaseError('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        setFirebaseError('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setFirebaseError('Please enter a valid email address.');
      } else {
        setFirebaseError('An error occurred during signup. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, color: '#e0e0e0', text: '' };
    if (password.length < 6) return { strength: 25, color: '#ff4444', text: 'Weak' };
    if (password.length < 8) return { strength: 50, color: '#ffaa00', text: 'Fair' };
    if (password.length < 10) return { strength: 75, color: '#ffdd00', text: 'Good' };
    return { strength: 100, color: '#00dd00', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (submitSuccess) {
    return (
      <div className="form-success">
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h2>Account Created Successfully!</h2>
          <p>Welcome to Maplekids Play School, <strong>{formData.firstName} {formData.lastName}</strong>!</p>
          <p>Your account has been created with the role: <strong>{formData.role.toUpperCase()}</strong></p>
          <div className="success-details">
            <span>📧 Email: {formData.email}</span>
            <span>📞 Phone: {formData.phone}</span>
            <span>🏠 Address: {formData.address}</span>
          </div>
          <p className="redirect-message">Redirecting to sign in page...</p>
          <Link to="/signin" className="btn-primary">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">


      <div className="signup-card">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{Math.round(progress)}% Complete</span>
        </div>

        <div className="signup-header">
          <div className="header-icon">🏫</div>
          <h1>{t('auth.signup.title')}</h1>
          <p>{t('auth.signup.subtitle')}</p>
          <div className="header-features">
            <span className="feature-badge">🌟 {t('auth.signup.features.excellence')}</span>
            <span className="feature-badge">❤️ {t('auth.signup.features.care')}</span>
            <span className="feature-badge">🎓 {t('auth.signup.features.learning')}</span>
          </div>
        </div>

        {firebaseError && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {firebaseError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-section">
            <div className="section-header">
              <h3>👤 {t('auth.signup.sections.personal.title')}</h3>
              <p>{t('auth.signup.sections.personal.subtitle')}</p>
            </div>
            
            <div className="form-row">
              <FormField
                label={`${t('common.firstName')} *`}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter your first name"
                error={errors.firstName}
                className={errors.firstName ? 'error' : ''}
              />
              <FormField
                label={`${t('common.lastName')} *`}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter your last name"
                error={errors.lastName}
                className={errors.lastName ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <FormField
                label={`${t('common.email')} *`}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                placeholder="Enter your email address"
                error={errors.email}
                className={errors.email ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <FormField
                label={`${t('common.phone')} *`}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                type="tel"
                placeholder="Enter your 10-digit phone number"
                error={errors.phone}
                className={errors.phone ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <FormField
                label={`${t('common.address')} *`}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                as="textarea"
                placeholder="Enter your complete address"
                rows={3}
                error={errors.address}
                className={errors.address ? 'error' : ''}
              />
              <small className="help-text">{t('auth.signup.form.helpText')}</small>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>�� Account Security</h3>
              <p>{t('auth.signup.sections.security.subtitle')}</p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <FormField
                  label={`${t('common.password')} *`}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  type="password"
                  placeholder="Create a strong password"
                  error={errors.password}
                  className={errors.password ? 'error' : ''}
                />
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${passwordStrength.strength}%`, 
                        backgroundColor: passwordStrength.color 
                      }}
                    ></div>
                  </div>
                  <span className="strength-text">{passwordStrength.text}</span>
                </div>
                <small className="help-text">{t('auth.signup.form.passwordHelp')}</small>
              </div>
              
              <FormField
                label={`${t('common.confirmPassword')} *`}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                className={errors.confirmPassword ? 'error' : ''}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>🔐 {t('auth.signup.sections.access.title')}</h3>
              <p>{t('auth.signup.sections.access.subtitle')}</p>
            </div>
            
            <div className="access-info">
              <div className="access-header">
                <h4>{t('auth.signup.accessInfo.title')}</h4>
                <p>{t('auth.signup.accessInfo.description')}</p>
              </div>
              
              <div className="access-levels">
                <div className="access-level">
                  <div className="level-icon">👤</div>
                  <div className="level-content">
                    <h5>{t('auth.signup.accessInfo.levels.guest.title')}</h5>
                    <p>{t('auth.signup.accessInfo.levels.guest.description')}</p>
                    <div className="level-features">
                      <span>👁️ {t('auth.signup.accessInfo.levels.guest.features.view')}</span>
                      <span>📅 {t('auth.signup.accessInfo.levels.guest.features.events')}</span>
                      <span>🖼️ {t('auth.signup.accessInfo.levels.guest.features.gallery')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="access-level">
                  <div className="level-icon">👨‍👩‍👧‍👦</div>
                  <div className="level-content">
                    <h5>{t('auth.signup.accessInfo.levels.parent.title')}</h5>
                    <p>{t('auth.signup.accessInfo.levels.parent.description')}</p>
                    <div className="level-features">
                      <span>📊 {t('auth.signup.accessInfo.levels.parent.features.progress')}</span>
                      <span>📝 {t('auth.signup.accessInfo.levels.parent.features.attendance')}</span>
                      <span>📋 {t('auth.signup.accessInfo.levels.parent.features.notes')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="access-level">
                  <div className="level-icon">👩‍🏫</div>
                  <div className="level-content">
                    <h5>{t('auth.signup.accessInfo.levels.teacher.title')}</h5>
                    <p>{t('auth.signup.accessInfo.levels.teacher.description')}</p>
                    <div className="level-features">
                      <span>✅ {t('auth.signup.accessInfo.levels.teacher.features.attendance')}</span>
                      <span>👥 {t('auth.signup.accessInfo.levels.teacher.features.students')}</span>
                      <span>📊 {t('auth.signup.accessInfo.levels.teacher.features.reports')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="access-level">
                  <div className="level-icon">👨‍💼</div>
                  <div className="level-content">
                    <h5>{t('auth.signup.accessInfo.levels.admin.title')}</h5>
                    <p>{t('auth.signup.accessInfo.levels.admin.description')}</p>
                    <div className="level-features">
                      <span>👨‍🎓 {t('auth.signup.accessInfo.levels.admin.features.students')}</span>
                      <span>💰 {t('auth.signup.accessInfo.levels.admin.features.finance')}</span>
                      <span>👥 {t('auth.signup.accessInfo.levels.admin.features.users')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                  {t('auth.signup.form.creating')}
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  {t('auth.signup.form.createAccount')}
                </>
              )}
            </Button>
            <Link to="/" className="btn-secondary">
              <span className="btn-icon">🏠</span>
              {t('auth.signup.form.backHome')}
            </Link>
          </div>
        </form>

        <div className="form-footer">
          <div className="footer-content">
            <p>{t('auth.signup.form.alreadyHave')} <Link to="/signin" className="signin-link">{t('auth.signup.form.signIn')}</Link></p>
            <div className="footer-features">
              <span>🔒 {t('auth.signup.footer.secure')}</span>
              <span>📱 {t('auth.signup.footer.mobile')}</span>
              <span>⚡ {t('auth.signup.footer.quick')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;

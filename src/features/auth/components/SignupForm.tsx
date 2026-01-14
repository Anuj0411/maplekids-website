import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/firebase/services';
import { useForm, useFormValidation } from '@/hooks';
import './SignupForm.css';
import { FormField, Button } from '@/components/common';

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const validation = useFormValidation();

  // Use our custom form hook
  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      role: 'guest' as 'admin' | 'teacher' | 'general' | 'guest'
    },
    validate: (values) => ({
      firstName: validation.composeValidators(
        validation.rules.required(t('validation.required')),
        validation.rules.minLength(2, t('validation.minLength', { min: 2 }))
      )(values.firstName),
      
      lastName: validation.composeValidators(
        validation.rules.required(t('validation.required')),
        validation.rules.minLength(2, t('validation.minLength', { min: 2 }))
      )(values.lastName),
      
      email: validation.composeValidators(
        validation.rules.required(t('validation.required')),
        validation.rules.email(t('validation.email'))
      )(values.email),
      
      password: validation.composeValidators(
        validation.rules.required(t('validation.required')),
        validation.rules.minLength(6, t('validation.minLength', { min: 6 }))
      )(values.password),
      
      confirmPassword: values.password !== values.confirmPassword
        ? t('validation.passwordMismatch')
        : validation.rules.required(t('validation.required'))(values.confirmPassword),
      
      phone: validation.composeValidators(
        validation.rules.required(t('validation.required')),
        validation.rules.phone(t('validation.phoneInvalid'))
      )(values.phone),
      
      address: validation.composeValidators(
        validation.rules.required(t('validation.required')),
        validation.rules.minLength(10, t('validation.addressMin'))
      )(values.address),
    }),
    onSubmit: async (values) => {
      setFirebaseError('');

      try {
        const userData = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          role: values.role
        };

        await authService.signUp(values.email, values.password, userData);
        
        setSubmitSuccess(true);
        
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 3000);

      } catch (error: any) {
        console.error('Signup error:', error);
        
        if (error.code === 'auth/email-already-in-use') {
          setFirebaseError('An account with this email already exists. Please sign in instead.');
        } else if (error.code === 'auth/weak-password') {
          setFirebaseError('Password is too weak. Please choose a stronger password.');
        } else if (error.code === 'auth/invalid-email') {
          setFirebaseError('Please enter a valid email address.');
        } else {
          setFirebaseError('An error occurred during signup. Please try again.');
        }
      }
    }
  });

  // Calculate progress based on filled fields
  useEffect(() => {
    const filledFields = Object.values(values).filter(value => value !== '').length;
    const totalFields = Object.keys(values).length;
    setProgress((filledFields / totalFields) * 100);
  }, [values]);

  // Clear Firebase error when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleChange(e);
    if (firebaseError) {
      setFirebaseError('');
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, color: '#e0e0e0', text: '' };
    if (password.length < 6) return { strength: 25, color: '#ff4444', text: 'Weak' };
    if (password.length < 8) return { strength: 50, color: '#ffaa00', text: 'Fair' };
    if (password.length < 10) return { strength: 75, color: '#ffdd00', text: 'Good' };
    return { strength: 100, color: '#00dd00', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(values.password);

  if (submitSuccess) {
    return (
      <div className="form-success">
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h2>Account Created Successfully!</h2>
          <p>Welcome to Maplekids Play School, <strong>{values.firstName} {values.lastName}</strong>!</p>
          <p>Your account has been created with the role: <strong>{values.role.toUpperCase()}</strong></p>
          <div className="success-details">
            <span>📧 Email: {values.email}</span>
            <span>📞 Phone: {values.phone}</span>
            <span>🏠 Address: {values.address}</span>
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
                value={values.firstName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter your first name"
                error={errors.firstName}
                className={errors.firstName ? 'error' : ''}
              />
              <FormField
                label={`${t('common.lastName')} *`}
                name="lastName"
                value={values.lastName}
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
                value={values.email}
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
                value={values.phone}
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
                value={values.address}
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
                  value={values.password}
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
                value={values.confirmPassword}
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

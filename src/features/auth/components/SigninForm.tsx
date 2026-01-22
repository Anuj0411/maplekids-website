import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/firebase/services';
import { useAuth } from '@/hooks/auth/useAuth';
import { useForm, useFormValidation } from '@/hooks';
import './SigninForm.css';

const SigninForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, error: authError, loading: authLoading } = useAuth();
  const validation = useFormValidation();

  // Use our custom form hook
  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validate: (values) => ({
      email: validation.composeValidators(
        validation.rules.required('Email is required'),
        validation.rules.email('Please enter a valid email address')
      )(values.email),
      password: validation.rules.required('Password is required')(values.password),
    }),
    onSubmit: async (values) => {
      try {
        // Sign in with Firebase using useAuth hook
        await signIn(values.email, values.password);
        
        // Get user data to determine role and redirect
        const userData = await authService.getCurrentUserData();
        
        if (userData) {
          // Redirect based on user role
          switch (userData.role) {
            case 'admin':
              navigate('/admin-dashboard');
              break;
            case 'teacher':
              navigate('/teacher-dashboard');
              break;
            case 'student':
              navigate('/student-dashboard');
              break;
            default:
              navigate('/student-dashboard');
          }
        } else {
          navigate('/student-dashboard');
        }

      } catch (error: any) {
        // Error already handled by useAuth hook
        console.error('Signin error:', error);
      }
    }
  });

  // Clear auth error when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1>🔐 Welcome Back</h1>
          <p>Sign in to your Maplekids account</p>
        </div>

        {authError && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            {authError}
          </div>
        )}

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={authLoading}
          >
            {authLoading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="signin-footer">
          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../firebase/services';
import './SigninForm.css';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const SigninForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      // Sign in with Firebase
      await authService.signIn(formData.email, formData.password);
      
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
            navigate('/student-dashboard'); // Default to student dashboard
        }
      } else {
        // Fallback redirect
        navigate('/student-dashboard');
      }

    } catch (error: any) {
      console.error('Signin error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        setFirebaseError('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        setFirebaseError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setFirebaseError('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setFirebaseError('Too many failed attempts. Please try again later.');
      } else {
        setFirebaseError('An error occurred during sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1>🔐 Welcome Back</h1>
          <p>Sign in to your Maplekids account</p>
        </div>

        {firebaseError && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            {firebaseError}
          </div>
        )}

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
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
              value={formData.password}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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

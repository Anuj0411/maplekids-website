import React, { useState } from 'react';
import { Button } from '@/components/common';
import { sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/firebase/config';
import './PasswordResetModal.css';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  mode: 'self' | 'admin'; // self = user changes own password, admin = admin changes user password
  targetEmail?: string; // Used when admin changes password for another user
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  mode,
  targetEmail
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleDirectPasswordChange = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update to new password
      await updatePassword(user, newPassword);

      setSuccess('Password changed successfully!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else {
        setError(err.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPasswordReset = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      // Firebase client SDK doesn't allow updating another user's password
      // Send password reset email as the secure method
      if (targetEmail) {
        await sendPasswordResetEmail(auth, targetEmail);
        setSuccess(`Password reset email sent to ${targetEmail}. The user will need to click the link in their email to complete the password reset.`);
        setTimeout(() => {
          handleClose();
        }, 4000);
      }
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'admin' && targetEmail) {
      // Admin resetting another user's password
      await handleAdminPasswordReset();
    } else {
      // User changing their own password
      await handleDirectPasswordChange();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content password-reset-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔐 {mode === 'admin' && targetEmail ? 'Reset User Password' : 'Change Password'}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {mode === 'admin' && targetEmail ? (
            // Admin resetting another user's password
            <>
              <div className="admin-info">
                <p><strong>Setting new password for:</strong> {targetEmail}</p>
                <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                  Enter a new password for this user. The password must meet security requirements.
                </p>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="newPasswordAdmin">New Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPasswordAdmin"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <small className="password-requirements">
                    Must be at least 6 characters with uppercase, lowercase, and number
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPasswordAdmin">Confirm New Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPasswordAdmin"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="modal-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            // User changing their own password
            <>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit}>
                <>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <small className="password-requirements">
                    Must be at least 6 characters with uppercase, lowercase, and number
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              </>

              <div className="modal-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;

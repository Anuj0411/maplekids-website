import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...rest 
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const widthClasses = fullWidth ? 'w-full' : '';
  const loadingClasses = loading ? 'loading' : '';
  
  const combinedClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    widthClasses,
    loadingClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={combinedClasses} 
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <div className="spinner mr-2" style={{ width: '1rem', height: '1rem' }} />
      )}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;

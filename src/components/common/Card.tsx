import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  variant = 'default',
  padding = 'md',
  hover = true
}) => {
  const baseClasses = 'card';
  const variantClasses = {
    default: '',
    elevated: 'shadow-lg',
    outlined: 'border-2',
    filled: 'bg-secondary'
  }[variant];
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }[padding];
  
  const hoverClasses = hover ? 'hover:shadow-card-hover hover:-translate-y-1' : '';
  
  const combinedClasses = [
    baseClasses,
    variantClasses,
    paddingClasses,
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

// Card sub-components
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
);

export default Card;

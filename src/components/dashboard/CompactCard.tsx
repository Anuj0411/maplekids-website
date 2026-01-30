import React from 'react';
import './CompactCard.css';

export interface CompactCardProps {
  title?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  maxHeight?: string;
  noBorder?: boolean;
}

const CompactCard: React.FC<CompactCardProps> = ({
  title,
  children,
  headerAction,
  footer,
  className = '',
  padding = 'medium',
  maxHeight,
  noBorder = false
}) => {
  return (
    <div className={`compact-card ${noBorder ? 'no-border' : ''} ${className}`}>
      {(title || headerAction) && (
        <div className="compact-card-header">
          {title && <h3 className="compact-card-title">{title}</h3>}
          {headerAction && (
            <div className="compact-card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div 
        className={`compact-card-content padding-${padding}`}
        style={{ maxHeight }}
      >
        {children}
      </div>
      
      {footer && (
        <div className="compact-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default CompactCard;

import React, { ReactNode } from 'react';

export interface CompactCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  maxHeight?: string;
  noPadding?: boolean;
}

/**
 * CompactCard Component - Mobile-First Responsive Card Container
 * 
 * Features:
 * - Mobile: Full width, collapsible content
 * - Tablet+: Flexible width based on grid
 * - Optional max-height with scroll
 * - Header with optional actions
 * - Consistent styling across app
 */
const CompactCard: React.FC<CompactCardProps> = ({
  title,
  children,
  actions,
  className = '',
  maxHeight,
  noPadding = false,
}) => {
  return (
    <div
      className={`
        bg-white rounded-card shadow-card
        border border-gray-200
        overflow-hidden
        hover:shadow-card-hover
        transition-shadow duration-200
        ${className}
      `}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div
        className={`
          ${noPadding ? '' : 'p-4 sm:p-6'}
          ${maxHeight ? 'overflow-y-auto' : ''}
        `}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default CompactCard;

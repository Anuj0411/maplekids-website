import React from 'react';

export interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}

/**
 * StatCard Component - Mobile-First Responsive Card for displaying statistics
 * 
 * Features:
 * - Mobile: Full width, compact height
 * - Tablet: 50% width in grid
 * - Desktop: 25% width in grid
 * - Color variants with themed borders
 * - Optional trend indicator
 * - Smooth animations
 */
const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = 'primary',
  className = '',
  onClick,
}) => {
  const colorClasses = {
    primary: 'border-primary-500 bg-primary-50/50 hover:bg-primary-50',
    secondary: 'border-secondary-500 bg-secondary-50/50 hover:bg-secondary-50',
    success: 'border-success-500 bg-success-50/50 hover:bg-success-50',
    warning: 'border-warning-500 bg-warning-50/50 hover:bg-warning-50',
    danger: 'border-danger-500 bg-danger-50/50 hover:bg-danger-50',
  };

  const iconColorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-card bg-white p-4
        border-l-4 ${colorClasses[color]}
        shadow-card hover:shadow-card-hover
        transition-all duration-200 ease-in-out
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Icon and Value Container */}
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`text-3xl ${iconColorClasses[color]} mb-2`}>
          {icon}
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div
            className={`
              flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
              ${trend.isPositive 
                ? 'bg-success-100 text-success-700' 
                : 'bg-danger-100 text-danger-700'
              }
            `}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {value}
        </p>
      </div>

      {/* Label */}
      <p className="text-sm text-gray-600 font-medium leading-tight">
        {label}
      </p>
    </div>
  );
};

export default StatCard;

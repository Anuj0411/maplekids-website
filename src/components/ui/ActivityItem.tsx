import React from 'react';

export interface ActivityItemProps {
  icon: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: 'default' | 'success' | 'warning' | 'info';
}

/**
 * ActivityItem Component - For displaying recent activities/events
 * 
 * Features:
 * - Mobile-optimized layout
 * - Icon with color variants
 * - Timestamp display
 * - Truncated text on mobile
 */
const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  title,
  description,
  timestamp,
  type = 'default',
}) => {
  const typeColors = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    info: 'bg-primary-100 text-primary-600',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full 
        flex items-center justify-center
        ${typeColors[type]}
        text-sm
      `}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {title}
        </p>
        {description && (
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
            {description}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {timestamp}
        </p>
      </div>
    </div>
  );
};

export default ActivityItem;

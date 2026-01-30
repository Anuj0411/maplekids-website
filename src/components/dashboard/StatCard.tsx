import React from 'react';
import './StatCard.css';

export interface StatCardProps {
  icon?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  variant = 'default',
  className = '',
  onClick
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return '↗';
    if (trend.direction === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.direction === 'up') return 'trend-up';
    if (trend.direction === 'down') return 'trend-down';
    return 'trend-neutral';
  };

  return (
    <div 
      className={`stat-card stat-card-${variant} ${className} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-header">
        {icon && <span className="stat-card-icon">{icon}</span>}
        <h3 className="stat-card-title">{title}</h3>
      </div>
      
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {trend && (
          <div className={`stat-card-trend ${getTrendColor()}`}>
            <span className="trend-icon">{getTrendIcon()}</span>
            <span className="trend-value">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      {subtitle && (
        <div className="stat-card-footer">
          <p className="stat-card-subtitle">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default StatCard;

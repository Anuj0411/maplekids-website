import React, { ReactNode } from 'react';

export interface GridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

/**
 * Grid Component - Mobile-First Responsive Grid System
 * 
 * Default behavior:
 * - Mobile: 1 column
 * - Tablet (768px+): 2 columns
 * - Desktop (1024px+): 4 columns
 * 
 * Customizable via cols prop
 */
const Grid: React.FC<GridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 4 },
  gap = 4,
  className = '',
}) => {
  const gridCols = `
    grid-cols-${cols.mobile || 1}
    md:grid-cols-${cols.tablet || 2}
    lg:grid-cols-${cols.desktop || 4}
  `;

  const gridGap = `gap-${gap}`;

  return (
    <div className={`grid ${gridCols} ${gridGap} ${className}`}>
      {children}
    </div>
  );
};

export default Grid;

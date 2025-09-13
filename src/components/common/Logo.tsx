import React from 'react';
import maplekidsLogo from '../../assets/maplekids_logo.jpg';
import './Logo.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  className = '', 
  showText = true,
  animated = true 
}) => {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium', 
    large: 'logo-large',
    hero: 'logo-hero'
  };

  return (
    <div className={`logo-container ${sizeClasses[size]} ${className} ${animated ? 'logo-animated' : ''}`}>
      <div className="logo-image-wrapper">
        <img 
          src={maplekidsLogo} 
          alt="Maplekids Play School Logo" 
          className="logo-image"
        />
        <div className="logo-glow"></div>
      </div>
      {showText && (
        <div className="logo-text">
          <span className="logo-text-main">Maplekids</span>
          <span className="logo-text-sub">Play School</span>
        </div>
      )}
    </div>
  );
};

export default Logo;

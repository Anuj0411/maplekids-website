import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from './common/Header';
import IndianParentGuide from './IndianParentGuide';
import './ParentGuidePage.css';

const ParentGuidePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    // If we're on the Parent Guide page, navigate to HomePage first
    if (window.location.pathname === '/parent-guide') {
      // Navigate to HomePage with the section as a hash
      navigate(`/#${sectionId}`);
      return;
    }
    
    // If we're on HomePage, scroll to the section
    const element = document.getElementById(sectionId);
    if (element) {
      // Get header height to account for fixed header
      const header = document.querySelector('.header');
      const headerHeight = header ? header.getBoundingClientRect().height : 80;
      
      // Calculate the position to scroll to (accounting for header)
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20; // 20px extra padding
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="parent-guide-page">
      <Header scrollToSection={scrollToSection} />
      
      {/* Hero Section */}
      <div className="parent-guide-hero">
        <div className="hero-content">
          <h1>{t('indianParentGuide.title')}</h1>
          <p>{t('indianParentGuide.subtitle')}</p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">👶</span>
              <span>Age-specific guidance</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏛️</span>
              <span>Cultural considerations</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💡</span>
              <span>Practical tips & activities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Guide Component */}
      <IndianParentGuide />
    </div>
  );
};

export default ParentGuidePage;

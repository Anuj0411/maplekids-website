import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next'; // Removed unused import
import Logo from './Logo';
import LanguageToggle from './LanguageToggle';
import './Header.css';

interface HeaderProps {
  scrollToSection?: (sectionId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ scrollToSection }) => {
  const navigate = useNavigate();
  // const { t } = useTranslation(); // Removed unused import
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  // Additional cleanup on component mount to ensure clean state
  useEffect(() => {
    // Ensure body is scrollable on mount
    document.body.classList.remove('mobile-menu-open');
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, []);

  const handleMobileNavClick = (sectionId: string) => {
    // Close menu immediately to prevent interference
    setIsMobileMenuOpen(false);
    
    // Wait for menu to close, then scroll
    setTimeout(() => {
      if (scrollToSection) {
        scrollToSection(sectionId);
      }
    }, 100);
  };

  const handleDesktopNavClick = (sectionId: string) => {
    // Add small delay to ensure any animations complete
    setTimeout(() => {
      if (scrollToSection) {
        scrollToSection(sectionId);
      }
    }, 50);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate('/')}>
          <Logo size="small" showText={false} className="header-logo-image" />
          <div className="header-branding">
            <span className="header-brand-main">Maplekids</span>
            <span className="header-brand-sub">Play School</span>
          </div>
        </div>
        
        {scrollToSection && (
          <div className="header-navigation">
            <button 
              className="nav-tab" 
              onClick={() => handleDesktopNavClick('about')}
            >
              About
            </button>
            <button 
              className="nav-tab" 
              onClick={() => handleDesktopNavClick('why-maplekids')}
            >
              Why Maplekids
            </button>
            <button 
              className="nav-tab" 
              onClick={() => handleDesktopNavClick('games')}
            >
              Fun Games
            </button>
            <button 
              className="nav-tab" 
              onClick={() => handleDesktopNavClick('events')}
            >
              Events
            </button>
            <button 
              className="nav-tab" 
              onClick={() => handleDesktopNavClick('gallery')}
            >
              Gallery
            </button>
            <button 
              className="nav-tab" 
              onClick={() => handleDesktopNavClick('contact')}
            >
              Contact
            </button>
            <button 
              className="nav-special"
              onClick={() => navigate('/childcare-center')}
            >
              Child Care Center
            </button>
          </div>
        )}
        
        <div className="header-actions">
          <div className="desktop-language-switcher">
            <LanguageToggle />
          </div>
          <button 
            className="btn-primary btn-header"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={handleMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={handleMobileMenuToggle}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Navigation</h3>
              <button 
                className="mobile-menu-close"
                onClick={handleMobileMenuToggle}
                aria-label="Close mobile menu"
              >
                ×
              </button>
            </div>
            <nav className="mobile-nav">
              <button 
                className="mobile-nav-item"
                onClick={() => handleMobileNavClick('about')}
              >
                About
              </button>
              <button 
                className="mobile-nav-item"
                onClick={() => handleMobileNavClick('why-maplekids')}
              >
                Why Maplekids
              </button>
              <button 
                className="mobile-nav-item"
                onClick={() => handleMobileNavClick('games')}
              >
                Fun Games
              </button>
              <button 
                className="mobile-nav-item"
                onClick={() => handleMobileNavClick('events')}
              >
                Events
              </button>
              <button 
                className="mobile-nav-item"
                onClick={() => handleMobileNavClick('gallery')}
              >
                Gallery
              </button>
              <button 
                className="mobile-nav-item"
                onClick={() => handleMobileNavClick('contact')}
              >
                Contact
              </button>
              {/* <button 
                className="mobile-nav-special"
                onClick={() => navigate('/parent-guide')}
              >
                <span className="emoji">👨‍👩‍👧‍👦</span>
                Parent Guide
              </button> */}
              
              {/* Language Switcher in Mobile Menu */}
              <div className="mobile-language-section">
                <div className="mobile-language-label">Language / भाषा</div>
          <div className="mobile-language-switcher">
            <LanguageToggle />
          </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
export type { HeaderProps };

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SHOW_POPUP_EVERY_TIME, POPUP_DELAY_MS } from '../config/languagePopup';
import './LanguageSelectionPopup.css';

interface LanguageSelectionPopupProps {
  onLanguageSelect: (language: string) => void;
}

const LanguageSelectionPopup: React.FC<LanguageSelectionPopupProps> = ({ onLanguageSelect }) => {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (SHOW_POPUP_EVERY_TIME) {
      // Show popup every time (for testing)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, POPUP_DELAY_MS);
      return () => clearTimeout(timer);
    } else {
      // Show popup only once per user (production behavior)
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (!savedLanguage) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, POPUP_DELAY_MS);
        return () => clearTimeout(timer);
      } else {
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [i18n]);

  const handleLanguageSelect = (language: string) => {
    localStorage.setItem('selectedLanguage', language);
    i18n.changeLanguage(language);
    onLanguageSelect(language);
    setIsVisible(false);
  };

  const handleClose = () => {
    // If user closes without selecting, default to English
    localStorage.setItem('selectedLanguage', 'en');
    i18n.changeLanguage('en');
    onLanguageSelect('en');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Use hardcoded text to avoid translation key issues
  const texts = {
    select: 'Select Language',
    chooseLanguage: 'Please choose your preferred language',
    english: 'English',
    hindi: 'हिंदी',
    continue: 'Continue'
  };

  return (
    <div className="language-popup-overlay">
      <div className="language-popup">
        <div className="language-popup-header">
          <h3>{texts.select}</h3>
          <button 
            className="language-popup-close" 
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="language-popup-content">
          <p className="language-popup-description">
            {texts.chooseLanguage}
          </p>
          
          <div className="language-options">
            <button 
              className="language-option"
              onClick={() => handleLanguageSelect('en')}
            >
              <div className="language-flag">🇺🇸</div>
              <div className="language-info">
                <div className="language-name">{texts.english}</div>
                <div className="language-native">English</div>
              </div>
            </button>
            
            <button 
              className="language-option"
              onClick={() => handleLanguageSelect('hi')}
            >
              <div className="language-flag">🇮🇳</div>
              <div className="language-info">
                <div className="language-name">{texts.hindi}</div>
                <div className="language-native">हिंदी</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="language-popup-footer">
          <button 
            className="language-continue-btn"
            onClick={() => handleLanguageSelect('en')}
          >
            {texts.continue}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionPopup;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SHOW_POPUP_EVERY_TIME } from '../config/languagePopup';
import LanguageSelectionPopup from './LanguageSelectionPopup';

interface LanguageWrapperProps {
  children: React.ReactNode;
  startLanguageTimer?: boolean; // Control when language timer should start
}

const LanguageWrapper: React.FC<LanguageWrapperProps> = ({ children, startLanguageTimer = true }) => {
  const { i18n } = useTranslation();
  const [languageSelected, setLanguageSelected] = useState(false);

  useEffect(() => {
    if (!SHOW_POPUP_EVERY_TIME) {
      // Only check saved language if not showing popup every time
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        setLanguageSelected(true);
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [i18n]);

  const handleLanguageSelect = (language: string) => {
    setLanguageSelected(true);
    // Keep LTR layout for all languages (including Hindi)
    // Uncomment the lines below to enable RTL for Hindi
    // if (language === 'hi') {
    //   document.documentElement.setAttribute('dir', 'rtl');
    //   document.documentElement.setAttribute('lang', 'hi');
    // } else {
    //   document.documentElement.setAttribute('dir', 'ltr');
    //   document.documentElement.setAttribute('lang', 'en');
    // }
    
    // Always use LTR layout
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', language);
  };

  return (
    <>
      {!languageSelected && startLanguageTimer && (
        <LanguageSelectionPopup onLanguageSelect={handleLanguageSelect} />
      )}
      {children}
    </>
  );
};

export default LanguageWrapper;

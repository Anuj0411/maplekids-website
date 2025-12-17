import React from 'react';
import Switch from 'react-switch';
import { useTranslation } from 'react-i18next';
import './LanguageToggle.css';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const handleToggle = (checked: boolean) => {
    const newLanguage = checked ? 'en' : 'hi';
    i18n.changeLanguage(newLanguage);
    // Always use LTR layout
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', newLanguage);
  };

  return (
    <div className={`language-toggle ${className}`}>
      <div className="language-toggle-container">
        <span className="language-label">हिंदी</span>
        <Switch
          checked={isEnglish}
          onChange={handleToggle}
          onColor="#f59e0b"
          offColor="#e5e7eb"
          checkedIcon={
            <div className="switch-icon">
              <span className="flag">🇺🇸</span>
              <span className="code">EN</span>
            </div>
          }
          uncheckedIcon={
            <div className="switch-icon">
              <span className="flag">🇮🇳</span>
              <span className="code">हि</span>
            </div>
          }
          height={28}
          width={60}
          handleDiameter={24}
          borderRadius={14}
          activeBoxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          boxShadow="inset 0 2px 4px rgba(0, 0, 0, 0.1)"
        />
        <span className="language-label">English</span>
      </div>
    </div>
  );
};

export default LanguageToggle;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './IndianParentGuide.css';
import { getTopicContent } from './IndianParentGuideContent';

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  content: {
    overview: string;
    tips: string[];
    activities: string[];
    culturalNotes: string[];
    commonChallenges: string[];
    solutions: string[];
  };
}

const IndianParentGuide: React.FC = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('toddler');
  const [selectedTopic, setSelectedTopic] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentContent, setCurrentContent] = useState<any>(null);

  // Update content when age group or topic changes
  useEffect(() => {
    setCurrentContent(getTopicContent(selectedTopic, selectedAgeGroup));
  }, [selectedAgeGroup, selectedTopic]);

  const ageGroups = [
    { id: 'toddler', label: t('indianParentGuide.ageGroups.toddler'), icon: '👶' },
    { id: 'preschool', label: t('indianParentGuide.ageGroups.preschool'), icon: '🧒' },
    { id: 'early-primary', label: t('indianParentGuide.ageGroups.earlyPrimary'), icon: '👦' },
    { id: 'primary', label: t('indianParentGuide.ageGroups.primary'), icon: '👧' }
  ];


  const guideSections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Indian Parenting Overview',
      icon: '🏠',
      description: 'Understanding modern Indian parenting challenges and opportunities',
      content: currentContent || getTopicContent('overview', selectedAgeGroup)
    },
    {
      id: 'education',
      title: 'Education & Academic Success',
      icon: '📚',
      description: 'Navigating the Indian education system and academic pressure',
      content: currentContent || getTopicContent('education', selectedAgeGroup)
    },
    {
      id: 'values',
      title: 'Values & Character Building',
      icon: '🙏',
      description: 'Instilling Indian values and character development',
      content: currentContent || getTopicContent('values', selectedAgeGroup)
    },
    {
      id: 'health',
      title: 'Health & Nutrition',
      icon: '🥗',
      description: 'Indian approach to child health and nutrition',
      content: currentContent || getTopicContent('health', selectedAgeGroup)
    },
    {
      id: 'technology',
      title: 'Technology & Digital Parenting',
      icon: '📱',
      description: 'Managing technology use in Indian families',
      content: currentContent || getTopicContent('technology', selectedAgeGroup)
    }
  ];

  const filteredSections = guideSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = (section: GuideSection) => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="content-section">
            <h3>Overview</h3>
            <p>{section.content.overview}</p>
          </div>
        );
      case 'tips':
        return (
          <div className="content-section">
            <h3>Practical Tips</h3>
            <ul className="tips-list">
              {section.content.tips.map((tip, index) => (
                <li key={index} className="tip-item">
                  <span className="tip-icon">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'activities':
        return (
          <div className="content-section">
            <h3>Activities & Exercises</h3>
            <div className="activities-grid">
              {section.content.activities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <span className="activity-icon">🎯</span>
                  <p>{activity}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'cultural':
        return (
          <div className="content-section">
            <h3>Cultural Considerations</h3>
            <div className="cultural-notes">
              {section.content.culturalNotes.map((note, index) => (
                <div key={index} className="cultural-note">
                  <span className="cultural-icon">🏛️</span>
                  <p>{note}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'challenges':
        return (
          <div className="content-section">
            <h3>Common Challenges & Solutions</h3>
            <div className="challenges-solutions">
              {section.content.commonChallenges.map((challenge, index) => (
                <div key={index} className="challenge-solution">
                  <div className="challenge">
                    <span className="challenge-icon">⚠️</span>
                    <strong>Challenge:</strong> {challenge}
                  </div>
                  <div className="solution">
                    <span className="solution-icon">✅</span>
                    <strong>Solution:</strong> {section.content.solutions[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="indian-parent-guide">

      <div className="guide-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder={t('indianParentGuide.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="age-group-selector">
          <h3>Select Age Group:</h3>
          <div className="age-groups">
            {ageGroups.map((age) => (
              <button
                key={age.id}
                className={`age-group-btn ${selectedAgeGroup === age.id ? 'active' : ''}`}
                onClick={() => {
                  console.log('Age group changed to:', age.id);
                  setSelectedAgeGroup(age.id);
                }}
              >
                <span className="age-icon">{age.icon}</span>
                {age.label}
              </button>
            ))}
          </div>
          <div className="age-group-info">
            <p>Currently viewing: <strong>{ageGroups.find(age => age.id === selectedAgeGroup)?.label}</strong></p>
          </div>
        </div>
      </div>

      <div className="guide-content">
        <div className="sections-sidebar">
          <h3>Parenting Topics</h3>
          {filteredSections.map((section) => (
            <div 
              key={section.id} 
              className={`section-card ${selectedTopic === section.id ? 'active' : ''}`}
              data-topic={section.id}
              onClick={() => {
                console.log('Topic changed to:', section.id);
                setSelectedTopic(section.id);
                setActiveSection('overview'); // Reset to overview when changing topics
              }}
            >
              <div className="section-icon">{section.icon}</div>
              <div className="section-info">
                <h4>{section.title}</h4>
                <p>{section.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="main-content">
          <div className="content-header">
            <h2 className="current-topic-title">
              {guideSections.find(s => s.id === selectedTopic)?.icon} {guideSections.find(s => s.id === selectedTopic)?.title}
            </h2>
            <p className="current-topic-description">
              {guideSections.find(s => s.id === selectedTopic)?.description}
            </p>
          </div>
          
          <div className="content-navigation">
            <button
              className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              {t('indianParentGuide.sections.overview')}
            </button>
            <button
              className={`nav-btn ${activeSection === 'tips' ? 'active' : ''}`}
              onClick={() => setActiveSection('tips')}
            >
              {t('indianParentGuide.sections.tips')}
            </button>
            <button
              className={`nav-btn ${activeSection === 'activities' ? 'active' : ''}`}
              onClick={() => setActiveSection('activities')}
            >
              {t('indianParentGuide.sections.activities')}
            </button>
            <button
              className={`nav-btn ${activeSection === 'cultural' ? 'active' : ''}`}
              onClick={() => setActiveSection('cultural')}
            >
              {t('indianParentGuide.sections.cultural')}
            </button>
            <button
              className={`nav-btn ${activeSection === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveSection('challenges')}
            >
              {t('indianParentGuide.sections.challenges')}
            </button>
          </div>

          <div className="content-area">
            <div className="section-content">
              {currentContent && renderContent({ 
                id: selectedTopic,
                title: guideSections.find(s => s.id === selectedTopic)?.title || '',
                icon: guideSections.find(s => s.id === selectedTopic)?.icon || '',
                description: guideSections.find(s => s.id === selectedTopic)?.description || '',
                content: currentContent 
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default IndianParentGuide;

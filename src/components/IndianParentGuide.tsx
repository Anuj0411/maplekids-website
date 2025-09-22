import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './IndianParentGuide.css';
import { getLocalizedTopicContent } from './IndianParentGuideContentLocalized';

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
  
  // Interactive features state
  const [completedTips, setCompletedTips] = useState<Set<number>>(new Set());
  const [favoriteTips, setFavoriteTips] = useState<Set<number>>(new Set());
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [dailyChallenge, setDailyChallenge] = useState<string>('');
  const [showPersonalizedTips, setShowPersonalizedTips] = useState<boolean>(false);

  // Update content when age group or topic changes
  useEffect(() => {
    setCurrentContent(getLocalizedTopicContent(selectedTopic, selectedAgeGroup, t));
  }, [selectedAgeGroup, selectedTopic, t]);

  // Generate daily challenge
  useEffect(() => {
    generateDailyChallenge();
  }, []);

  const generateDailyChallenge = () => {
    const challenges = t('indianParentGuide.dailyChallenges', { returnObjects: true }) as string[];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setDailyChallenge(randomChallenge);
  };

  const toggleTipCompleted = (tipIndex: number) => {
    const newCompleted = new Set(completedTips);
    if (newCompleted.has(tipIndex)) {
      newCompleted.delete(tipIndex);
    } else {
      newCompleted.add(tipIndex);
    }
    setCompletedTips(newCompleted);
  };

  const toggleTipFavorite = (tipIndex: number) => {
    const newFavorites = new Set(favoriteTips);
    if (newFavorites.has(tipIndex)) {
      newFavorites.delete(tipIndex);
    } else {
      newFavorites.add(tipIndex);
    }
    setFavoriteTips(newFavorites);
  };

  const getPersonalizedRecommendations = () => {
    const recommendations = [];
    
    if (completedTips.size > 3) {
      recommendations.push(t('indianParentGuide.recommendations.greatProgress'));
    }
    
    if (favoriteTips.size > 0) {
      recommendations.push(t('indianParentGuide.recommendations.favoriteTechniques'));
    }
    
    if (selectedAgeGroup === 'toddler') {
      recommendations.push(t('indianParentGuide.recommendations.toddlerFocus'));
    }
    
    return recommendations;
  };

  const ageGroups = [
    { id: 'toddler', label: t('indianParentGuide.ageGroups.toddler'), icon: '👶' },
    { id: 'preschool', label: t('indianParentGuide.ageGroups.preschool'), icon: '🧒' },
    { id: 'early-primary', label: t('indianParentGuide.ageGroups.earlyPrimary'), icon: '👦' },
    { id: 'primary', label: t('indianParentGuide.ageGroups.primary'), icon: '👧' }
  ];


  const guideSections: GuideSection[] = [
    {
      id: 'overview',
      title: t('indianParentGuide.topics.overview.title'),
      icon: '🏠',
      description: t('indianParentGuide.topics.overview.description'),
      content: currentContent || getLocalizedTopicContent('overview', selectedAgeGroup, t)
    },
    {
      id: 'education',
      title: t('indianParentGuide.topics.education.title'),
      icon: '📚',
      description: t('indianParentGuide.topics.education.description'),
      content: currentContent || getLocalizedTopicContent('education', selectedAgeGroup, t)
    },
    {
      id: 'values',
      title: t('indianParentGuide.topics.values.title'),
      icon: '🙏',
      description: t('indianParentGuide.topics.values.description'),
      content: currentContent || getLocalizedTopicContent('values', selectedAgeGroup, t)
    },
    {
      id: 'health',
      title: t('indianParentGuide.topics.health.title'),
      icon: '🥗',
      description: t('indianParentGuide.topics.health.description'),
      content: currentContent || getLocalizedTopicContent('health', selectedAgeGroup, t)
    },
    {
      id: 'technology',
      title: t('indianParentGuide.topics.technology.title'),
      icon: '📱',
      description: t('indianParentGuide.topics.technology.description'),
      content: currentContent || getLocalizedTopicContent('technology', selectedAgeGroup, t)
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
            <h3>{t('indianParentGuide.content.overview')}</h3>
            <p>{section.content.overview}</p>
          </div>
        );
      case 'tips':
        return (
          <div className="content-section">
            <div className="tips-header">
              <h3>{t('indianParentGuide.content.interactiveTips')}</h3>
              <div className="tips-stats">
                <span className="stat-item">
                  {completedTips.size} {t('indianParentGuide.content.completed')}
                </span>
                <span className="stat-item">
                  {favoriteTips.size} {t('indianParentGuide.content.favorites')}
                </span>
              </div>
            </div>
            <ul className="tips-list">
              {section.content.tips.map((tip, index) => (
                <li key={index} className={`tip-item ${completedTips.has(index) ? 'completed' : ''} ${favoriteTips.has(index) ? 'favorite' : ''}`}>
                  <div className="tip-content">
                    <span className="tip-icon">💡</span>
                    <span className="tip-text">{tip}</span>
                    <div className="tip-actions">
                      <button
                        className={`action-btn complete-btn ${completedTips.has(index) ? 'active' : ''}`}
                        onClick={() => toggleTipCompleted(index)}
                        title={completedTips.has(index) ? t('indianParentGuide.content.markIncomplete') : t('indianParentGuide.content.markCompleted')}
                      >
                        {completedTips.has(index) ? '✓' : '○'}
                      </button>
                      <button
                        className={`action-btn favorite-btn ${favoriteTips.has(index) ? 'active' : ''}`}
                        onClick={() => toggleTipFavorite(index)}
                        title={favoriteTips.has(index) ? t('indianParentGuide.content.removeFromFavorites') : t('indianParentGuide.content.addToFavorites')}
                      >
                        {favoriteTips.has(index) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {getPersonalizedRecommendations().length > 0 && (
              <div className="personalized-recommendations">
                <h4>{t('indianParentGuide.content.personalizedRecommendations')}</h4>
                {getPersonalizedRecommendations().map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <span className="rec-icon">✨</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'activities':
        return (
          <div className="content-section">
            <h3>{t('indianParentGuide.content.activitiesExercises')}</h3>
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
            <h3>{t('indianParentGuide.content.culturalConsiderations')}</h3>
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
            <h3>{t('indianParentGuide.content.commonChallenges')}</h3>
            <div className="challenges-solutions">
              {section.content.commonChallenges.map((challenge, index) => (
                <div key={index} className="challenge-solution">
                  <div className="challenge">
                    <span className="challenge-icon">⚠️</span>
                    <strong>{t('indianParentGuide.content.challenge')}:</strong> {challenge}
                  </div>
                  <div className="solution">
                    <span className="solution-icon">✅</span>
                    <strong>{t('indianParentGuide.content.solution')}:</strong> {section.content.solutions[index]}
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
          <h3>{t('indianParentGuide.content.selectAgeGroup')}</h3>
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
            <p>{t('indianParentGuide.content.currentlyViewing')} <strong>{ageGroups.find(age => age.id === selectedAgeGroup)?.label}</strong></p>
          </div>
        </div>

        {/* Daily Challenge Section */}
        <div className="daily-challenge-section">
          <h3>{t('indianParentGuide.content.todaysChallenge')}</h3>
          <div className="challenge-card">
            <div className="challenge-content">
              <span className="challenge-icon">🎯</span>
              <div className="challenge-text">
                <p>{dailyChallenge}</p>
                <button 
                  className="challenge-btn"
                  onClick={generateDailyChallenge}
                >
                  {t('indianParentGuide.content.getNewChallenge')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="guide-content">
        <div className="sections-sidebar">
          <h3>{t('indianParentGuide.content.parentingTopics')}</h3>
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

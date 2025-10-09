import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';
import { eventService } from '../firebase/services';
import { Carousel } from './common';
import Header from './common/Header';
import WhatsAppEnquiryForm from './WhatsAppEnquiryForm';
import FlashAnnouncement from './FlashAnnouncement';
import { useAnnouncement } from '../contexts/AnnouncementContext';
import schoolImage from '../assets/school_image.jpg';
import backToSchool1 from '../assets/back_to_school.jpg';
import backToSchool2 from '../assets/back_to_school2.jpg';
import beauty from '../assets/beauty.jpg';
import convocation24 from '../assets/convocation24.jpg';
import dance from '../assets/dance.jpg';
import firstDay3 from '../assets/first_day3.jpg';
import firstDay4 from '../assets/first_day4.jpg';
import gannuBappa from '../assets/gannu_bappa.jpg';
import innocence from '../assets/innocence.jpg';
import summerCamp25 from '../assets/summercamp25.jpg';
import whatsappImage from '../assets/kids.jpg';
import creativeLearning from '../assets/creative_learning.jpg';
import sportsDay from '../assets/sports-day.jpg';
import earlyDevelopment from '../assets/early-development.jpeg';

// Use Event and 
//  types from services.ts
type Event = import("../firebase/services").Event;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [gameScore, setGameScore] = useState(0);
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [currentShape, setCurrentShape] = useState<string>('');
  const [shapeOptions, setShapeOptions] = useState<string[]>([]);
  const [showTitleAnimation, setShowTitleAnimation] = useState(true);
  const [visibleCharacters, setVisibleCharacters] = useState<string[]>([]);
  const animationStartedRef = useRef(false);
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  
  // Letter Hunt Game States
  const [isPlayingLetterHunt, setIsPlayingLetterHunt] = useState(false);
  const [letterHuntScore, setLetterHuntScore] = useState(0);
  const [targetLetter, setTargetLetter] = useState<string>('');
  const [letterOptions, setLetterOptions] = useState<string[]>([]);
  const [foundLetters, setFoundLetters] = useState<string[]>([]);
  
  // Number Count Game States
  const [isPlayingNumberCount, setIsPlayingNumberCount] = useState(false);
  const [numberCountScore, setNumberCountScore] = useState(0);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [objectOptions, setObjectOptions] = useState<number[]>([]);
  const [currentObjects, setCurrentObjects] = useState<string[]>([]);
  const { announcements, handleAnnouncementDismiss } = useAnnouncement();
  
  // WhatsApp Configuration - Replace with your actual WhatsApp number
  const whatsappNumber = '919238612960'; // Format: country code + number (no + sign)
  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    console.log('Scrolling to section:', sectionId); // Debug log
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      console.log('Element found:', element); // Debug log
      
      if (element) {
        // Get header height to account for fixed header
        const header = document.querySelector('.header');
        const headerHeight = header ? header.getBoundingClientRect().height : 80;
        console.log('Header height:', headerHeight); // Debug log
        
        // Calculate the position to scroll to (accounting for header)
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(0, elementPosition - headerHeight - 20); // 20px extra padding, ensure non-negative
        console.log('Scrolling to position:', offsetPosition); // Debug log
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        console.error('Element not found:', sectionId);
        // Try alternative selectors
        const altElement = document.querySelector(`[id="${sectionId}"]`);
        if (altElement) {
          console.log('Found element with alternative selector');
          const elementPosition = altElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, elementPosition - 100); // Default offset
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  };

  // Create carousel items from assets images
  const carouselItems = [
    {
      id: 'school-family',
      imageUrl: schoolImage
    },
    {
      id: 'back-to-school-1',
      imageUrl: backToSchool1
    },
    {
      id: 'back-to-school-2',
      imageUrl: backToSchool2
    },
    {
      id: 'beauty',
      imageUrl: beauty
    },
    {
      id: 'convocation-2024',
      imageUrl: convocation24
    },
    {
      id: 'dance',
      imageUrl: dance
    },
    {
      id: 'first-day-3',
      imageUrl: firstDay3
    },
    {
      id: 'first-day-4',
      imageUrl: firstDay4
    },
    {
      id: 'gannu-bappa',
      imageUrl: gannuBappa
    },
    {
      id: 'innocence',
      imageUrl: innocence
    },
    {
      id: 'summer-camp-2025',
      imageUrl: summerCamp25
    },
    {
      id: 'special-moment',
      imageUrl: whatsappImage
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const allEvents = await eventService.getAllEvents();
        
        // Filter for active events that are not past the current date
        // Handle both boolean true and string "true" for isActive
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const activeEvents = allEvents
          .filter(event => {
            const isActive = event.isActive === true || String(event.isActive) === "true";
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0); // Start of event date
            const isNotExpired = eventDate >= today;
            return isActive && isNotExpired;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setEvents(activeEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      }
    };

    loadData();

    // Start title animation immediately
    if (!animationStartedRef.current) {
      animationStartedRef.current = true;
      animateTitle();
    }
  }, []);

  // Handle hash navigation when page loads
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      if (hash) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          scrollToSection(hash);
        }, 500);
      }
    };

    // Handle initial hash
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);


  const animateTitle = () => {
    const title = "Maplekids";
    const characters = title.split('');
    
    // Clear existing characters first
    setVisibleCharacters([]);
    
    characters.forEach((char, index) => {
      setTimeout(() => {
        setVisibleCharacters(prev => [...prev, char]);
        // Hide animation after all characters are shown
        if (index === characters.length - 1) {
          setTimeout(() => {
            setShowTitleAnimation(false);
          }, 1000);
        }
      }, index * 200); // Each character appears 200ms after the previous
    });
  };

  // Interactive Shape Matching Game
  const startShapeGame = () => {
    setIsPlayingGame(true);
    setGameScore(0);
    generateNewShape();
  };

  const generateNewShape = () => {
    const shapes = ['🔴', '🔵', '🟡', '🟢', '🟠', '🟣', '⭐', '💎', '🌙', '☀️'];
    const correctShape = shapes[Math.floor(Math.random() * shapes.length)];
    setCurrentShape(correctShape);
    
    // Generate 4 options including the correct one
    const options = [correctShape];
    while (options.length < 4) {
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      if (!options.includes(randomShape)) {
        options.push(randomShape);
      }
    }
    // Shuffle options
    setShapeOptions(options.sort(() => Math.random() - 0.5));
  };

  const handleShapeGuess = (selectedShape: string) => {
    if (selectedShape === currentShape) {
      setGameScore(prev => prev + 10);
      // Show success animation
      setTimeout(() => {
        generateNewShape();
      }, 500);
    } else {
      setGameScore(prev => Math.max(0, prev - 5));
    }
  };

  // Letter Hunt Game Functions
  const startLetterHuntGame = () => {
    setIsPlayingLetterHunt(true);
    setLetterHuntScore(0);
    setFoundLetters([]);
    generateNewLetter();
  };

  const generateNewLetter = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    setTargetLetter(randomLetter);
    
    // Generate 6 random letters including the target
    const options = [randomLetter];
    while (options.length < 6) {
      const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!options.includes(randomChar)) {
        options.push(randomChar);
      }
    }
    setLetterOptions(options.sort(() => Math.random() - 0.5));
  };

  const handleLetterGuess = (selectedLetter: string) => {
    if (selectedLetter === targetLetter) {
      setLetterHuntScore(prev => prev + 10);
      setFoundLetters(prev => [...prev, selectedLetter]);
      setTimeout(() => {
        generateNewLetter();
      }, 500);
    } else {
      setLetterHuntScore(prev => Math.max(0, prev - 5));
    }
  };

  // Number Count Game Functions
  const startNumberCountGame = () => {
    setIsPlayingNumberCount(true);
    setNumberCountScore(0);
    generateNewNumber();
  };

  const generateNewNumber = () => {
    const targetNum = Math.floor(Math.random() * 10) + 1; // 1-10
    setTargetNumber(targetNum);
    
    // Generate objects
    const objects = ['🍎', '⭐', '🔵', '❤️', '🌟', '🎈', '🎯', '🎨', '🎪', '🎭'];
    const selectedObjects = [];
    for (let i = 0; i < targetNum; i++) {
      selectedObjects.push(objects[Math.floor(Math.random() * objects.length)]);
    }
    setCurrentObjects(selectedObjects);
    
    // Generate number options
    const options = [targetNum];
    while (options.length < 4) {
      const randomNum = Math.floor(Math.random() * 10) + 1;
      if (!options.includes(randomNum)) {
        options.push(randomNum);
      }
    }
    setObjectOptions(options.sort(() => Math.random() - 0.5));
  };

  const handleNumberGuess = (selectedNumber: number) => {
    if (selectedNumber === targetNumber) {
      setNumberCountScore(prev => prev + 10);
      setTimeout(() => {
        generateNewNumber();
      }, 500);
    } else {
      setNumberCountScore(prev => Math.max(0, prev - 5));
    }
  };




  return (
    <div className="home-container" dir={t('common.direction', { defaultValue: 'ltr' })}>
      {/* Header */}
      <Header scrollToSection={scrollToSection} />
      
      {/* Flash Announcements */}
      <FlashAnnouncement 
        announcements={announcements}
        onDismiss={handleAnnouncementDismiss}
      />
      
      {/* Floating Bubbles Background */}
      <div className="floating-bubbles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="bubble" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-branding">
            <div className="hero-school-name">
              {showTitleAnimation ? (
                <div className="animated-title">
                  {visibleCharacters.map((char, index) => (
                    <span key={index} className="jumping-char" style={{ animationDelay: `${index * 0.1}s` }}>
                      {char}
                    </span>
                  ))}
                </div>
              ) : (
                t('home.hero.title.line2')
              )}
            </div>
            <p className="hero-school-subtitle">{t('home.hero.title.line3')}</p>
          </div>
          
          <p className="hero-description">
            {t('home.hero.subtitle')}
          </p>
          
          <div className="hero-features">
            <div className="feature-tag">
              <span className="tag-icon">🎨</span>
              {t('home.hero.features.creative')}
            </div>
            <div className="feature-tag">
              <span className="tag-icon">🧠</span>
              {t('home.hero.features.development')}
            </div>
            <div className="feature-tag">
              <span className="tag-icon">❤️</span>
              {t('home.hero.features.care')}
            </div>
          </div>
          
        </div>
      </div>

      {/* Child Care Center Section */}
      <div className="childcare-cta-section">
        <div className="childcare-cta-background">
          <div className="floating-shapes">
            <div className="shape shape-1">🧠</div>
            <div className="shape shape-2">🔍</div>
            <div className="shape shape-3">📊</div>
            <div className="shape shape-4">🎯</div>
            <div className="shape shape-5">💡</div>
            <div className="shape shape-6">🌟</div>
          </div>
        </div>
        
        <div className="childcare-cta-content">
          <div className="childcare-cta-text">
            <div className="childcare-badge">
              <span className="badge-icon">✨</span>
              <span>{t('home.childcareCenter.badge')}</span>
            </div>
            <h2>
              <span className="title-icon">🧠</span>
              {t('home.childcareCenter.title')}
            </h2>
            <p className="main-description">
              {t('home.childcareCenter.subtitle')}
            </p>
            
            <div className="childcare-stats">
              <div className="stat-item">
                <div className="stat-number">{t('home.childcareCenter.stats.assessmentTools')}</div>
                <div className="stat-label">{t('home.childcareCenter.stats.assessmentToolsLabel')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{t('home.childcareCenter.stats.happyParents')}</div>
                <div className="stat-label">{t('home.childcareCenter.stats.happyParentsLabel')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{t('home.childcareCenter.stats.accuracyRate')}</div>
                <div className="stat-label">{t('home.childcareCenter.stats.accuracyRateLabel')}</div>
              </div>
            </div>

            <div className="childcare-features">
              <div className="childcare-feature">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🔍</span>
                </div>
                <div className="feature-content">
                  <h4>{t('home.childcareCenter.features.mchat.title')}</h4>
                  <p>{t('home.childcareCenter.features.mchat.description')}</p>
                </div>
              </div>
              <div className="childcare-feature">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🎯</span>
                </div>
                <div className="feature-content">
                  <h4>{t('home.childcareCenter.features.socialSkills.title')}</h4>
                  <p>{t('home.childcareCenter.features.socialSkills.description')}</p>
                </div>
              </div>
              <div className="childcare-feature">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">📊</span>
                </div>
                <div className="feature-content">
                  <h4>{t('home.childcareCenter.features.progressTracking.title')}</h4>
                  <p>{t('home.childcareCenter.features.progressTracking.description')}</p>
                </div>
              </div>
            </div>
            
            <div className="childcare-actions">
              <button 
                className="btn-childcare-primary"
                onClick={() => navigate('/childcare-center')}
              >
                <span className="btn-icon">🚀</span>
                {t('home.childcareCenter.actions.startAssessment')}
              </button>
              <button 
                className="btn-childcare-secondary"
                onClick={() => scrollToSection('contact')}
              >
                <span className="btn-icon">💬</span>
                {t('home.childcareCenter.actions.learnMore')}
              </button>
            </div>
          </div>
          
          <div className="childcare-cta-visual">
            <div className="visual-container">
              <div className="main-icon">🧠</div>
              <div className="orbit-ring">
                <div className="orbit-item orbit-1">🔍</div>
                <div className="orbit-item orbit-2">📊</div>
                <div className="orbit-item orbit-3">🎯</div>
                <div className="orbit-item orbit-4">💡</div>
              </div>
              <div className="pulse-ring"></div>
            </div>
          </div>
        </div>
      </div>

      {/* About Our School Section */}
      <div id="about" className="about-school-section">
        <div className="section-header">
          <h2 className="section-title">
            {t('home.about.title')}
          </h2>
          <p>{t('home.about.subtitle')}</p>
        </div>
        
        <div className="about-content">
          <div className="about-image">
            <Carousel 
              items={carouselItems.slice(0, 4)} // Show first 4 images
              autoPlay={true}
              autoPlayInterval={5000}
              showThumbnails={false}
              showIndicators={true}
              showNavigation={true}
              height="400px"
              className="about-carousel"
            />
          </div>
          
          <div className="about-text">
            <div className="about-highlight">
            </div>
            <p>{t('home.about.highlight.description')}</p>
            
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">{t('home.about.stats.happyFamilies')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">{t('home.about.stats.childFocusedCare')}</div>
              </div>
            </div>
            
            <div className="about-features">
              <div className="about-feature">
                <span className="feature-icon">👨‍👩‍👧‍👦</span>
                <span>{t('home.about.features.familyCentered')}</span>
              </div>
              <div className="about-feature">
                <span className="feature-icon">🎓</span>
                <span>{t('home.about.features.qualifiedTeachers')}</span>
              </div>
              <div className="about-feature">
                <span className="feature-icon">🌱</span>
                <span>{t('home.about.features.holisticDevelopment')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="why-maplekids" className="features-section">
        <div className="section-header">
          <h2 className="section-title">
            {t('home.features.title')}
          </h2>
          <p>{t('home.features.subtitle')}</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <div className="feature-icon">🎨</div>
                <h3>{t('home.features.creative.title')}</h3>
                <p>{t('home.features.creative.description')}</p>
                <div className="feature-highlight">{t('home.features.creative.highlight')}</div>
              </div>
              <div className="card-back">
                <div className="feature-image">
                  <img src={creativeLearning} alt={t('images.creativeLearning')} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <div className="feature-icon">🧠</div>
                <h3>{t('home.features.development.title')}</h3>
                <p>{t('home.features.development.description')}</p>
                <div className="feature-highlight">{t('home.features.development.highlight')}</div>
              </div>
              <div className="card-back">
                <div className="feature-image">
                  <img src={earlyDevelopment} alt={t('images.earlyDevelopment')} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <div className="feature-icon">❤️</div>
                <h3>{t('home.features.care.title')}</h3>
                <p>{t('home.features.care.description')}</p>
                <div className="feature-highlight">{t('home.features.care.highlight')}</div>
              </div>
              <div className="card-back">
                <div className="feature-image">
                  <img src={sportsDay} alt={t('images.sportsDay')} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <div className="feature-icon">🌱</div>
                <h3>{t('home.features.safety.title')}</h3>
                <p>{t('home.features.safety.description')}</p>
                <div className="feature-highlight">{t('home.features.safety.highlight')}</div>
              </div>
              <div className="card-back">
                <div className="feature-image">
                  <img src={innocence} alt={t('images.safeEnvironment')} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <div className="feature-icon">🎵</div>
                <h3>{t('home.features.music.title')}</h3>
                <p>{t('home.features.music.description')}</p>
                <div className="feature-highlight">{t('home.features.music.highlight')}</div>
              </div>
              <div className="card-back">
                <div className="feature-image">
                  <img src={dance} alt={t('images.musicMovement')} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-inner">
              <div className="card-front">
                <div className="feature-icon">🌍</div>
                <h3>{t('home.features.culture.title')}</h3>
                <p>{t('home.features.culture.description')}</p>
                <div className="feature-highlight">{t('home.features.culture.highlight')}</div>
              </div>
              <div className="card-back">
                <div className="feature-image">
                  <img src={schoolImage} alt={t('images.schoolImage')} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Games Section */}
      <div id="games" className="games-section">
        <div className="section-header">
          <h2 className="section-title">
            {t('home.games.title')}
          </h2>
          <p>{t('home.games.subtitle')}</p>
        </div>
        
        <div className="games-grid">
          <div className="game-card">
            <div className="game-header">
              <h3>🎯 {t('home.games.shapeMatching.title')}</h3>
              <div className="game-score">{t('home.games.shapeMatching.score')}: {gameScore}</div>
            </div>
            
            {!isPlayingGame ? (
              <div className="game-start">
                <p>{t('home.games.shapeMatching.description')}</p>
                <button className="btn-game-start" onClick={startShapeGame}>
                  {t('home.games.shapeMatching.start')}
                </button>
              </div>
            ) : (
              <div className="game-play">
                <div className="game-instruction">
                  <p>{t('home.games.shapeMatching.instruction')}</p>
                  <div className="target-shape">{currentShape}</div>
                </div>
                
                <div className="shape-options">
                  {shapeOptions.map((shape, index) => (
                    <button
                      key={index}
                      className="shape-option"
                      onClick={() => handleShapeGuess(shape)}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
                
                <button className="btn-game-reset" onClick={() => setIsPlayingGame(false)}>
                  {t('home.games.shapeMatching.endGame')}
                </button>
              </div>
            )}
          </div>
          
          <div className="game-card">
            <div className="game-header">
              <h3>🔤 {t('home.games.comingSoon.letterHunt')}</h3>
              <div className="game-score">{t('home.games.shapeMatching.score')}: {letterHuntScore}</div>
            </div>
            
            {!isPlayingLetterHunt ? (
              <div className="game-start">
                <p>{t('home.games.comingSoon.description')}</p>
                <button className="btn-game-start" onClick={startLetterHuntGame}>
                  {t('home.games.shapeMatching.start')}
                </button>
              </div>
            ) : (
              <div className="game-play">
                <div className="game-instruction">
                  <p>Find the letter: <strong>{targetLetter}</strong></p>
                  {foundLetters.length > 0 && (
                    <div className="found-letters">
                      <p>Found letters: {foundLetters.join(', ')}</p>
                    </div>
                  )}
                </div>
                
                <div className="letter-options">
                  {letterOptions.map((letter, index) => (
                    <button
                      key={index}
                      className="letter-option"
                      onClick={() => handleLetterGuess(letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                
                <button className="btn-game-reset" onClick={() => setIsPlayingLetterHunt(false)}>
                  {t('home.games.shapeMatching.endGame')}
                </button>
              </div>
            )}
          </div>
          
          <div className="game-card">
            <div className="game-header">
              <h3>🔢 {t('home.games.comingSoon.numberCount')}</h3>
              <div className="game-score">{t('home.games.shapeMatching.score')}: {numberCountScore}</div>
            </div>
            
            {!isPlayingNumberCount ? (
              <div className="game-start">
                <p>{t('home.games.comingSoon.description2')}</p>
                <button className="btn-game-start" onClick={startNumberCountGame}>
                  {t('home.games.shapeMatching.start')}
                </button>
              </div>
            ) : (
              <div className="game-play">
                <div className="game-instruction">
                  <p>Count the objects:</p>
                  <div className="objects-display">
                    {currentObjects.map((obj, index) => (
                      <span key={index} className="object-item">{obj}</span>
                    ))}
                  </div>
                </div>
                
                <div className="number-options">
                  {objectOptions.map((number, index) => (
                    <button
                      key={index}
                      className="number-option"
                      onClick={() => handleNumberGuess(number)}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                
                <button className="btn-game-reset" onClick={() => setIsPlayingNumberCount(false)}>
                  {t('home.games.shapeMatching.endGame')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Banner */}
      <div id="events" className="events-banner">
        <div className="banner-header">
          <h2>
            {t('home.events.title')}
          </h2>
          <div className="banner-controls">
            <span className="banner-indicator">
              {events.length} {t('home.events.activeEvents')}
            </span>
          </div>
        </div>
        <div className="banner-content">
          {events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <h3>{event.title}</h3>
                    <span className="event-status active">{t('status.active')}</span>
                  </div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <span className="event-detail">
                      <span className="detail-icon">📅</span>
                      {new Date(event.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="event-detail">
                      <span className="detail-icon">🕒</span>
                      {event.time}
                    </span>
                    <span className="event-detail">
                      <span className="detail-icon">📍</span>
                      {event.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events-message">
              <div className="no-events-icon">📅</div>
              <h3>{t('home.events.noEvents')}</h3>
              <p>{t('home.events.noEventsDesc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery with Carousel */}
      <div id="gallery" className="gallery-section">
        <div className="section-header">
          <h2 className="section-title">
            {t('home.gallery.title')}
          </h2>
          <p>{t('home.gallery.subtitle')}</p>
        </div>
        
        <div className="gallery-container">
          <Carousel 
            items={carouselItems}
            autoPlay={true}
            autoPlayInterval={4000}
            showThumbnails={true}
            showIndicators={true}
            showNavigation={true}
            height="600px"
            className="main-gallery-carousel"
          />
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <div className="cta-content">
          <div className="cta-visual">
            <div className="cta-shapes">
              <div className="cta-shape shape-1">🌟</div>
              <div className="cta-shape shape-2">🎈</div>
              <div className="cta-shape shape-3">📚</div>
            </div>
          </div>
          
          <div className="cta-text">
            <h2>{t('home.cta.title')}</h2>
            <p>{t('home.cta.description')}</p>
            
            <div className="cta-features">
              <div className="cta-feature">
                <span className="feature-check">✅</span>
                <span>{t('home.cta.features.trial')}</span>
              </div>
              <div className="cta-feature">
                <span className="feature-check">✅</span>
                <span>{t('home.cta.features.size')}</span>
              </div>
            </div>
            <button 
              className="btn-primary btn-cta"
              onClick={() => setShowWhatsAppForm(true)}
            >
              <span className="btn-icon">📱</span>
              {t('home.cta.whatsappButton')}
            </button>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Maplekids Play School</h3>
            <p>{t('home.footer.tagline')}</p>
          </div>
          
          <div className="footer-section">
            <h4>{t('home.footer.quickLinks')}</h4>
            <ul>
              <li><button onClick={() => navigate('/signin')}>{t('home.footer.studentPortal')}</button></li>
              <li><button onClick={() => navigate('/signin')}>{t('home.footer.teacherLogin')}</button></li>
              <li><a href="#about">{t('home.footer.aboutUs')}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>{t('home.footer.contactInfo')}</h4>
            <p>📞 {t('contact.phone')}</p>
            <p>📧 {t('contact.email')}</p>
            <p>📍 {t('contact.address')}</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Maplekids Play School. {t('home.footer.copyright')}</p>
        </div>
      </footer>

      {/* WhatsApp Enquiry Form Modal */}
      <WhatsAppEnquiryForm
        isOpen={showWhatsAppForm}
        onClose={() => setShowWhatsAppForm(false)}
        whatsappNumber={whatsappNumber}
        schoolName="Maple Kids Play School"
      />
    </div>
  );
};

export default HomePage;

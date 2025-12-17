import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './ChildCareCenter.css';
import Header from '../../../components/common/Header';
import Modal from '../../../components/common/Modal';

interface MCHATQuestion {
  id: number;
  question: string;
  options: {
    yes: string;
    no: string;
  };
  critical: boolean;
}

interface TestResult {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  nextSteps: string[];
}

interface MotorSkillsQuestion {
  id: number;
  category: 'manual_dexterity' | 'aiming_catching' | 'balance';
  question: string;
  options: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
  };
  ageGroup: '3-4' | '5-6' | '7-8' | '9-10' | '11-12' | '13-16';
}

interface SpeechLanguageQuestion {
  id: number;
  category: 'receptive_language' | 'expressive_language' | 'articulation' | 'pragmatic_language';
  question: string;
  options: {
    always: string;
    often: string;
    sometimes: string;
    rarely: string;
    never: string;
  };
  ageGroup: '2-3' | '3-4' | '4-5' | '5-6' | '6-7' | '7-8';
}

interface SocialSkillsQuestion {
  id: number;
  category: 'social_interaction' | 'emotional_regulation' | 'communication' | 'play_skills';
  question: string;
  options: {
    always: string;
    often: string;
    sometimes: string;
    rarely: string;
    never: string;
  };
  ageGroup: '2-3' | '3-4' | '4-5' | '5-6' | '6-7' | '7-8';
}

const ChildCareCenter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState<'mchat' | 'speech' | 'motor' | 'social' | null>(null);
  const [mchatAnswers, setMchatAnswers] = useState<Record<number, 'yes' | 'no' | null>>({});
  const [motorAnswers, setMotorAnswers] = useState<Record<number, 'excellent' | 'good' | 'fair' | 'poor' | null>>({});
  const [speechAnswers, setSpeechAnswers] = useState<Record<number, 'always' | 'often' | 'sometimes' | 'rarely' | 'never' | null>>({});
  const [socialAnswers, setSocialAnswers] = useState<Record<number, 'always' | 'often' | 'sometimes' | 'rarely' | 'never' | null>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  // const [childAge, setChildAge] = useState<'3-4' | '5-6' | '7-8' | '9-10' | '11-12' | '13-16'>('3-4'); // Removed unused state

  // M-CHAT Questions (Modified Checklist for Autism in Toddlers)
  const mchatQuestions: MCHATQuestion[] = React.useMemo(() => {
    const questions = t('childcareCenter.mchatTest.questions', { returnObjects: true });
    if (Array.isArray(questions)) {
      return questions.map((question: string, index: number) => ({
        id: index + 1,
        question,
        options: { yes: t('common.yes'), no: t('common.no') },
        critical: [6, 7, 14, 15].includes(index + 1) // Critical questions based on M-CHAT guidelines
      }));
    }
    return [];
  }, [t]);

  // Motor Skills Questions (Based on M-ABC - Movement Assessment Battery for Children)
  const motorSkillsQuestions: MotorSkillsQuestion[] = React.useMemo(() => {
    const questions = t('childcareCenter.motorSkillsTest.questions', { returnObjects: true });
    if (Array.isArray(questions)) {
      return questions.map((question: any, index: number) => ({
        id: index + 1,
        category: question.category || 'manual_dexterity',
        question: question.question || question,
        options: {
          excellent: t('childcareCenter.motorSkillsTest.options.excellent'),
          good: t('childcareCenter.motorSkillsTest.options.good'),
          fair: t('childcareCenter.motorSkillsTest.options.fair'),
          poor: t('childcareCenter.motorSkillsTest.options.poor')
        },
        ageGroup: question.ageGroup || '3-4'
      }));
    }
    
    // Fallback questions if translation fails
    return [
      {
        id: 1,
        category: 'manual_dexterity' as const,
        question: "Can your child pick up small objects (like beads or coins) using thumb and index finger?",
        options: {
          excellent: "Excellent",
          good: "Good", 
          fair: "Fair",
          poor: "Poor"
        },
        ageGroup: '3-4' as const
      },
      {
        id: 2,
        category: 'aiming_catching' as const,
        question: "Can your child catch a large ball (8-10 inches) thrown from 3 feet away?",
        options: {
          excellent: "Excellent",
          good: "Good",
          fair: "Fair", 
          poor: "Poor"
        },
        ageGroup: '3-4' as const
      },
      {
        id: 3,
        category: 'balance' as const,
        question: "Can your child walk on a straight line (like a curb or tape on floor)?",
        options: {
          excellent: "Excellent",
          good: "Good",
          fair: "Fair",
          poor: "Poor"
        },
        ageGroup: '3-4' as const
      }
    ];
  }, [t]);

  // Speech Language Questions (Based on standardized speech-language assessments)
  const speechLanguageQuestions: SpeechLanguageQuestion[] = React.useMemo(() => {
    const questions = t('childcareCenter.speechLanguageTest.questions', { returnObjects: true });
    if (Array.isArray(questions)) {
      return questions.map((question: any, index: number) => ({
        id: index + 1,
        category: question.category || 'receptive_language',
        question: question.question || question,
        options: {
          always: t('childcareCenter.speechLanguageTest.options.always'),
          often: t('childcareCenter.speechLanguageTest.options.often'),
          sometimes: t('childcareCenter.speechLanguageTest.options.sometimes'),
          rarely: t('childcareCenter.speechLanguageTest.options.rarely'),
          never: t('childcareCenter.speechLanguageTest.options.never')
        },
        ageGroup: question.ageGroup || '3-4'
      }));
    }
    
    // Fallback questions if translation fails
    return [
      {
        id: 1,
        category: 'receptive_language' as const,
        question: "Does your child follow simple one-step instructions (e.g., 'Get your shoes')?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '2-3' as const
      },
      {
        id: 2,
        category: 'expressive_language' as const,
        question: "Does your child use 2-3 word phrases to communicate needs?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '2-3' as const
      },
      {
        id: 3,
        category: 'articulation' as const,
        question: "Can others understand most of what your child says?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '3-4' as const
      },
      {
        id: 4,
        category: 'pragmatic_language' as const,
        question: "Does your child maintain eye contact during conversations?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '3-4' as const
      },
      {
        id: 5,
        category: 'receptive_language' as const,
        question: "Does your child understand 'who', 'what', 'where' questions?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '4-5' as const
      }
    ];
  }, [t]);

  // Social Skills Questions (Based on social-emotional development assessments)
  const socialSkillsQuestions: SocialSkillsQuestion[] = React.useMemo(() => {
    const questions = t('childcareCenter.socialSkillsTest.questions', { returnObjects: true });
    if (Array.isArray(questions)) {
      return questions.map((question: any, index: number) => ({
        id: index + 1,
        category: question.category || 'social_interaction',
        question: question.question || question,
        options: {
          always: t('childcareCenter.socialSkillsTest.options.always'),
          often: t('childcareCenter.socialSkillsTest.options.often'),
          sometimes: t('childcareCenter.socialSkillsTest.options.sometimes'),
          rarely: t('childcareCenter.socialSkillsTest.options.rarely'),
          never: t('childcareCenter.socialSkillsTest.options.never')
        },
        ageGroup: question.ageGroup || '3-4'
      }));
    }
    
    // Fallback questions if translation fails
    return [
      {
        id: 1,
        category: 'social_interaction' as const,
        question: "Does your child initiate play with other children?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '3-4' as const
      },
      {
        id: 2,
        category: 'emotional_regulation' as const,
        question: "Does your child calm down within 10-15 minutes after being upset?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '3-4' as const
      },
      {
        id: 3,
        category: 'communication' as const,
        question: "Does your child share toys or take turns during play?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '3-4' as const
      },
      {
        id: 4,
        category: 'play_skills' as const,
        question: "Does your child engage in pretend or imaginative play?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '3-4' as const
      },
      {
        id: 5,
        category: 'social_interaction' as const,
        question: "Does your child show empathy when others are hurt or sad?",
        options: {
          always: "Always",
          often: "Often",
          sometimes: "Sometimes",
          rarely: "Rarely",
          never: "Never"
        },
        ageGroup: '4-5' as const
      }
    ];
  }, [t]);

  const scrollToSection = (sectionId: string) => {
    // If we're on the ChildCareCenter page, navigate to HomePage first for HomePage sections
    if (window.location.pathname === '/childcare-center') {
      // Check if it's a HomePage section (not a ChildCareCenter section)
      const homePageSections = ['about', 'why-maplekids', 'games', 'events', 'gallery', 'contact'];
      if (homePageSections.includes(sectionId)) {
        // Navigate to HomePage with the section as a hash
        navigate(`/#${sectionId}`);
        return;
      }
    }
    
    // If it's a ChildCareCenter section or we're on HomePage, scroll to the section
    const element = document.getElementById(sectionId);
    if (element) {
      const header = document.querySelector('.header');
      const headerHeight = header ? header.getBoundingClientRect().height : 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const startMCHATTest = () => {
    setCurrentTest('mchat');
    setMchatAnswers({});
    setCurrentQuestion(0);
    setTestResult(null);
    setShowResults(false);
  };

  const handleMCHATAnswer = (answer: 'yes' | 'no') => {
    const newAnswers = { ...mchatAnswers, [mchatQuestions[currentQuestion].id]: answer };
    setMchatAnswers(newAnswers);

    if (currentQuestion < mchatQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMCHATResult(newAnswers);
    }
  };

  const calculateMCHATResult = (answers: Record<number, 'yes' | 'no' | null>) => {
    let score = 0;
    let criticalFailures = 0;

    mchatQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer === 'no') {
        score++;
        if (question.critical) {
          criticalFailures++;
        }
      }
    });

    let riskLevel: 'low' | 'medium' | 'high';
    let recommendations: string[];
    let nextSteps: string[];

    if (criticalFailures >= 2 || score >= 8) {
      riskLevel = 'high';
      recommendations = [
        "Immediate evaluation by a developmental pediatrician or autism specialist",
        "Contact your pediatrician for referral to early intervention services",
        "Consider comprehensive developmental assessment",
        "Begin early intervention services as soon as possible"
      ];
      nextSteps = [
        "Schedule appointment with developmental specialist within 2-4 weeks",
        "Contact local early intervention program",
        "Document your child's behaviors and concerns",
        "Consider speech and occupational therapy evaluation"
      ];
    } else if (score >= 3) {
      riskLevel = 'medium';
      recommendations = [
        "Follow-up screening in 1-2 months",
        "Monitor developmental milestones closely",
        "Consider developmental evaluation if concerns persist",
        "Engage in more social interaction activities"
      ];
      nextSteps = [
        "Repeat M-CHAT in 1-2 months",
        "Schedule well-child checkup with pediatrician",
        "Increase social play opportunities",
        "Monitor speech and social development"
      ];
    } else {
      riskLevel = 'low';
      recommendations = [
        "Continue monitoring normal development",
        "Maintain regular pediatric checkups",
        "Engage in age-appropriate activities",
        "Continue to observe social and communication skills"
      ];
      nextSteps = [
        "Continue routine pediatric care",
        "Repeat screening at next well-child visit",
        "Maintain stimulating home environment",
        "Monitor for any new concerns"
      ];
    }

    setTestResult({
      score,
      riskLevel,
      recommendations,
      nextSteps
    });
    setShowResults(true);
  };

  // Speech Language Test Functions
  const startSpeechLanguageTest = () => {
    if (speechLanguageQuestions.length === 0) {
      console.warn('No speech language questions available');
      return;
    }
    setCurrentTest('speech');
    setSpeechAnswers({});
    setCurrentQuestion(0);
    setTestResult(null);
    setShowResults(false);
  };

  const handleSpeechLanguageAnswer = (answer: 'always' | 'often' | 'sometimes' | 'rarely' | 'never') => {
    if (!speechLanguageQuestions[currentQuestion]) {
      console.warn('No question available at current index');
      return;
    }
    
    const newAnswers = { ...speechAnswers, [speechLanguageQuestions[currentQuestion].id]: answer };
    setSpeechAnswers(newAnswers);

    if (currentQuestion < speechLanguageQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateSpeechLanguageResult(newAnswers);
    }
  };

  const calculateSpeechLanguageResult = (answers: Record<number, 'always' | 'often' | 'sometimes' | 'rarely' | 'never' | null>) => {
    let totalScore = 0;
    let maxScore = 0;
    const categoryScores = {
      receptive_language: 0,
      expressive_language: 0,
      articulation: 0,
      pragmatic_language: 0
    };

    speechLanguageQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const score = answer === 'always' ? 5 : answer === 'often' ? 4 : answer === 'sometimes' ? 3 : answer === 'rarely' ? 2 : 1;
        totalScore += score;
        maxScore += 5;
        categoryScores[question.category] += score;
      }
    });

    const percentage = (totalScore / maxScore) * 100;
    let riskLevel: 'low' | 'medium' | 'high';
    let recommendations: string[];
    let nextSteps: string[];

    if (percentage >= 80) {
      riskLevel = 'low';
      recommendations = [
        "Your child's speech and language development is progressing well",
        "Continue encouraging communication through conversation and reading",
        "Maintain regular language-rich activities"
      ];
      nextSteps = [
        "Continue regular speech and language activities",
        "Monitor development and reassess in 6 months",
        "Maintain stimulating language environment"
      ];
    } else if (percentage >= 60) {
      riskLevel = 'medium';
      recommendations = [
        "Some areas of speech and language may need attention",
        "Focus on areas where your child shows difficulty",
        "Consider activities that target specific language skills"
      ];
      nextSteps = [
        "Practice specific language activities daily",
        "Consider speech-language therapy consultation",
        "Reassess in 3-4 months"
      ];
    } else {
      riskLevel = 'high';
      recommendations = [
        "Speech and language development needs professional attention",
        "Early intervention is recommended",
        "Comprehensive assessment by speech-language pathologist"
      ];
      nextSteps = [
        "Schedule speech-language therapy evaluation",
        "Contact pediatrician for referral",
        "Begin targeted language interventions"
      ];
    }

    setTestResult({
      score: Math.round(percentage),
      riskLevel,
      recommendations,
      nextSteps
    });
    setShowResults(true);
  };

  // Social Skills Test Functions
  const startSocialSkillsTest = () => {
    if (socialSkillsQuestions.length === 0) {
      console.warn('No social skills questions available');
      return;
    }
    setCurrentTest('social');
    setSocialAnswers({});
    setCurrentQuestion(0);
    setTestResult(null);
    setShowResults(false);
  };

  const handleSocialSkillsAnswer = (answer: 'always' | 'often' | 'sometimes' | 'rarely' | 'never') => {
    if (!socialSkillsQuestions[currentQuestion]) {
      console.warn('No question available at current index');
      return;
    }
    
    const newAnswers = { ...socialAnswers, [socialSkillsQuestions[currentQuestion].id]: answer };
    setSocialAnswers(newAnswers);

    if (currentQuestion < socialSkillsQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateSocialSkillsResult(newAnswers);
    }
  };

  const calculateSocialSkillsResult = (answers: Record<number, 'always' | 'often' | 'sometimes' | 'rarely' | 'never' | null>) => {
    let totalScore = 0;
    let maxScore = 0;
    const categoryScores = {
      social_interaction: 0,
      emotional_regulation: 0,
      communication: 0,
      play_skills: 0
    };

    socialSkillsQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const score = answer === 'always' ? 5 : answer === 'often' ? 4 : answer === 'sometimes' ? 3 : answer === 'rarely' ? 2 : 1;
        totalScore += score;
        maxScore += 5;
        categoryScores[question.category] += score;
      }
    });

    const percentage = (totalScore / maxScore) * 100;
    let riskLevel: 'low' | 'medium' | 'high';
    let recommendations: string[];
    let nextSteps: string[];

    if (percentage >= 80) {
      riskLevel = 'low';
      recommendations = [
        "Your child's social skills are developing well",
        "Continue encouraging social interactions and play",
        "Maintain opportunities for peer interaction"
      ];
      nextSteps = [
        "Continue regular social activities",
        "Monitor development and reassess in 6 months",
        "Maintain supportive social environment"
      ];
    } else if (percentage >= 60) {
      riskLevel = 'medium';
      recommendations = [
        "Some areas of social development may need attention",
        "Focus on areas where your child shows difficulty",
        "Consider activities that target specific social skills"
      ];
      nextSteps = [
        "Practice specific social activities daily",
        "Consider social skills therapy consultation",
        "Reassess in 3-4 months"
      ];
    } else {
      riskLevel = 'high';
      recommendations = [
        "Social skills development needs professional attention",
        "Early intervention is recommended",
        "Comprehensive assessment by developmental specialist"
      ];
      nextSteps = [
        "Schedule developmental evaluation",
        "Contact pediatrician for referral",
        "Begin targeted social skills interventions"
      ];
    }

    setTestResult({
      score: Math.round(percentage),
      riskLevel,
      recommendations,
      nextSteps
    });
    setShowResults(true);
  };

  const resetTest = () => {
    setCurrentTest(null);
    setMchatAnswers({});
    setMotorAnswers({});
    setSpeechAnswers({});
    setSocialAnswers({});
    setCurrentQuestion(0);
    setTestResult(null);
    setShowResults(false);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getProgressText = () => {
    const current = currentQuestion + 1;
    const total = mchatQuestions.length;
    const progressKey = 'childcareCenter.mchatTest.progress';
    
    try {
      const translated = t(progressKey, { current, total });
      // Check if translation worked (not just returned the key)
      if (translated && translated !== progressKey && translated.includes(current.toString())) {
        return translated;
      }
    } catch (error) {
      console.warn('Translation error:', error);
    }
    
    // Fallback to English template
    return `Question ${current} of ${total}`;
  };

  const getScoreText = () => {
    const total = mchatQuestions.length;
    const scoreKey = 'childcareCenter.results.outOf';
    
    try {
      const translated = t(scoreKey, { total });
      // Check if translation worked (not just returned the key)
      if (translated && translated !== scoreKey && translated.includes(total.toString())) {
        return translated;
      }
    } catch (error) {
      console.warn('Translation error:', error);
    }
    
    // Fallback to English template
    return `out of ${total} questions`;
  };

  // Motor Skills Test Functions
  const startMotorSkillsTest = () => {
    if (motorSkillsQuestions.length === 0) {
      console.warn('No motor skills questions available');
      return;
    }
    setCurrentTest('motor');
    setMotorAnswers({});
    setCurrentQuestion(0);
    setTestResult(null);
    setShowResults(false);
  };

  const handleMotorSkillsAnswer = (answer: 'excellent' | 'good' | 'fair' | 'poor') => {
    if (!motorSkillsQuestions[currentQuestion]) {
      console.warn('No question available at current index');
      return;
    }
    
    const newAnswers = { ...motorAnswers, [motorSkillsQuestions[currentQuestion].id]: answer };
    setMotorAnswers(newAnswers);

    if (currentQuestion < motorSkillsQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMotorSkillsResult(newAnswers);
    }
  };

  const calculateMotorSkillsResult = (answers: Record<number, 'excellent' | 'good' | 'fair' | 'poor' | null>) => {
    let totalScore = 0;
    let maxScore = 0;
    const categoryScores = {
      manual_dexterity: 0,
      aiming_catching: 0,
      balance: 0
    };

    motorSkillsQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const score = answer === 'excellent' ? 4 : answer === 'good' ? 3 : answer === 'fair' ? 2 : 1;
        totalScore += score;
        maxScore += 4;
        categoryScores[question.category] += score;
      }
    });

    const percentage = (totalScore / maxScore) * 100;
    let riskLevel: 'low' | 'medium' | 'high';
    let recommendations: string[];
    let nextSteps: string[];

    if (percentage >= 80) {
      riskLevel = 'low';
      recommendations = [
        "Your child's motor skills are developing well",
        "Continue encouraging physical activities and play",
        "Provide opportunities for both fine and gross motor skill practice"
      ];
      nextSteps = [
        "Maintain regular physical activity",
        "Continue age-appropriate play activities",
        "Monitor development and reassess in 6 months"
      ];
    } else if (percentage >= 60) {
      riskLevel = 'medium';
      recommendations = [
        "Some motor skills may need attention",
        "Focus on areas where your child shows difficulty",
        "Consider activities that target specific skill areas"
      ];
      nextSteps = [
        "Practice specific motor activities daily",
        "Consider occupational therapy consultation",
        "Reassess in 3-4 months"
      ];
    } else {
      riskLevel = 'high';
      recommendations = [
        "Motor skills development needs professional attention",
        "Early intervention is recommended",
        "Comprehensive assessment by occupational therapist"
      ];
      nextSteps = [
        "Schedule occupational therapy evaluation",
        "Contact pediatrician for referral",
        "Begin targeted motor skill interventions"
      ];
    }

    setTestResult({
      score: Math.round(percentage),
      riskLevel,
      recommendations,
      nextSteps
    });
    setShowResults(true);
  };

  const getMotorSkillsProgressText = () => {
    const current = currentQuestion + 1;
    const total = motorSkillsQuestions.length;
    const progressKey = 'childcareCenter.motorSkillsTest.progress';
    
    try {
      const translated = t(progressKey, { current, total });
      if (translated && translated !== progressKey && translated.includes(current.toString())) {
        return translated;
      }
    } catch (error) {
      console.warn('Translation error:', error);
    }
    
    return `Question ${current} of ${total}`;
  };

  return (
    <div className="childcare-center-container" dir={t('common.direction', { defaultValue: 'ltr' })}>
      <Header scrollToSection={scrollToSection} />
      
      {/* Hero Section */}
      <div className="childcare-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">🏥</span>
            {t('childcareCenter.hero.title')}
          </h1>
          <p className="hero-subtitle">
            {t('childcareCenter.hero.subtitle')}
          </p>
          <p className="hero-description">
            {t('childcareCenter.hero.description')}
          </p>
        </div>
      </div>

      {/* Available Tests Section */}
      <div id="tests" className="tests-section">
        <div className="section-header">
          <h2>{t('childcareCenter.tests.title')}</h2>
          <p>{t('childcareCenter.tests.subtitle')}</p>
        </div>

        <div className="tests-grid">
          <div className="test-card">
            <div className="test-icon">🧠</div>
            <h3>{t('childcareCenter.tests.mchat.title')}</h3>
            <p>{t('childcareCenter.tests.mchat.description')}</p>
            <div className="test-features">
              {(() => {
                const features = t('childcareCenter.tests.mchat.features', { returnObjects: true });
                return Array.isArray(features) ? features.map((feature: string, index: number) => (
                  <span key={index} className="feature-tag">{feature}</span>
                )) : null;
              })()}
            </div>
            <button 
              className="btn-test-start"
              onClick={startMCHATTest}
            >
              {t('childcareCenter.tests.mchat.startButton')}
            </button>
          </div>

          <div className="test-card">
            <div className="test-icon">🏃‍♂️</div>
            <h3>{t('childcareCenter.tests.motorSkills.title', { defaultValue: 'Motor Skills Assessment' })}</h3>
            <p>{t('childcareCenter.tests.motorSkills.description', { defaultValue: 'M-ABC based motor skills evaluation for children aged 3-16' })}</p>
            <div className="test-features">
              {(() => {
                const features = t('childcareCenter.tests.motorSkills.features', { returnObjects: true });
                return Array.isArray(features) ? features.map((feature: string, index: number) => (
                  <span key={index} className="feature-tag">{feature}</span>
                )) : null;
              })()}
            </div>
            <button 
              className="btn-test-start"
              onClick={startMotorSkillsTest}
              disabled={motorSkillsQuestions.length === 0}
            >
              {motorSkillsQuestions.length === 0 
                ? 'Loading...' 
                : t('childcareCenter.tests.motorSkills.startButton', { defaultValue: 'Start Motor Skills Test' })
              }
            </button>
          </div>

          <div className="test-card">
            <div className="test-icon">🗣️</div>
            <h3>{t('childcareCenter.tests.speech.title')}</h3>
            <p>{t('childcareCenter.tests.speech.description')}</p>
            <div className="test-features">
              {(() => {
                const features = t('childcareCenter.tests.speech.features', { returnObjects: true });
                return Array.isArray(features) ? features.map((feature: string, index: number) => (
                  <span key={index} className="feature-tag">{feature}</span>
                )) : null;
              })()}
            </div>
            <button 
              className="btn-test-start"
              onClick={startSpeechLanguageTest}
              disabled={speechLanguageQuestions.length === 0}
            >
              {speechLanguageQuestions.length === 0 
                ? 'Loading...' 
                : t('childcareCenter.tests.speech.startButton')
              }
            </button>
          </div>

          <div className="test-card">
            <div className="test-icon">👥</div>
            <h3>{t('childcareCenter.tests.social.title')}</h3>
            <p>{t('childcareCenter.tests.social.description')}</p>
            <div className="test-features">
              {(() => {
                const features = t('childcareCenter.tests.social.features', { returnObjects: true });
                return Array.isArray(features) ? features.map((feature: string, index: number) => (
                  <span key={index} className="feature-tag">{feature}</span>
                )) : null;
              })()}
            </div>
            <button 
              className="btn-test-start"
              onClick={startSocialSkillsTest}
              disabled={socialSkillsQuestions.length === 0}
            >
              {socialSkillsQuestions.length === 0 
                ? 'Loading...' 
                : t('childcareCenter.tests.social.startButton')
              }
            </button>
          </div>
        </div>
      </div>

      {/* M-CHAT Test Modal */}
      <Modal
        isOpen={currentTest === 'mchat' && !showResults}
        onClose={resetTest}
        title={t('childcareCenter.mchatTest.title')}
        className="mchat-modal"
      >
        <div className="mchat-test-container">
          <div className="test-progress">
            <div className="progress-info">
              {getProgressText()}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / mchatQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="question-container">
            <div className="question-number">
              {getProgressText()}
            </div>
            <h3 className="question-text">
              {mchatQuestions[currentQuestion].question}
            </h3>
            {mchatQuestions[currentQuestion].critical && (
              <div className="critical-indicator">
                {t('childcareCenter.mchatTest.criticalIndicator')}
              </div>
            )}

            <div className="answer-options">
              <button 
                className="answer-btn yes-btn"
                onClick={() => handleMCHATAnswer('yes')}
              >
                <span className="btn-icon">✅</span>
                {mchatQuestions[currentQuestion].options.yes}
              </button>
              <button 
                className="answer-btn no-btn"
                onClick={() => handleMCHATAnswer('no')}
              >
                <span className="btn-icon">❌</span>
                {mchatQuestions[currentQuestion].options.no}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Test Results Modal */}
      <Modal
        isOpen={showResults && !!testResult}
        onClose={resetTest}
        title={t('childcareCenter.results.title')}
        className="results-modal"
      >
        <div className="results-container">
          <div className="risk-level-header">
            <div 
              className="risk-level-badge"
              style={{ backgroundColor: getRiskLevelColor(testResult?.riskLevel || 'low') }}
            >
              {testResult && t(`childcareCenter.results.riskLevels.${testResult.riskLevel}`)}
            </div>
          </div>

          <div className="score-summary">
            <div className="score-display">
              <h3>{t('childcareCenter.results.score')}</h3>
              <div className="score-value">{testResult?.score}</div>
              <p>{getScoreText()}</p>
            </div>
          </div>

          <div className="results-content">
            <div className="recommendations-section">
              <h3>{t('childcareCenter.results.recommendations')}</h3>
              <ul>
                {testResult?.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="next-steps-section">
              <h3>{t('childcareCenter.results.nextSteps')}</h3>
              <ol>
                {testResult?.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="important-notice">
              <h4>{t('childcareCenter.results.importantNotice.title')}</h4>
              <p>
                {t('childcareCenter.results.importantNotice.text')}
              </p>
            </div>

            <div className="results-actions">
              <button 
                className="btn-primary"
                onClick={resetTest}
              >
                {t('childcareCenter.results.actions.takeAnotherTest')}
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/')}
              >
                {t('childcareCenter.results.actions.backToHome')}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Motor Skills Test Modal */}
      <Modal
        isOpen={currentTest === 'motor' && !showResults && motorSkillsQuestions.length > 0}
        onClose={resetTest}
        title={t('childcareCenter.motorSkillsTest.title', { defaultValue: 'Motor Skills Assessment' })}
        className="motor-skills-modal"
      >
        <div className="motor-skills-test-container">
          <div className="test-progress">
            <div className="progress-info">
              {getMotorSkillsProgressText()}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / motorSkillsQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="question-container">
            <div className="question-number">
              {getMotorSkillsProgressText()}
            </div>
            <h3 className="question-text">
              {motorSkillsQuestions[currentQuestion]?.question || 'Loading question...'}
            </h3>
            <div className="category-indicator">
              {(() => {
                const category = motorSkillsQuestions[currentQuestion]?.category;
                if (category) {
                  const categoryKey = `childcareCenter.motorSkillsTest.categories.${category}`;
                  const translated = t(categoryKey);
                  return translated !== categoryKey ? translated : category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
                return 'Motor Skills';
              })()}
            </div>

            <div className="answer-options">
              <button 
                className="answer-btn excellent-btn"
                onClick={() => handleMotorSkillsAnswer('excellent')}
              >
                <span className="btn-icon">⭐</span>
                {motorSkillsQuestions[currentQuestion]?.options?.excellent || 'Excellent'}
              </button>
              <button 
                className="answer-btn good-btn"
                onClick={() => handleMotorSkillsAnswer('good')}
              >
                <span className="btn-icon">👍</span>
                {motorSkillsQuestions[currentQuestion]?.options?.good || 'Good'}
              </button>
              <button 
                className="answer-btn fair-btn"
                onClick={() => handleMotorSkillsAnswer('fair')}
              >
                <span className="btn-icon">👌</span>
                {motorSkillsQuestions[currentQuestion]?.options?.fair || 'Fair'}
              </button>
              <button 
                className="answer-btn poor-btn"
                onClick={() => handleMotorSkillsAnswer('poor')}
              >
                <span className="btn-icon">👎</span>
                {motorSkillsQuestions[currentQuestion]?.options?.poor || 'Poor'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Speech Language Test Modal */}
      <Modal
        isOpen={currentTest === 'speech' && !showResults && speechLanguageQuestions.length > 0}
        onClose={resetTest}
        title={t('childcareCenter.speechLanguageTest.title', { defaultValue: 'Speech & Language Assessment' })}
        className="speech-language-modal"
      >
        <div className="speech-language-test-container">
          <div className="test-progress">
            <div className="progress-info">
              {(() => {
                const current = currentQuestion + 1;
                const total = speechLanguageQuestions.length;
                const progressKey = 'childcareCenter.speechLanguageTest.progress';
                
                try {
                  const translated = t(progressKey, { current, total });
                  if (translated && translated !== progressKey && translated.includes(current.toString())) {
                    return translated;
                  }
                } catch (error) {
                  console.warn('Translation error:', error);
                }
                
                return `Question ${current} of ${total}`;
              })()}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / speechLanguageQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="question-container">
            <div className="question-number">
              {(() => {
                const current = currentQuestion + 1;
                const total = speechLanguageQuestions.length;
                return `Question ${current} of ${total}`;
              })()}
            </div>
            <h3 className="question-text">
              {speechLanguageQuestions[currentQuestion]?.question || 'Loading question...'}
            </h3>
            <div className="category-indicator">
              {(() => {
                const category = speechLanguageQuestions[currentQuestion]?.category;
                if (category) {
                  const categoryKey = `childcareCenter.speechLanguageTest.categories.${category}`;
                  const translated = t(categoryKey);
                  return translated !== categoryKey ? translated : category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
                return 'Speech & Language';
              })()}
            </div>

            <div className="answer-options">
              <button 
                className="answer-btn always-btn"
                onClick={() => handleSpeechLanguageAnswer('always')}
              >
                <span className="btn-icon">⭐</span>
                {speechLanguageQuestions[currentQuestion]?.options?.always || 'Always'}
              </button>
              <button 
                className="answer-btn often-btn"
                onClick={() => handleSpeechLanguageAnswer('often')}
              >
                <span className="btn-icon">👍</span>
                {speechLanguageQuestions[currentQuestion]?.options?.often || 'Often'}
              </button>
              <button 
                className="answer-btn sometimes-btn"
                onClick={() => handleSpeechLanguageAnswer('sometimes')}
              >
                <span className="btn-icon">👌</span>
                {speechLanguageQuestions[currentQuestion]?.options?.sometimes || 'Sometimes'}
              </button>
              <button 
                className="answer-btn rarely-btn"
                onClick={() => handleSpeechLanguageAnswer('rarely')}
              >
                <span className="btn-icon">👎</span>
                {speechLanguageQuestions[currentQuestion]?.options?.rarely || 'Rarely'}
              </button>
              <button 
                className="answer-btn never-btn"
                onClick={() => handleSpeechLanguageAnswer('never')}
              >
                <span className="btn-icon">❌</span>
                {speechLanguageQuestions[currentQuestion]?.options?.never || 'Never'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Social Skills Test Modal */}
      <Modal
        isOpen={currentTest === 'social' && !showResults && socialSkillsQuestions.length > 0}
        onClose={resetTest}
        title={t('childcareCenter.socialSkillsTest.title', { defaultValue: 'Social Skills Assessment' })}
        className="social-skills-modal"
      >
        <div className="social-skills-test-container">
          <div className="test-progress">
            <div className="progress-info">
              {(() => {
                const current = currentQuestion + 1;
                const total = socialSkillsQuestions.length;
                const progressKey = 'childcareCenter.socialSkillsTest.progress';
                
                try {
                  const translated = t(progressKey, { current, total });
                  if (translated && translated !== progressKey && translated.includes(current.toString())) {
                    return translated;
                  }
                } catch (error) {
                  console.warn('Translation error:', error);
                }
                
                return `Question ${current} of ${total}`;
              })()}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / socialSkillsQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="question-container">
            <div className="question-number">
              {(() => {
                const current = currentQuestion + 1;
                const total = socialSkillsQuestions.length;
                return `Question ${current} of ${total}`;
              })()}
            </div>
            <h3 className="question-text">
              {socialSkillsQuestions[currentQuestion]?.question || 'Loading question...'}
            </h3>
            <div className="category-indicator">
              {(() => {
                const category = socialSkillsQuestions[currentQuestion]?.category;
                if (category) {
                  const categoryKey = `childcareCenter.socialSkillsTest.categories.${category}`;
                  const translated = t(categoryKey);
                  return translated !== categoryKey ? translated : category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
                return 'Social Skills';
              })()}
            </div>

            <div className="answer-options">
              <button 
                className="answer-btn always-btn"
                onClick={() => handleSocialSkillsAnswer('always')}
              >
                <span className="btn-icon">⭐</span>
                {socialSkillsQuestions[currentQuestion]?.options?.always || 'Always'}
              </button>
              <button 
                className="answer-btn often-btn"
                onClick={() => handleSocialSkillsAnswer('often')}
              >
                <span className="btn-icon">👍</span>
                {socialSkillsQuestions[currentQuestion]?.options?.often || 'Often'}
              </button>
              <button 
                className="answer-btn sometimes-btn"
                onClick={() => handleSocialSkillsAnswer('sometimes')}
              >
                <span className="btn-icon">👌</span>
                {socialSkillsQuestions[currentQuestion]?.options?.sometimes || 'Sometimes'}
              </button>
              <button 
                className="answer-btn rarely-btn"
                onClick={() => handleSocialSkillsAnswer('rarely')}
              >
                <span className="btn-icon">👎</span>
                {socialSkillsQuestions[currentQuestion]?.options?.rarely || 'Rarely'}
              </button>
              <button 
                className="answer-btn never-btn"
                onClick={() => handleSocialSkillsAnswer('never')}
              >
                <span className="btn-icon">❌</span>
                {socialSkillsQuestions[currentQuestion]?.options?.never || 'Never'}
              </button>
            </div>
          </div>
        </div>
      </Modal>


      {/* Footer */}
      <footer className="childcare-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t('childcareCenter.footer.title')}</h3>
            <p>{t('childcareCenter.footer.tagline')}</p>
          </div>
          
          <div className="footer-section">
            <h4>{t('childcareCenter.footer.quickLinks')}</h4>
            <ul>
              <li><button onClick={() => navigate('/')}>{t('childcareCenter.footer.home')}</button></li>
              <li><button onClick={() => scrollToSection('tests')}>{t('childcareCenter.footer.screeningTools')}</button></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>{t('childcareCenter.footer.contactSupport')}</h4>
            <p>📞 {t('childcareCenter.footer.phone')}</p>
            <p>📧 {t('childcareCenter.footer.email')}</p>
            <p>📍 {t('childcareCenter.footer.address')}</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Maplekids Play School. {t('childcareCenter.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default ChildCareCenter;

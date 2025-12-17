import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import ChildCareCenter from '../components/ChildCareCenter';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock i18n
const mockT = jest.fn((key, options) => {
  const translations: Record<string, any> = {
    'childcareCenter.hero.title': 'Child Development Hub',
    'childcareCenter.hero.subtitle': 'Comprehensive assessment tools to track your child\'s growth and development',
    'childcareCenter.hero.description': 'Monitor your child\'s developmental milestones with our evidence-based screening tools.',
    'childcareCenter.tests.title': 'Assessment Tools',
    'childcareCenter.tests.subtitle': 'Track your child\'s development with our comprehensive evaluation tools',
    'childcareCenter.tests.mchat.title': 'M-CHAT Test',
    'childcareCenter.tests.mchat.description': 'Modified Checklist for Autism in Toddlers - Ages 16-30 months',
    'childcareCenter.tests.mchat.features': ['Autism Screening', '23 Questions', '5-10 minutes'],
    'childcareCenter.tests.mchat.startButton': 'Start M-CHAT Test',
    'childcareCenter.tests.motorSkills.title': 'Motor Skills Assessment',
    'childcareCenter.tests.motorSkills.description': 'M-ABC based motor skills evaluation for children aged 3-16',
    'childcareCenter.tests.motorSkills.features': ['Gross Motor', 'Fine Motor', 'Balance Assessment'],
    'childcareCenter.tests.motorSkills.startButton': 'Start Motor Skills Test',
    'childcareCenter.tests.speech.title': 'Speech & Language Assessment',
    'childcareCenter.tests.speech.description': 'Comprehensive speech and language development evaluation',
    'childcareCenter.tests.speech.features': ['Receptive Language', 'Expressive Language', 'Articulation'],
    'childcareCenter.tests.speech.startButton': 'Start Speech Test',
    'childcareCenter.tests.social.title': 'Social Skills Assessment',
    'childcareCenter.tests.social.description': 'Social-emotional development and interaction skills evaluation',
    'childcareCenter.tests.social.features': ['Social Interaction', 'Emotional Regulation', 'Communication'],
    'childcareCenter.tests.social.startButton': 'Start Social Skills Test',
    'childcareCenter.mchatTest.title': 'M-CHAT Assessment',
    'childcareCenter.mchatTest.progress': 'Question {current} of {total}',
    'childcareCenter.mchatTest.criticalIndicator': 'Critical Question',
    'childcareCenter.mchatTest.questions': [
      'Does your child look at you when you call his/her name?',
      'Does your child point to show you something interesting?',
      'Does your child bring objects to you to show you?'
    ],
    'childcareCenter.motorSkillsTest.title': 'Motor Skills Assessment',
    'childcareCenter.motorSkillsTest.progress': 'Question {current} of {total}',
    'childcareCenter.motorSkillsTest.questions': [
      { question: 'Can your child walk up stairs alternating feet?', ageGroup: '3-4' },
      { question: 'Can your child catch a large ball with both hands?', ageGroup: '3-4' }
    ],
    'childcareCenter.motorSkillsTest.options.excellent': 'Excellent',
    'childcareCenter.motorSkillsTest.options.good': 'Good',
    'childcareCenter.motorSkillsTest.options.fair': 'Fair',
    'childcareCenter.motorSkillsTest.options.poor': 'Poor',
    'childcareCenter.speechLanguageTest.title': 'Speech & Language Assessment',
    'childcareCenter.speechLanguageTest.progress': 'Question {current} of {total}',
    'childcareCenter.speechLanguageTest.questions': [
      { question: 'Does your child follow simple one-step instructions?', ageGroup: '2-3' },
      { question: 'Does your child use 2-word phrases?', ageGroup: '2-3' }
    ],
    'childcareCenter.speechLanguageTest.options.always': 'Always',
    'childcareCenter.speechLanguageTest.options.often': 'Often',
    'childcareCenter.speechLanguageTest.options.sometimes': 'Sometimes',
    'childcareCenter.speechLanguageTest.options.rarely': 'Rarely',
    'childcareCenter.speechLanguageTest.options.never': 'Never',
    'childcareCenter.socialSkillsTest.title': 'Social Skills Assessment',
    'childcareCenter.socialSkillsTest.progress': 'Question {current} of {total}',
    'childcareCenter.socialSkillsTest.questions': [
      { question: 'Does your child make eye contact when talking?', ageGroup: '2-3' },
      { question: 'Does your child share toys with other children?', ageGroup: '2-3' }
    ],
    'childcareCenter.socialSkillsTest.options.always': 'Always',
    'childcareCenter.socialSkillsTest.options.often': 'Often',
    'childcareCenter.socialSkillsTest.options.sometimes': 'Sometimes',
    'childcareCenter.socialSkillsTest.options.rarely': 'Rarely',
    'childcareCenter.socialSkillsTest.options.never': 'Never',
    'childcareCenter.results.title': 'Assessment Results',
    'childcareCenter.results.score': 'Score',
    'childcareCenter.results.outOf': 'out of {total}',
    'childcareCenter.results.riskLevels.low': 'Low Risk',
    'childcareCenter.results.riskLevels.medium': 'Medium Risk',
    'childcareCenter.results.riskLevels.high': 'High Risk',
    'childcareCenter.results.recommendations': 'Recommendations',
    'childcareCenter.results.nextSteps': 'Next Steps'
  };
  
  if (options && options.returnObjects) {
    return translations[key] || [];
  }
  
  if (options && options.current && options.total) {
    return translations[key]?.replace('{current}', options.current).replace('{total}', options.total) || key;
  }
  
  return translations[key] || key;
});

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: mockT,
    i18n: { language: 'en' }
  }),
}));

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('ChildCareCenter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders hero section with correct title and description', () => {
      renderWithI18n(<ChildCareCenter />);
      
      expect(screen.getByText('Child Development Hub')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive assessment tools to track your child\'s growth and development')).toBeInTheDocument();
      expect(screen.getByText('Monitor your child\'s developmental milestones with our evidence-based screening tools.')).toBeInTheDocument();
    });

    test('renders all four assessment test cards', () => {
      renderWithI18n(<ChildCareCenter />);
      
      expect(screen.getByText('M-CHAT Test')).toBeInTheDocument();
      expect(screen.getByText('Motor Skills Assessment')).toBeInTheDocument();
      expect(screen.getByText('Speech & Language Assessment')).toBeInTheDocument();
      expect(screen.getByText('Social Skills Assessment')).toBeInTheDocument();
    });

    test('renders start buttons for all tests', () => {
      renderWithI18n(<ChildCareCenter />);
      
      expect(screen.getByText('Start M-CHAT Test')).toBeInTheDocument();
      expect(screen.getByText('Start Motor Skills Test')).toBeInTheDocument();
      expect(screen.getByText('Start Speech Test')).toBeInTheDocument();
      expect(screen.getByText('Start Social Skills Test')).toBeInTheDocument();
    });
  });

  describe('M-CHAT Test Functionality', () => {
    test('opens M-CHAT test modal when start button is clicked', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
    });

    test('displays first question when M-CHAT test starts', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
        expect(screen.getByText('Does your child look at you when you call his/her name?')).toBeInTheDocument();
      });
    });

    test('shows progress bar during M-CHAT test', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const progressBar = document.querySelector('.progress-fill');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveStyle('width: 33.333333333333336%'); // 1/3 * 100
      });
    });

    test('advances to next question when answer is selected', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
        expect(screen.getByText('Does your child point to show you something interesting?')).toBeInTheDocument();
      });
    });

    test('completes M-CHAT test and shows results', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Answer all questions
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const yesButton = screen.getByText('Yes');
          fireEvent.click(yesButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
        expect(screen.getByText('Score')).toBeInTheDocument();
      });
    });
  });

  describe('Motor Skills Test Functionality', () => {
    test('opens Motor Skills test modal when start button is clicked', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Motor Skills Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Motor Skills Assessment')).toBeInTheDocument();
      });
    });

    test('displays motor skills questions with age-appropriate content', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Motor Skills Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
        expect(screen.getByText('Can your child walk up stairs alternating feet?')).toBeInTheDocument();
      });
    });

    test('shows all answer options for motor skills', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Motor Skills Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Excellent')).toBeInTheDocument();
        expect(screen.getByText('Good')).toBeInTheDocument();
        expect(screen.getByText('Fair')).toBeInTheDocument();
        expect(screen.getByText('Poor')).toBeInTheDocument();
      });
    });
  });

  describe('Speech & Language Test Functionality', () => {
    test('opens Speech & Language test modal when start button is clicked', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Speech Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Speech & Language Assessment')).toBeInTheDocument();
      });
    });

    test('displays speech and language questions', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Speech Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
        expect(screen.getByText('Does your child follow simple one-step instructions?')).toBeInTheDocument();
      });
    });

    test('shows frequency-based answer options', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Speech Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Always')).toBeInTheDocument();
        expect(screen.getByText('Often')).toBeInTheDocument();
        expect(screen.getByText('Sometimes')).toBeInTheDocument();
        expect(screen.getByText('Rarely')).toBeInTheDocument();
        expect(screen.getByText('Never')).toBeInTheDocument();
      });
    });
  });

  describe('Social Skills Test Functionality', () => {
    test('opens Social Skills test modal when start button is clicked', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Social Skills Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Social Skills Assessment')).toBeInTheDocument();
      });
    });

    test('displays social skills questions', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Social Skills Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
        expect(screen.getByText('Does your child make eye contact when talking?')).toBeInTheDocument();
      });
    });
  });

  describe('Test Reset Functionality', () => {
    test('resets test when modal is closed', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('M-CHAT Assessment')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing translation gracefully', () => {
      const mockTWithError = jest.fn((key) => {
        if (key.includes('missing')) return undefined;
        return 'Test Translation';
      });
      
      jest.doMock('react-i18next', () => ({
        useTranslation: () => ({ t: mockTWithError })
      }));
      
      renderWithI18n(<ChildCareCenter />);
      expect(screen.getByText('Child Development Hub')).toBeInTheDocument();
    });

    test('disables start buttons when questions are not loaded', () => {
      const mockTWithEmpty = jest.fn((key, options) => {
        if (options?.returnObjects) return [];
        return 'Test';
      });
      
      jest.doMock('react-i18next', () => ({
        useTranslation: () => ({ t: mockTWithEmpty })
      }));
      
      renderWithI18n(<ChildCareCenter />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        if (button.textContent?.includes('Loading')) {
          expect(button).toBeDisabled();
        }
      });
    });
  });
});


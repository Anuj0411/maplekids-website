import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import ChildCareCenter from '../ChildCareCenter';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock i18n with comprehensive test data
const mockT = jest.fn((key, options) => {
  const translations: Record<string, any> = {
    'childcareCenter.hero.title': 'Child Development Hub',
    'childcareCenter.tests.title': 'Assessment Tools',
    'childcareCenter.tests.mchat.title': 'M-CHAT Test',
    'childcareCenter.tests.mchat.startButton': 'Start M-CHAT Test',
    'childcareCenter.tests.motorSkills.title': 'Motor Skills Assessment',
    'childcareCenter.tests.motorSkills.startButton': 'Start Motor Skills Test',
    'childcareCenter.tests.speech.title': 'Speech & Language Assessment',
    'childcareCenter.tests.speech.startButton': 'Start Speech Test',
    'childcareCenter.tests.social.title': 'Social Skills Assessment',
    'childcareCenter.tests.social.startButton': 'Start Social Skills Test',
    'childcareCenter.mchatTest.title': 'M-CHAT Assessment',
    'childcareCenter.mchatTest.progress': 'Question {current} of {total}',
    'childcareCenter.mchatTest.questions': [
      'Does your child look at you when you call his/her name?',
      'Does your child point to show you something interesting?',
      'Does your child bring objects to you to show you?',
      'Does your child imitate you?',
      'Does your child respond to his/her name when called?'
    ],
    'childcareCenter.motorSkillsTest.title': 'Motor Skills Assessment',
    'childcareCenter.motorSkillsTest.progress': 'Question {current} of {total}',
    'childcareCenter.motorSkillsTest.questions': [
      { question: 'Can your child walk up stairs alternating feet?', ageGroup: '3-4' },
      { question: 'Can your child catch a large ball with both hands?', ageGroup: '3-4' },
      { question: 'Can your child hop on one foot?', ageGroup: '3-4' }
    ],
    'childcareCenter.motorSkillsTest.options.excellent': 'Excellent',
    'childcareCenter.motorSkillsTest.options.good': 'Good',
    'childcareCenter.motorSkillsTest.options.fair': 'Fair',
    'childcareCenter.motorSkillsTest.options.poor': 'Poor',
    'childcareCenter.speechLanguageTest.title': 'Speech & Language Assessment',
    'childcareCenter.speechLanguageTest.progress': 'Question {current} of {total}',
    'childcareCenter.speechLanguageTest.questions': [
      { question: 'Does your child follow simple one-step instructions?', ageGroup: '2-3' },
      { question: 'Does your child use 2-word phrases?', ageGroup: '2-3' },
      { question: 'Does your child ask questions?', ageGroup: '2-3' }
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
      { question: 'Does your child share toys with other children?', ageGroup: '2-3' },
      { question: 'Does your child play cooperatively with others?', ageGroup: '2-3' }
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

describe('Assessment Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete M-CHAT Assessment Flow', () => {
    test('completes full M-CHAT assessment with low risk result', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      // Start M-CHAT test
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Verify test modal opens
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
        expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
      });
      
      // Answer all questions with low risk pattern (mostly "Yes")
      const questions = [
        'Does your child look at you when you call his/her name?',
        'Does your child point to show you something interesting?',
        'Does your child bring objects to you to show you?',
        'Does your child imitate you?',
        'Does your child respond to his/her name when called?'
      ];
      
      for (let i = 0; i < questions.length; i++) {
        await waitFor(() => {
          expect(screen.getByText(`Question ${i + 1} of 5`)).toBeInTheDocument();
          expect(screen.getByText(questions[i])).toBeInTheDocument();
        });
        
        // Answer with "Yes" for low risk
        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);
        
        // Wait for next question or results
        if (i < questions.length - 1) {
          await waitFor(() => {
            expect(screen.getByText(`Question ${i + 2} of 5`)).toBeInTheDocument();
          });
        }
      }
      
      // Verify results are displayed
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
        expect(screen.getByText('Low Risk')).toBeInTheDocument();
        expect(screen.getByText('Score')).toBeInTheDocument();
        expect(screen.getByText('out of 5')).toBeInTheDocument();
      });
    });

    test('completes full M-CHAT assessment with high risk result', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
      
      // Answer all questions with high risk pattern (mostly "No")
      for (let i = 0; i < 5; i++) {
        await waitFor(() => {
          const noButton = screen.getByText('No');
          fireEvent.click(noButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
        expect(screen.getByText('High Risk')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Motor Skills Assessment Flow', () => {
    test('completes full Motor Skills assessment', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Motor Skills Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Motor Skills Assessment')).toBeInTheDocument();
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
      });
      
      // Answer all questions
      const answers = ['Excellent', 'Good', 'Fair'];
      for (let i = 0; i < answers.length; i++) {
        await waitFor(() => {
          const answerButton = screen.getByText(answers[i]);
          fireEvent.click(answerButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Speech & Language Assessment Flow', () => {
    test('completes full Speech & Language assessment', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Speech Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Speech & Language Assessment')).toBeInTheDocument();
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
      });
      
      // Answer all questions
      const answers = ['Always', 'Often', 'Sometimes'];
      for (let i = 0; i < answers.length; i++) {
        await waitFor(() => {
          const answerButton = screen.getByText(answers[i]);
          fireEvent.click(answerButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Social Skills Assessment Flow', () => {
    test('completes full Social Skills assessment', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start Social Skills Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Social Skills Assessment')).toBeInTheDocument();
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
      });
      
      // Answer all questions
      const answers = ['Always', 'Often', 'Sometimes'];
      for (let i = 0; i < answers.length; i++) {
        await waitFor(() => {
          const answerButton = screen.getByText(answers[i]);
          fireEvent.click(answerButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Assessment Workflow', () => {
    test('allows user to take multiple assessments sequentially', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      // Take M-CHAT test
      const mchatButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(mchatButton);
      
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
      
      // Complete M-CHAT quickly
      for (let i = 0; i < 5; i++) {
        await waitFor(() => {
          const yesButton = screen.getByText('Yes');
          fireEvent.click(yesButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
      });
      
      // Close results
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      // Take Motor Skills test
      await waitFor(() => {
        const motorButton = screen.getByText('Start Motor Skills Test');
        fireEvent.click(motorButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Motor Skills Assessment')).toBeInTheDocument();
      });
    });

    test('maintains separate state for different assessments', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      // Start M-CHAT
      const mchatButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(mchatButton);
      
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
      
      // Close M-CHAT
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      // Start Motor Skills
      await waitFor(() => {
        const motorButton = screen.getByText('Start Motor Skills Test');
        fireEvent.click(motorButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Motor Skills Assessment')).toBeInTheDocument();
        expect(screen.queryByText('M-CHAT Assessment')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('handles rapid clicking on start buttons', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const mchatButton = screen.getByText('Start M-CHAT Test');
      const motorButton = screen.getByText('Start Motor Skills Test');
      
      // Rapidly click both buttons
      fireEvent.click(mchatButton);
      fireEvent.click(motorButton);
      fireEvent.click(mchatButton);
      
      // Should only show one test modal
      await waitFor(() => {
        const modals = screen.queryAllByText(/Assessment/);
        expect(modals.length).toBeLessThanOrEqual(1);
      });
    });

    test('handles browser back/forward navigation during test', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
      
      // Simulate browser back
      window.history.back();
      
      // Test should still be accessible
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
    });

    test('handles window resize during assessment', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
      
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      // Test should continue normally
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Usability', () => {
    test('supports keyboard navigation throughout assessment', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      startButton.focus();
      fireEvent.keyDown(startButton, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('M-CHAT Assessment')).toBeInTheDocument();
      });
      
      // Navigate through questions with keyboard
      const yesButton = screen.getByText('Yes');
      yesButton.focus();
      fireEvent.keyDown(yesButton, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
      });
    });

    test('provides clear visual feedback for all interactions', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);
        
        // Check for visual feedback
        expect(yesButton).toHaveClass('selected');
      });
    });

    test('maintains focus management during assessment', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        expect(yesButton).toHaveFocus();
      });
    });
  });
});


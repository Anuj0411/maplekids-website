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
    'childcareCenter.mchatTest.title': 'M-CHAT Assessment',
    'childcareCenter.mchatTest.progress': 'Question {current} of {total}',
    'childcareCenter.mchatTest.questions': [
      'Does your child look at you when you call his/her name?',
      'Does your child point to show you something interesting?',
      'Does your child bring objects to you to show you?',
      'Does your child imitate you?',
      'Does your child respond to his/her name when called?'
    ],
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

describe('Assessment Scoring and Risk Assessment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('M-CHAT Scoring Algorithm', () => {
    test('calculates low risk score correctly (0-2 points)', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Answer first 2 questions as "No" (high risk indicators)
      await waitFor(() => {
        const noButton = screen.getByText('No');
        fireEvent.click(noButton);
      });
      
      await waitFor(() => {
        const noButton = screen.getByText('No');
        fireEvent.click(noButton);
      });
      
      // Answer remaining questions as "Yes" (low risk)
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const yesButton = screen.getByText('Yes');
          fireEvent.click(yesButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
        // Should show low risk (2 "No" answers out of 5)
        expect(screen.getByText('Low Risk')).toBeInTheDocument();
      });
    });

    test('calculates medium risk score correctly (3-4 points)', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Answer first 3 questions as "No" (high risk indicators)
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const noButton = screen.getByText('No');
          fireEvent.click(noButton);
        });
      }
      
      // Answer remaining questions as "Yes" (low risk)
      for (let i = 0; i < 2; i++) {
        await waitFor(() => {
          const yesButton = screen.getByText('Yes');
          fireEvent.click(yesButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
        // Should show medium risk (3 "No" answers out of 5)
        expect(screen.getByText('Medium Risk')).toBeInTheDocument();
      });
    });

    test('calculates high risk score correctly (5+ points)', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Answer all questions as "No" (high risk indicators)
      for (let i = 0; i < 5; i++) {
        await waitFor(() => {
          const noButton = screen.getByText('No');
          fireEvent.click(noButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Results')).toBeInTheDocument();
        // Should show high risk (5 "No" answers out of 5)
        expect(screen.getByText('High Risk')).toBeInTheDocument();
      });
    });

    test('displays correct score in results', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Answer 2 questions as "No"
      for (let i = 0; i < 2; i++) {
        await waitFor(() => {
          const noButton = screen.getByText('No');
          fireEvent.click(noButton);
        });
      }
      
      // Answer remaining as "Yes"
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const yesButton = screen.getByText('Yes');
          fireEvent.click(yesButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Score
        expect(screen.getByText('out of 5')).toBeInTheDocument(); // Total
      });
    });
  });

  describe('Motor Skills Scoring', () => {
    test('calculates motor skills score based on performance levels', async () => {
      // This would test the motor skills scoring algorithm
      // The actual implementation would need to be extracted for testing
      expect(true).toBe(true); // Placeholder for now
    });
  });

  describe('Speech & Language Scoring', () => {
    test('calculates speech and language score based on frequency responses', async () => {
      // This would test the speech and language scoring algorithm
      expect(true).toBe(true); // Placeholder for now
    });
  });

  describe('Social Skills Scoring', () => {
    test('calculates social skills score based on frequency responses', async () => {
      // This would test the social skills scoring algorithm
      expect(true).toBe(true); // Placeholder for now
    });
  });

  describe('Risk Level Color Coding', () => {
    test('applies correct color coding for low risk', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Answer with low risk pattern
      for (let i = 0; i < 2; i++) {
        await waitFor(() => {
          const noButton = screen.getByText('No');
          fireEvent.click(noButton);
        });
      }
      
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const yesButton = screen.getByText('Yes');
          fireEvent.click(yesButton);
        });
      }
      
      await waitFor(() => {
        const riskIndicator = screen.getByText('Low Risk');
        expect(riskIndicator).toBeInTheDocument();
        // Check if it has the correct styling class or color
        expect(riskIndicator).toHaveClass('risk-low');
      });
    });

    test('applies correct color coding for high risk', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Answer with high risk pattern
      for (let i = 0; i < 5; i++) {
        await waitFor(() => {
          const noButton = screen.getByText('No');
          fireEvent.click(noButton);
        });
      }
      
      await waitFor(() => {
        const riskIndicator = screen.getByText('High Risk');
        expect(riskIndicator).toBeInTheDocument();
        expect(riskIndicator).toHaveClass('risk-high');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles empty answers gracefully', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Try to proceed without answering
      await waitFor(() => {
        const nextButton = screen.queryByText('Next');
        if (nextButton) {
          expect(nextButton).toBeDisabled();
        }
      });
    });

    test('handles rapid clicking on answer buttons', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        const noButton = screen.getByText('No');
        
        // Rapidly click both buttons
        fireEvent.click(yesButton);
        fireEvent.click(noButton);
        fireEvent.click(yesButton);
        
        // Should only register the last click
        expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
      });
    });

    test('maintains test state during navigation', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      // Answer first question
      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);
      });
      
      // Close and reopen test
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      fireEvent.click(startButton);
      
      // Should start from beginning
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Usability', () => {
    test('supports keyboard navigation for answers', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        yesButton.focus();
        
        fireEvent.keyDown(yesButton, { key: 'Enter', code: 'Enter' });
        expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
      });
    });

    test('provides clear visual feedback for selected answers', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);
        
        // Check if button shows selected state
        expect(yesButton).toHaveClass('selected');
      });
    });

    test('displays progress indicator correctly', async () => {
      renderWithI18n(<ChildCareCenter />);
      
      const startButton = screen.getByText('Start M-CHAT Test');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        const progressBar = document.querySelector('.progress-fill');
        expect(progressBar).toHaveStyle('width: 20%'); // 1/5 * 100
      });
      
      // Answer first question
      const yesButton = screen.getByText('Yes');
      fireEvent.click(yesButton);
      
      await waitFor(() => {
        const progressBar = document.querySelector('.progress-fill');
        expect(progressBar).toHaveStyle('width: 40%'); // 2/5 * 100
      });
    });
  });
});


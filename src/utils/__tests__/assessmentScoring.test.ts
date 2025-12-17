import {
  calculateMCHATScore,
  calculateMotorSkillsScore,
  calculateSpeechLanguageScore,
  calculateSocialSkillsScore,
  validateMCHATAnswers,
  validateMotorSkillsAnswers,
  validateSpeechLanguageAnswers,
  validateSocialSkillsAnswers,
  MCHATAnswer,
  MotorSkillsAnswer,
  SpeechLanguageAnswer,
  SocialSkillsAnswer
} from '../assessmentScoring';

describe('Assessment Scoring Algorithms', () => {
  describe('M-CHAT Scoring', () => {
    test('calculates low risk score correctly (0-2 "no" answers)', () => {
      const answers: MCHATAnswer[] = [
        { questionId: 1, answer: 'no' },
        { questionId: 2, answer: 'yes' },
        { questionId: 3, answer: 'yes' },
        { questionId: 4, answer: 'yes' },
        { questionId: 5, answer: 'yes' }
      ];

      const result = calculateMCHATScore(answers);

      expect(result.score).toBe(1);
      expect(result.totalQuestions).toBe(5);
      expect(result.riskLevel).toBe('low');
      expect(result.recommendations).toContain('Continue monitoring your child\'s development');
      expect(result.nextSteps).toContain('Continue current activities');
    });

    test('calculates medium risk score correctly (3-4 "no" answers)', () => {
      const answers: MCHATAnswer[] = [
        { questionId: 1, answer: 'no' },
        { questionId: 2, answer: 'no' },
        { questionId: 3, answer: 'no' },
        { questionId: 4, answer: 'yes' },
        { questionId: 5, answer: 'yes' }
      ];

      const result = calculateMCHATScore(answers);

      expect(result.score).toBe(3);
      expect(result.riskLevel).toBe('medium');
      expect(result.recommendations).toContain('Consider additional developmental screening');
      expect(result.nextSteps).toContain('Schedule comprehensive evaluation');
    });

    test('calculates high risk score correctly (5+ "no" answers)', () => {
      const answers: MCHATAnswer[] = [
        { questionId: 1, answer: 'no' },
        { questionId: 2, answer: 'no' },
        { questionId: 3, answer: 'no' },
        { questionId: 4, answer: 'no' },
        { questionId: 5, answer: 'no' }
      ];

      const result = calculateMCHATScore(answers);

      expect(result.score).toBe(5);
      expect(result.riskLevel).toBe('high');
      expect(result.recommendations).toContain('Immediate consultation with developmental specialist recommended');
      expect(result.nextSteps).toContain('Contact developmental pediatrician immediately');
    });

    test('handles critical questions correctly', () => {
      const answers: MCHATAnswer[] = [
        { questionId: 1, answer: 'no', isCritical: true },
        { questionId: 2, answer: 'yes' },
        { questionId: 3, answer: 'yes' }
      ];

      const result = calculateMCHATScore(answers);

      expect(result.score).toBe(1);
      expect(result.riskLevel).toBe('low');
    });

    test('handles edge case with all "yes" answers', () => {
      const answers: MCHATAnswer[] = [
        { questionId: 1, answer: 'yes' },
        { questionId: 2, answer: 'yes' },
        { questionId: 3, answer: 'yes' }
      ];

      const result = calculateMCHATScore(answers);

      expect(result.score).toBe(0);
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('Motor Skills Scoring', () => {
    test('calculates low risk score correctly (75%+ performance)', () => {
      const answers: MotorSkillsAnswer[] = [
        { questionId: 1, answer: 'excellent', ageGroup: '3-4' },
        { questionId: 2, answer: 'excellent', ageGroup: '3-4' },
        { questionId: 3, answer: 'good', ageGroup: '3-4' },
        { questionId: 4, answer: 'excellent', ageGroup: '3-4' }
      ];

      const result = calculateMotorSkillsScore(answers);

      expect(result.score).toBe(88); // (4+4+3+4)/16 * 100 = 93.75% -> 88% (rounded)
      expect(result.riskLevel).toBe('low');
      expect(result.recommendations).toContain('Continue current physical activities');
    });

    test('calculates medium risk score correctly (50-74% performance)', () => {
      const answers: MotorSkillsAnswer[] = [
        { questionId: 1, answer: 'good', ageGroup: '3-4' },
        { questionId: 2, answer: 'fair', ageGroup: '3-4' },
        { questionId: 3, answer: 'good', ageGroup: '3-4' },
        { questionId: 4, answer: 'fair', ageGroup: '3-4' }
      ];

      const result = calculateMotorSkillsScore(answers);

      expect(result.score).toBe(63); // (3+2+3+2)/16 * 100 = 62.5% -> 63% (rounded)
      expect(result.riskLevel).toBe('medium');
      expect(result.recommendations).toContain('Increase physical activity opportunities');
    });

    test('calculates high risk score correctly (<50% performance)', () => {
      const answers: MotorSkillsAnswer[] = [
        { questionId: 1, answer: 'poor', ageGroup: '3-4' },
        { questionId: 2, answer: 'poor', ageGroup: '3-4' },
        { questionId: 3, answer: 'fair', ageGroup: '3-4' },
        { questionId: 4, answer: 'poor', ageGroup: '3-4' }
      ];

      const result = calculateMotorSkillsScore(answers);

      expect(result.score).toBe(31); // (1+1+2+1)/16 * 100 = 31.25% -> 31% (rounded)
      expect(result.riskLevel).toBe('high');
      expect(result.recommendations).toContain('Immediate occupational therapy evaluation recommended');
    });

    test('handles mixed age groups correctly', () => {
      const answers: MotorSkillsAnswer[] = [
        { questionId: 1, answer: 'excellent', ageGroup: '3-4' },
        { questionId: 2, answer: 'good', ageGroup: '4-5' },
        { questionId: 3, answer: 'fair', ageGroup: '5-6' }
      ];

      const result = calculateMotorSkillsScore(answers);

      expect(result.score).toBe(75); // (4+3+2)/12 * 100 = 75%
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('Speech & Language Scoring', () => {
    test('calculates low risk score correctly (80%+ frequency)', () => {
      const answers: SpeechLanguageAnswer[] = [
        { questionId: 1, answer: 'always', category: 'receptive_language', ageGroup: '2-3' },
        { questionId: 2, answer: 'often', category: 'expressive_language', ageGroup: '2-3' },
        { questionId: 3, answer: 'always', category: 'articulation', ageGroup: '2-3' },
        { questionId: 4, answer: 'often', category: 'pragmatic_language', ageGroup: '2-3' }
      ];

      const result = calculateSpeechLanguageScore(answers);

      expect(result.score).toBe(85); // (5+4+5+4)/20 * 100 = 90% -> 85% (rounded)
      expect(result.riskLevel).toBe('low');
      expect(result.recommendations).toContain('Continue current language activities');
    });

    test('calculates medium risk score correctly (60-79% frequency)', () => {
      const answers: SpeechLanguageAnswer[] = [
        { questionId: 1, answer: 'sometimes', category: 'receptive_language', ageGroup: '2-3' },
        { questionId: 2, answer: 'often', category: 'expressive_language', ageGroup: '2-3' },
        { questionId: 3, answer: 'sometimes', category: 'articulation', ageGroup: '2-3' },
        { questionId: 4, answer: 'rarely', category: 'pragmatic_language', ageGroup: '2-3' }
      ];

      const result = calculateSpeechLanguageScore(answers);

      expect(result.score).toBe(65); // (3+4+3+2)/20 * 100 = 60% -> 65% (rounded)
      expect(result.riskLevel).toBe('medium');
      expect(result.recommendations).toContain('Increase language stimulation activities');
    });

    test('calculates high risk score correctly (<60% frequency)', () => {
      const answers: SpeechLanguageAnswer[] = [
        { questionId: 1, answer: 'rarely', category: 'receptive_language', ageGroup: '2-3' },
        { questionId: 2, answer: 'never', category: 'expressive_language', ageGroup: '2-3' },
        { questionId: 3, answer: 'rarely', category: 'articulation', ageGroup: '2-3' },
        { questionId: 4, answer: 'never', category: 'pragmatic_language', ageGroup: '2-3' }
      ];

      const result = calculateSpeechLanguageScore(answers);

      expect(result.score).toBe(30); // (2+1+2+1)/20 * 100 = 30% -> 30% (rounded)
      expect(result.riskLevel).toBe('high');
      expect(result.recommendations).toContain('Immediate speech-language evaluation recommended');
    });
  });

  describe('Social Skills Scoring', () => {
    test('calculates low risk score correctly (80%+ frequency)', () => {
      const answers: SocialSkillsAnswer[] = [
        { questionId: 1, answer: 'always', category: 'social_interaction', ageGroup: '2-3' },
        { questionId: 2, answer: 'often', category: 'emotional_regulation', ageGroup: '2-3' },
        { questionId: 3, answer: 'always', category: 'communication', ageGroup: '2-3' },
        { questionId: 4, answer: 'often', category: 'play_skills', ageGroup: '2-3' }
      ];

      const result = calculateSocialSkillsScore(answers);

      expect(result.score).toBe(85); // (5+4+5+4)/20 * 100 = 90% -> 85% (rounded)
      expect(result.riskLevel).toBe('low');
      expect(result.recommendations).toContain('Continue current social activities');
    });

    test('calculates medium risk score correctly (60-79% frequency)', () => {
      const answers: SocialSkillsAnswer[] = [
        { questionId: 1, answer: 'sometimes', category: 'social_interaction', ageGroup: '2-3' },
        { questionId: 2, answer: 'often', category: 'emotional_regulation', ageGroup: '2-3' },
        { questionId: 3, answer: 'sometimes', category: 'communication', ageGroup: '2-3' },
        { questionId: 4, answer: 'rarely', category: 'play_skills', ageGroup: '2-3' }
      ];

      const result = calculateSocialSkillsScore(answers);

      expect(result.score).toBe(65); // (3+4+3+2)/20 * 100 = 60% -> 65% (rounded)
      expect(result.riskLevel).toBe('medium');
      expect(result.recommendations).toContain('Increase social interaction opportunities');
    });

    test('calculates high risk score correctly (<60% frequency)', () => {
      const answers: SocialSkillsAnswer[] = [
        { questionId: 1, answer: 'rarely', category: 'social_interaction', ageGroup: '2-3' },
        { questionId: 2, answer: 'never', category: 'emotional_regulation', ageGroup: '2-3' },
        { questionId: 3, answer: 'rarely', category: 'communication', ageGroup: '2-3' },
        { questionId: 4, answer: 'never', category: 'play_skills', ageGroup: '2-3' }
      ];

      const result = calculateSocialSkillsScore(answers);

      expect(result.score).toBe(30); // (2+1+2+1)/20 * 100 = 30% -> 30% (rounded)
      expect(result.riskLevel).toBe('high');
      expect(result.recommendations).toContain('Immediate social skills evaluation recommended');
    });
  });

  describe('Validation Functions', () => {
    test('validates M-CHAT answers correctly', () => {
      const validAnswers: MCHATAnswer[] = [
        { questionId: 1, answer: 'yes' },
        { questionId: 2, answer: 'no' }
      ];

      const invalidAnswers: MCHATAnswer[] = [
        { questionId: 1, answer: 'maybe' as any },
        { questionId: 2, answer: 'no' }
      ];

      expect(validateMCHATAnswers(validAnswers)).toBe(true);
      expect(validateMCHATAnswers(invalidAnswers)).toBe(false);
      expect(validateMCHATAnswers([])).toBe(false);
    });

    test('validates Motor Skills answers correctly', () => {
      const validAnswers: MotorSkillsAnswer[] = [
        { questionId: 1, answer: 'excellent', ageGroup: '3-4' },
        { questionId: 2, answer: 'good', ageGroup: '3-4' }
      ];

      const invalidAnswers: MotorSkillsAnswer[] = [
        { questionId: 1, answer: 'great' as any, ageGroup: '3-4' },
        { questionId: 2, answer: 'good', ageGroup: '3-4' }
      ];

      expect(validateMotorSkillsAnswers(validAnswers)).toBe(true);
      expect(validateMotorSkillsAnswers(invalidAnswers)).toBe(false);
      expect(validateMotorSkillsAnswers([])).toBe(false);
    });

    test('validates Speech & Language answers correctly', () => {
      const validAnswers: SpeechLanguageAnswer[] = [
        { questionId: 1, answer: 'always', category: 'receptive_language', ageGroup: '2-3' },
        { questionId: 2, answer: 'often', category: 'expressive_language', ageGroup: '2-3' }
      ];

      const invalidAnswers: SpeechLanguageAnswer[] = [
        { questionId: 1, answer: 'frequently' as any, category: 'receptive_language', ageGroup: '2-3' },
        { questionId: 2, answer: 'often', category: 'expressive_language', ageGroup: '2-3' }
      ];

      expect(validateSpeechLanguageAnswers(validAnswers)).toBe(true);
      expect(validateSpeechLanguageAnswers(invalidAnswers)).toBe(false);
      expect(validateSpeechLanguageAnswers([])).toBe(false);
    });

    test('validates Social Skills answers correctly', () => {
      const validAnswers: SocialSkillsAnswer[] = [
        { questionId: 1, answer: 'always', category: 'social_interaction', ageGroup: '2-3' },
        { questionId: 2, answer: 'often', category: 'emotional_regulation', ageGroup: '2-3' }
      ];

      const invalidAnswers: SocialSkillsAnswer[] = [
        { questionId: 1, answer: 'frequently' as any, category: 'social_interaction', ageGroup: '2-3' },
        { questionId: 2, answer: 'often', category: 'emotional_regulation', ageGroup: '2-3' }
      ];

      expect(validateSocialSkillsAnswers(validAnswers)).toBe(true);
      expect(validateSocialSkillsAnswers(invalidAnswers)).toBe(false);
      expect(validateSocialSkillsAnswers([])).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles empty answer arrays gracefully', () => {
      const result = calculateMCHATScore([]);
      expect(result.score).toBe(0);
      expect(result.totalQuestions).toBe(0);
      expect(result.riskLevel).toBe('low');
    });

    test('handles single answer correctly', () => {
      const answers: MCHATAnswer[] = [
        { questionId: 1, answer: 'no' }
      ];

      const result = calculateMCHATScore(answers);
      expect(result.score).toBe(1);
      expect(result.totalQuestions).toBe(1);
      expect(result.riskLevel).toBe('low');
    });

    test('handles large number of answers correctly', () => {
      const answers: MCHATAnswer[] = Array.from({ length: 100 }, (_, i) => ({
        questionId: i + 1,
        answer: i % 2 === 0 ? 'no' : 'yes'
      }));

      const result = calculateMCHATScore(answers);
      expect(result.score).toBe(50);
      expect(result.totalQuestions).toBe(100);
      expect(result.riskLevel).toBe('high');
    });

    test('maintains consistency across multiple calls', () => {
      const answers: MCHATAnswer[] = [
        { questionId: 1, answer: 'no' },
        { questionId: 2, answer: 'yes' },
        { questionId: 3, answer: 'no' }
      ];

      const result1 = calculateMCHATScore(answers);
      const result2 = calculateMCHATScore(answers);

      expect(result1).toEqual(result2);
    });
  });
});


// Assessment Scoring Utilities
// These functions handle the critical scoring logic for developmental assessments

export interface MCHATAnswer {
  questionId: number;
  answer: 'yes' | 'no';
  isCritical?: boolean;
}

export interface MotorSkillsAnswer {
  questionId: number;
  answer: 'excellent' | 'good' | 'fair' | 'poor';
  ageGroup: string;
}

export interface SpeechLanguageAnswer {
  questionId: number;
  answer: 'always' | 'often' | 'sometimes' | 'rarely' | 'never';
  category: string;
  ageGroup: string;
}

export interface SocialSkillsAnswer {
  questionId: number;
  answer: 'always' | 'often' | 'sometimes' | 'rarely' | 'never';
  category: string;
  ageGroup: string;
}

export interface AssessmentResult {
  score: number;
  totalQuestions: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  nextSteps: string[];
}

// M-CHAT Scoring Algorithm
export function calculateMCHATScore(answers: MCHATAnswer[]): AssessmentResult {
  const totalQuestions = answers.length;
  let score = 0;
  
  // In M-CHAT, "No" answers indicate potential concerns
  answers.forEach(answer => {
    if (answer.answer === 'no') {
      score += 1;
    }
  });
  
  // Determine risk level based on score
  let riskLevel: 'low' | 'medium' | 'high';
  let recommendations: string[];
  let nextSteps: string[];
  
  if (score <= 2) {
    riskLevel = 'low';
    recommendations = [
      'Continue monitoring your child\'s development',
      'Engage in regular play and social activities',
      'Maintain routine developmental check-ups'
    ];
    nextSteps = [
      'Continue current activities',
      'Schedule next pediatric visit',
      'Monitor for any new concerns'
    ];
  } else if (score <= 4) {
    riskLevel = 'medium';
    recommendations = [
      'Consider additional developmental screening',
      'Consult with a pediatrician or developmental specialist',
      'Implement targeted developmental activities'
    ];
    nextSteps = [
      'Schedule comprehensive evaluation',
      'Discuss concerns with healthcare provider',
      'Consider early intervention services'
    ];
  } else {
    riskLevel = 'high';
    recommendations = [
      'Immediate consultation with developmental specialist recommended',
      'Consider comprehensive autism evaluation',
      'Early intervention services strongly recommended'
    ];
    nextSteps = [
      'Contact developmental pediatrician immediately',
      'Schedule comprehensive autism evaluation',
      'Begin early intervention services as soon as possible'
    ];
  }
  
  return {
    score,
    totalQuestions,
    riskLevel,
    recommendations,
    nextSteps
  };
}

// Motor Skills Scoring Algorithm
export function calculateMotorSkillsScore(answers: MotorSkillsAnswer[]): AssessmentResult {
  const totalQuestions = answers.length;
  let score = 0;
  
  // Convert performance levels to numeric scores
  answers.forEach(answer => {
    switch (answer.answer) {
      case 'excellent':
        score += 4;
        break;
      case 'good':
        score += 3;
        break;
      case 'fair':
        score += 2;
        break;
      case 'poor':
        score += 1;
        break;
    }
  });
  
  const maxPossibleScore = totalQuestions * 4;
  const percentage = (score / maxPossibleScore) * 100;
  
  let riskLevel: 'low' | 'medium' | 'high';
  let recommendations: string[];
  let nextSteps: string[];
  
  if (percentage >= 75) {
    riskLevel = 'low';
    recommendations = [
      'Continue current physical activities',
      'Maintain regular exercise routine',
      'Monitor for any regression'
    ];
    nextSteps = [
      'Continue current activities',
      'Schedule next check-up',
      'Encourage varied physical play'
    ];
  } else if (percentage >= 50) {
    riskLevel = 'medium';
    recommendations = [
      'Increase physical activity opportunities',
      'Consider occupational therapy evaluation',
      'Focus on specific motor skill development'
    ];
    nextSteps = [
      'Consult with pediatrician',
      'Consider occupational therapy',
      'Implement targeted exercises'
    ];
  } else {
    riskLevel = 'high';
    recommendations = [
      'Immediate occupational therapy evaluation recommended',
      'Comprehensive motor skills assessment needed',
      'Consider physical therapy services'
    ];
    nextSteps = [
      'Contact occupational therapist immediately',
      'Schedule comprehensive evaluation',
      'Begin therapy services as soon as possible'
    ];
  }
  
  return {
    score: Math.round(percentage),
    totalQuestions,
    riskLevel,
    recommendations,
    nextSteps
  };
}

// Speech & Language Scoring Algorithm
export function calculateSpeechLanguageScore(answers: SpeechLanguageAnswer[]): AssessmentResult {
  const totalQuestions = answers.length;
  let score = 0;
  
  // Convert frequency responses to numeric scores
  answers.forEach(answer => {
    switch (answer.answer) {
      case 'always':
        score += 5;
        break;
      case 'often':
        score += 4;
        break;
      case 'sometimes':
        score += 3;
        break;
      case 'rarely':
        score += 2;
        break;
      case 'never':
        score += 1;
        break;
    }
  });
  
  const maxPossibleScore = totalQuestions * 5;
  const percentage = (score / maxPossibleScore) * 100;
  
  let riskLevel: 'low' | 'medium' | 'high';
  let recommendations: string[];
  let nextSteps: string[];
  
  if (percentage >= 80) {
    riskLevel = 'low';
    recommendations = [
      'Continue current language activities',
      'Maintain regular reading and conversation',
      'Monitor for any regression'
    ];
    nextSteps = [
      'Continue current activities',
      'Schedule next check-up',
      'Encourage varied language experiences'
    ];
  } else if (percentage >= 60) {
    riskLevel = 'medium';
    recommendations = [
      'Increase language stimulation activities',
      'Consider speech-language evaluation',
      'Focus on specific language skill development'
    ];
    nextSteps = [
      'Consult with pediatrician',
      'Consider speech-language therapy',
      'Implement targeted language activities'
    ];
  } else {
    riskLevel = 'high';
    recommendations = [
      'Immediate speech-language evaluation recommended',
      'Comprehensive language assessment needed',
      'Early intervention services strongly recommended'
    ];
    nextSteps = [
      'Contact speech-language pathologist immediately',
      'Schedule comprehensive evaluation',
      'Begin therapy services as soon as possible'
    ];
  }
  
  return {
    score: Math.round(percentage),
    totalQuestions,
    riskLevel,
    recommendations,
    nextSteps
  };
}

// Social Skills Scoring Algorithm
export function calculateSocialSkillsScore(answers: SocialSkillsAnswer[]): AssessmentResult {
  const totalQuestions = answers.length;
  let score = 0;
  
  // Convert frequency responses to numeric scores
  answers.forEach(answer => {
    switch (answer.answer) {
      case 'always':
        score += 5;
        break;
      case 'often':
        score += 4;
        break;
      case 'sometimes':
        score += 3;
        break;
      case 'rarely':
        score += 2;
        break;
      case 'never':
        score += 1;
        break;
    }
  });
  
  const maxPossibleScore = totalQuestions * 5;
  const percentage = (score / maxPossibleScore) * 100;
  
  let riskLevel: 'low' | 'medium' | 'high';
  let recommendations: string[];
  let nextSteps: string[];
  
  if (percentage >= 80) {
    riskLevel = 'low';
    recommendations = [
      'Continue current social activities',
      'Maintain peer interaction opportunities',
      'Monitor for any regression'
    ];
    nextSteps = [
      'Continue current activities',
      'Schedule next check-up',
      'Encourage varied social experiences'
    ];
  } else if (percentage >= 60) {
    riskLevel = 'medium';
    recommendations = [
      'Increase social interaction opportunities',
      'Consider social skills evaluation',
      'Focus on specific social skill development'
    ];
    nextSteps = [
      'Consult with pediatrician',
      'Consider social skills training',
      'Implement targeted social activities'
    ];
  } else {
    riskLevel = 'high';
    recommendations = [
      'Immediate social skills evaluation recommended',
      'Comprehensive social-emotional assessment needed',
      'Early intervention services strongly recommended'
    ];
    nextSteps = [
      'Contact developmental specialist immediately',
      'Schedule comprehensive evaluation',
      'Begin therapy services as soon as possible'
    ];
  }
  
  return {
    score: Math.round(percentage),
    totalQuestions,
    riskLevel,
    recommendations,
    nextSteps
  };
}

// Validation functions
export function validateMCHATAnswers(answers: MCHATAnswer[]): boolean {
  return answers.length > 0 && answers.every(answer => 
    answer.answer === 'yes' || answer.answer === 'no'
  );
}

export function validateMotorSkillsAnswers(answers: MotorSkillsAnswer[]): boolean {
  return answers.length > 0 && answers.every(answer => 
    ['excellent', 'good', 'fair', 'poor'].includes(answer.answer)
  );
}

export function validateSpeechLanguageAnswers(answers: SpeechLanguageAnswer[]): boolean {
  return answers.length > 0 && answers.every(answer => 
    ['always', 'often', 'sometimes', 'rarely', 'never'].includes(answer.answer)
  );
}

export function validateSocialSkillsAnswers(answers: SocialSkillsAnswer[]): boolean {
  return answers.length > 0 && answers.every(answer => 
    ['always', 'often', 'sometimes', 'rarely', 'never'].includes(answer.answer)
  );
}


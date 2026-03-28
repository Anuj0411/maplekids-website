/**
 * Google Gemini AI Service
 * 
 * Integrates Google's Gemini AI for intelligent WhatsApp responses
 * 
 * LEARNING NOTES:
 * - Gemini is Google's latest AI model (similar to ChatGPT)
 * - Supports multi-turn conversations with context
 * - Can understand images, voice, and text
 * - Free tier: 60 requests/minute
 * 
 * CAPABILITIES:
 * - Answer questions about school (fees, attendance, homework)
 * - Understand context from previous messages
 * - Generate human-like responses
 * - Support multiple languages
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getConversationHistory, saveConversationTurn } from './firebaseService';

// Get API key from environment variable
// For local: Set in .env file as GEMINI_API_KEY
// For production: Set via Firebase Console or deployment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize Gemini (will be initialized when API key is available)
let genAI: GoogleGenerativeAI | null = null;

function getGeminiAI(): GoogleGenerativeAI {
  if (!genAI && GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  return genAI;
}

/**
 * System instructions for the AI assistant
 * This tells Gemini how to behave and what it knows
 */
const SYSTEM_INSTRUCTION = `You are a helpful AI assistant for Maplekids Play School in India.

ROLE:
- You help parents, teachers, and admin staff with school-related queries
- You are friendly, professional, and patient
- You understand English, Hindi, and Marathi

CAPABILITIES:
- Answer questions about fees, attendance, homework, and events
- Provide school policies and information
- Help with general inquiries about the school
- Support multiple languages (detect and respond in user's language)

GUIDELINES:
- Keep responses concise (max 4096 characters for WhatsApp)
- Use emojis appropriately 😊 📚 🎓
- For sensitive queries (fees, personal data), be professional
- If you don't know something, admit it and suggest contacting school admin
- Always be respectful and child-friendly

SCHOOL INFO:
- Name: Maplekids Play School
- Location: Hatta, Madhya Pradesh, India
- Classes: Play, Nursery, LKG, UKG, 1st
- Working Hours: 9:00 AM - 1:00 PM
- Contact: Available via WhatsApp

RESPONSE FORMAT:
- Start with greeting (first message only)
- Answer the question clearly
- End with "How else can I help you?" for ongoing conversations
`;

/**
 * Gemini model with system instructions (stable behavior vs. injecting text as fake history).
 */
function getModel(): GenerativeModel {
  return getGeminiAI().getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });
}

/**
 * Build generation config with safety settings
 */
function getGenerationConfig() {
  return {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  };
}

/**
 * Generate AI response with conversation context
 * 
 * @param userMessage - The user's current message
 * @param userId - User's phone number or ID
 * @param userContext - Additional context (name, role, student info)
 * @returns AI-generated response
 */
export async function generateAIResponse(
  userMessage: string,
  userId: string,
  userContext?: any
): Promise<string> {
  try {
    console.log(`🤖 Generating AI response for user: ${userId}`);
    
    const history = await getConversationHistory(userId);
    const contextPrompt = buildContextPrompt(userMessage, userContext);
    const model = getModel();

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      generationConfig: getGenerationConfig(),
    });
    
    // Generate response
    const result = await chat.sendMessage(contextPrompt);
    const response = result.response.text();
    
    // Save this conversation turn
    await saveConversationTurn(userId, userMessage, response);
    
    console.log(`✅ AI response generated (${response.length} chars)`);
    
    return response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback response if AI fails
    return "I'm having trouble connecting right now. Please try again in a moment, or contact the school office directly. 🙏";
  }
}

/**
 * Build context-enhanced prompt
 * This gives Gemini more information to generate better responses
 */
function buildContextPrompt(userMessage: string, userContext: any): string {
  const contextParts: string[] = [];

  if (userContext) {
    if (userContext.name) {
      contextParts.push(`User name: ${userContext.name}`);
    }
    if (userContext.role) {
      contextParts.push(`User role: ${userContext.role}`);
    }
    if (userContext.studentName) {
      contextParts.push(`Student name: ${userContext.studentName}`);
    }
    if (userContext.studentClass) {
      contextParts.push(`Student class: ${userContext.studentClass}`);
    }
    if (userContext.language) {
      contextParts.push(`Preferred language: ${userContext.language}`);
    }
    if (userContext.intent) {
      contextParts.push(`Detected intent: ${userContext.intent}`);
    }
    if (userContext.schoolContextSummary) {
      contextParts.push(`School data context:\n${userContext.schoolContextSummary}`);
    }
  }
  
  // Build final prompt
  let prompt = userMessage;
  
  if (contextParts.length > 0) {
    prompt = `[CONTEXT]\n${contextParts.join('\n')}\n\n[USER MESSAGE]\n${userMessage}`;
  }
  
  return prompt;
}

/**
 * Detect intent from user message
 * This helps route to specific handlers (fees, attendance, etc.)
 * 
 * @param message - User's message text
 * @returns Intent category
 */
export async function detectIntent(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // Fee-related intents
  if (lowerMessage.match(/fee|payment|pay|dues|amount|money|rupees|₹/)) {
    return 'fees';
  }
  
  // Attendance-related intents
  if (lowerMessage.match(/attendance|present|absent|leave|holiday/)) {
    return 'attendance';
  }
  
  // Homework-related intents
  if (lowerMessage.match(/homework|assignment|project|study|class work/)) {
    return 'homework';
  }
  
  // Report card intents
  if (lowerMessage.match(/report|marks|grades|result|performance|exam/)) {
    return 'reports';
  }
  
  // Event/Calendar intents
  if (lowerMessage.match(/event|function|celebration|holiday|vacation|calendar/)) {
    return 'events';
  }
  
  // Teacher/Staff intents
  if (lowerMessage.match(/teacher|staff|principal|contact|phone|email/)) {
    return 'staff';
  }
  
  // Admission/Enrollment intents
  if (lowerMessage.match(/admission|enroll|new student|join|apply/)) {
    return 'admission';
  }
  
  // General greeting
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good evening|namaste)/)) {
    return 'greeting';
  }
  
  // Default: general query
  return 'general';
}

/**
 * Generate response for specific intent with data
 * This is used when we have real data to include
 * 
 * @param intent - The detected intent
 * @param userData - User and student data
 * @param additionalContext - Any additional information
 */
export async function generateIntentBasedResponse(
  intent: string,
  userData: any,
  additionalContext?: any
): Promise<string> {
  const model = getModel();
  
  let prompt = '';
  
  const cls = userData.studentClass ?? 'unknown';
  const roll = userData.rollNumber ?? 'n/a';

  switch (intent) {
    case 'fees':
      prompt = `Generate a concise friendly WhatsApp message about school fees at Maplekids Play School.
Student: ${userData.studentName} (class ${cls}, roll ${roll})
Fee data in database: ${userData.feeStatus || 'Not stored — parent must contact office for balance and due dates.'}
${userData.feeAmount ? `Reference amount if any: ₹${userData.feeAmount}` : ''}
${additionalContext ? `More context: ${additionalContext}` : ''}`;
      break;

    case 'attendance':
      prompt = `Generate a concise friendly WhatsApp message about attendance.
Student: ${userData.studentName} (class ${cls}, roll ${roll})
From school records: ${userData.presentDays ?? 0} present / ${userData.totalDays ?? 0} class days with attendance marked (${userData.attendancePercentage ?? 0}% present).
Latest recorded class date: ${userData.lastAttendanceDate ?? 'none'} — status: ${userData.attendanceStatus ?? 'n/a'}.
If totals are zero, explain that no attendance rows matched yet and suggest checking with the class teacher.
${additionalContext ? `More context: ${additionalContext}` : ''}`;
      break;

    case 'reports':
      prompt = `Generate a concise friendly WhatsApp message about report cards / academic performance.
Student: ${userData.studentName} (class ${cls})
Digital report data: ${userData.performance || 'Not available in this system — direct parent to the school office or teacher for official reports.'}
${additionalContext ? `More context: ${additionalContext}` : ''}`;
      break;

    case 'homework':
      prompt = `Generate a brief friendly WhatsApp message about homework.
Student: ${userData.studentName} (class ${cls})
There is no live homework feed in the database; suggest the school diary, class group, or class teacher for assignments.`;
      break;

    case 'events':
      prompt = `Generate a brief friendly WhatsApp message about school events.
Student: ${userData.studentName} (class ${cls})
There is no events calendar in this database; point them to school notices, the office, or official communications for dates.`;
      break;

    default:
      prompt = `User topic: ${intent}. Student context: ${userData.studentName} (class ${cls}). Give helpful Maplekids Play School guidance in WhatsApp-friendly tone.`;
  }
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return GEMINI_API_KEY !== '' && GEMINI_API_KEY !== undefined;
}


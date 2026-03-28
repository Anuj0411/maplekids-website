"use strict";
/**
 * Message Processor
 *
 * Processes incoming WhatsApp messages and generates AI responses
 *
 * LEARNING NOTES:
 * - This is where the "AI brain" lives
 * - Integrated with Google Gemini AI for intelligent responses
 * - Supports context-aware conversations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMessage = processMessage;
const whatsappClient_1 = require("./whatsappClient");
const firebaseService_1 = require("./firebaseService");
const geminiService_1 = require("./geminiService");
/**
 * Process a single WhatsApp message
 *
 * @param message - The message object from WhatsApp
 * @param value - Additional context (phone number, metadata)
 */
async function processMessage(message, value) {
    try {
        // Extract message details
        const from = message.from; // User's phone number
        const messageId = message.id;
        const timestamp = message.timestamp;
        // Different message types: text, image, audio, video, document
        let messageText = '';
        let messageType = message.type;
        switch (messageType) {
            case 'text':
                messageText = message.text.body;
                break;
            case 'image':
                messageText = '[Image received]';
                // We'll handle image processing in Week 6 (Computer Vision)
                break;
            case 'audio':
                messageText = '[Audio received]';
                // We'll handle voice transcription in Week 5
                break;
            default:
                messageText = `[${messageType} message]`;
        }
        console.log(`📩 Message from ${from}: ${messageText}`);
        // STEP 1: Save incoming message to Firestore
        await (0, firebaseService_1.saveMessage)({
            messageId,
            from,
            to: value.metadata.phone_number_id,
            text: messageText,
            type: messageType,
            timestamp: new Date(parseInt(timestamp) * 1000),
            direction: 'incoming',
        });
        // STEP 2: Get or create user profile
        const user = await (0, firebaseService_1.getUserByPhone)(from);
        // Update last message timestamp
        await (0, firebaseService_1.updateUserLastMessage)(from);
        // STEP 3: Detect intent for better routing
        const intent = await (0, geminiService_1.detectIntent)(messageText);
        console.log(`🎯 Detected intent: ${intent}`);
        // STEP 4: Generate AI response using Gemini
        let responseText;
        if ((0, geminiService_1.isGeminiConfigured)()) {
            // Use Gemini AI for intelligent responses
            responseText = await (0, geminiService_1.generateAIResponse)(messageText, from, {
                name: user === null || user === void 0 ? void 0 : user.name,
                role: user === null || user === void 0 ? void 0 : user.role,
                studentId: user === null || user === void 0 ? void 0 : user.studentId,
                intent: intent,
            });
        }
        else {
            // Fallback to simple responses if Gemini not configured
            responseText = await generateFallbackResponse(messageText, user, intent);
        }
        // STEP 5: Send response via WhatsApp
        await (0, whatsappClient_1.sendWhatsAppMessage)(from, responseText);
        // STEP 6: Save outgoing message to Firestore
        await (0, firebaseService_1.saveMessage)({
            messageId: `${Date.now()}-${from}`,
            from: value.metadata.phone_number_id,
            to: from,
            text: responseText,
            type: 'text',
            timestamp: new Date(),
            direction: 'outgoing',
        });
        console.log(`✅ Processed message from ${from}`);
    }
    catch (error) {
        console.error('Error processing message:', error);
        throw error;
    }
}
/**
 * Generate fallback response when Gemini AI is not configured
 *
 * @param userMessage - The user's message text
 * @param user - User profile object
 * @param intent - Detected intent
 * @returns Simple response
 */
async function generateFallbackResponse(userMessage, user, intent) {
    const userName = (user === null || user === void 0 ? void 0 : user.name) || 'there';
    // Intent-based responses
    switch (intent) {
        case 'greeting':
            return `Hello ${userName}! 👋 Welcome to Maplekids AI Assistant. How can I help you today?`;
        case 'fees':
            return `Hi ${userName}, I can help you with fee information. However, AI is not fully configured yet. Please contact the school office for fee details. 📞`;
        case 'attendance':
            return `Hi ${userName}, I can help you check attendance. However, AI is not fully configured yet. Please contact your class teacher for attendance details. 📅`;
        case 'reports':
            return `Hi ${userName}, I can help you with report cards. However, AI is not fully configured yet. Please contact the school office. 📊`;
        case 'homework':
            return `Hi ${userName}, I can help you with homework information. However, AI is not fully configured yet. Please contact your class teacher. 📚`;
        default:
            return `Hello ${userName}! I'm the Maplekids AI Assistant. I'm still learning, but I'll be able to help you with:\n\n• Fee information 💰\n• Attendance reports 📅\n• Academic reports 📊\n• Homework updates 📚\n• School events 🎉\n\nFor now, please contact the school office directly. Thank you! 🙏`;
    }
}
//# sourceMappingURL=messageProcessor.js.map
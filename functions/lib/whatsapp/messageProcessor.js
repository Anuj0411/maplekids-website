"use strict";
/**
 * Message Processor
 *
 * Processes incoming WhatsApp messages and generates AI responses
 *
 * LEARNING NOTES:
 * - This is where the "AI brain" lives
 * - We'll integrate Google Gemini AI here for intelligent responses
 * - For now, we'll start with simple echo bot, then add AI gradually
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMessage = processMessage;
const whatsappClient_1 = require("./whatsappClient");
const firebaseService_1 = require("./firebaseService");
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
        // STEP 3: Generate AI response (for now, simple echo bot)
        // We'll replace this with Gemini AI in Week 3-4
        const responseText = await generateResponse(messageText, user);
        // STEP 4: Send response via WhatsApp
        await (0, whatsappClient_1.sendWhatsAppMessage)(from, responseText);
        // STEP 5: Save outgoing message to Firestore
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
 * Generate AI response (PLACEHOLDER - we'll add Gemini AI here)
 *
 * @param userMessage - The user's message text
 * @param user - User profile object
 * @returns AI-generated response
 */
async function generateResponse(userMessage, user) {
    // WEEK 1-2: Simple echo bot for testing
    // WEEK 3-4: Replace with Google Gemini AI
    const userName = (user === null || user === void 0 ? void 0 : user.name) || 'there';
    // Simple command routing (we'll make this smarter with AI)
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return `Hello ${userName}! 👋 Welcome to Maplekids AI Assistant. How can I help you today?`;
    }
    if (lowerMessage.includes('fee') || lowerMessage.includes('payment')) {
        return `Hi ${userName}, your current fee status: ₹6,000/quarter. Next due date: 15th Feb 2026. Reply "PAY" to make payment via Razorpay.`;
    }
    if (lowerMessage.includes('attendance')) {
        return `${userName}'s attendance this month: 18/20 days (90%). Great job! 🌟`;
    }
    // Default echo response
    return `You said: "${userMessage}"\n\n(This is a simple echo bot. AI features coming in Week 3! 🤖)`;
}
//# sourceMappingURL=messageProcessor.js.map
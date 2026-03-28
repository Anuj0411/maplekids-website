"use strict";
/**
 * Message Processor
 *
 * Processes incoming WhatsApp messages and generates AI responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMessage = processMessage;
const whatsappClient_1 = require("./whatsappClient");
const firebaseService_1 = require("./firebaseService");
const geminiService_1 = require("./geminiService");
const STRUCTURED_INTENTS = new Set([
    'fees',
    'attendance',
    'reports',
    'homework',
    'events',
]);
function mapIntentUserData(ctx) {
    var _a, _b, _c, _d;
    const p = ctx.primaryStudent;
    const name = [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || 'Student';
    const a = ctx.attendanceSummary;
    const total = (_a = a === null || a === void 0 ? void 0 : a.totalDaysRecorded) !== null && _a !== void 0 ? _a : 0;
    const present = (_b = a === null || a === void 0 ? void 0 : a.present) !== null && _b !== void 0 ? _b : 0;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
        studentName: name,
        studentClass: p.class,
        rollNumber: p.rollNumber,
        feeAmount: undefined,
        feeDueDate: undefined,
        feeStatus: 'Fee balances are not stored in Firestore — parents should contact the school office for exact amounts and due dates.',
        presentDays: present,
        totalDays: total,
        attendancePercentage: pct,
        attendanceStatus: (_c = a === null || a === void 0 ? void 0 : a.lastStatus) !== null && _c !== void 0 ? _c : (total === 0 ? 'No matching attendance rows yet' : 'See summary'),
        lastAttendanceDate: (_d = a === null || a === void 0 ? void 0 : a.lastRecordDate) !== null && _d !== void 0 ? _d : 'n/a',
        latestTerm: 'Not stored in this assistant',
        subjectCount: 0,
        performance: 'Official report cards are not loaded into this assistant — please contact the class teacher or office.',
    };
}
/**
 * Process a single WhatsApp message
 */
async function processMessage(message, value) {
    var _a;
    try {
        const from = message.from;
        const messageId = message.id;
        const timestamp = message.timestamp;
        let messageText = '';
        const messageType = message.type;
        switch (messageType) {
            case 'text':
                messageText = message.text.body;
                break;
            case 'image':
                messageText = '[Image received — image understanding is not enabled yet]';
                break;
            case 'audio':
                messageText = '[Audio received — voice transcription is not enabled yet]';
                break;
            default:
                messageText = `[${messageType} message]`;
        }
        console.log(`Message from ${from}: ${messageText}`);
        await (0, firebaseService_1.saveMessage)({
            messageId,
            from,
            to: value.metadata.phone_number_id,
            text: messageText,
            type: messageType,
            timestamp: new Date(parseInt(timestamp, 10) * 1000),
            direction: 'incoming',
        });
        const user = await (0, firebaseService_1.getUserByPhone)(from);
        await (0, firebaseService_1.updateUserLastMessage)(from);
        const intent = await (0, geminiService_1.detectIntent)(messageText);
        console.log(`Detected intent: ${intent}`);
        const schoolContext = await (0, firebaseService_1.loadSchoolContextForWhatsApp)(from, user);
        let responseText;
        if ((0, geminiService_1.isGeminiConfigured)()) {
            if (schoolContext.primaryStudent && STRUCTURED_INTENTS.has(intent)) {
                const userData = mapIntentUserData(schoolContext);
                responseText = await (0, geminiService_1.generateIntentBasedResponse)(intent, userData);
                await (0, firebaseService_1.saveConversationTurn)(from, messageText, responseText);
            }
            else {
                responseText = await (0, geminiService_1.generateAIResponse)(messageText, from, {
                    name: user === null || user === void 0 ? void 0 : user.name,
                    role: user === null || user === void 0 ? void 0 : user.role,
                    studentId: user === null || user === void 0 ? void 0 : user.studentId,
                    intent,
                    studentName: schoolContext.primaryStudent
                        ? [schoolContext.primaryStudent.firstName, schoolContext.primaryStudent.lastName]
                            .filter(Boolean)
                            .join(' ')
                            .trim()
                        : undefined,
                    studentClass: (_a = schoolContext.primaryStudent) === null || _a === void 0 ? void 0 : _a.class,
                    schoolContextSummary: (0, firebaseService_1.formatSchoolContextForPrompt)(schoolContext),
                });
            }
        }
        else {
            responseText = await generateFallbackResponse(user, intent, schoolContext);
        }
        await (0, whatsappClient_1.sendWhatsAppMessage)(from, responseText);
        await (0, firebaseService_1.saveMessage)({
            messageId: `${Date.now()}-${from}`,
            from: value.metadata.phone_number_id,
            to: from,
            text: responseText,
            type: 'text',
            timestamp: new Date(),
            direction: 'outgoing',
        });
        console.log(`Processed message from ${from}`);
    }
    catch (error) {
        console.error('Error processing message:', error);
        throw error;
    }
}
async function generateFallbackResponse(user, intent, schoolContext) {
    const userName = (user === null || user === void 0 ? void 0 : user.name) || 'there';
    const summary = (0, firebaseService_1.formatSchoolContextForPrompt)(schoolContext);
    const attendanceLine = schoolContext.attendanceSummary && schoolContext.attendanceSummary.totalDaysRecorded > 0
        ? `Recorded attendance: ${schoolContext.attendanceSummary.present} present / ${schoolContext.attendanceSummary.totalDaysRecorded} class days.`
        : '';
    switch (intent) {
        case 'greeting':
            return `Hello ${userName}! Welcome to Maplekids AI Assistant. How can I help you today?`;
        case 'fees':
            return `Hi ${userName}, for fee amounts and due dates please contact the school office — balances are not stored in this chat bot yet. ${summary ? `\n\n${summary}` : ''}`;
        case 'attendance':
            return `Hi ${userName}, ${attendanceLine || 'No attendance records matched your number yet — please contact your class teacher.'}${summary ? `\n\n${summary}` : ''}`;
        case 'reports':
            return `Hi ${userName}, report cards are not available through this assistant yet. Please contact the school office or class teacher.`;
        case 'homework':
            return `Hi ${userName}, please check the school diary or message the class teacher for homework — it is not stored in this assistant yet.`;
        default:
            return `Hello ${userName}! I'm the Maplekids AI Assistant.${summary ? ` ${summary}` : ''}\n\nI can help with general school questions. For fees, reports, and detailed attendance, please contact the school office or teacher.`;
    }
}
//# sourceMappingURL=messageProcessor.js.map
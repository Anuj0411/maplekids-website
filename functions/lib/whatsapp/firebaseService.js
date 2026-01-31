"use strict";
/**
 * Firebase Firestore Service
 *
 * Handles database operations for WhatsApp AI Assistant
 *
 * LEARNING NOTES:
 * - Firestore is a NoSQL database (document-based, not tables)
 * - Collections = folders, Documents = files with data
 * - Auto-scaling, real-time sync, offline support
 * - Free tier: 50K reads/day, 20K writes/day
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMessage = saveMessage;
exports.getUserByPhone = getUserByPhone;
exports.updateUserLastMessage = updateUserLastMessage;
exports.getConversationHistory = getConversationHistory;
exports.linkUserToStudent = linkUserToStudent;
const admin = require("firebase-admin");
// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Save a message to Firestore
 *
 * WHY: We need conversation history for:
 * - AI context (understanding user intent)
 * - Analytics (message volume, response time)
 * - Compliance (audit trail)
 */
async function saveMessage(message) {
    try {
        await db.collection('whatsapp_messages').doc(message.messageId).set(Object.assign(Object.assign({}, message), { createdAt: admin.firestore.FieldValue.serverTimestamp() }));
        console.log(`💾 Saved message: ${message.messageId}`);
    }
    catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
}
/**
 * Get user by phone number
 *
 * WHY: We need to know:
 * - Who is messaging us (parent/teacher/admin)
 * - Their preferred language
 * - Which student they're asking about
 * - Conversation history
 */
async function getUserByPhone(phoneNumber) {
    try {
        const userDoc = await db.collection('whatsapp_users').doc(phoneNumber).get();
        if (userDoc.exists) {
            return userDoc.data();
        }
        // New user - create profile
        const newUser = {
            phoneNumber,
            createdAt: new Date(),
            role: 'parent', // Default role
        };
        await db.collection('whatsapp_users').doc(phoneNumber).set(newUser);
        console.log(`👤 Created new user: ${phoneNumber}`);
        return newUser;
    }
    catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
}
/**
 * Update user's last message timestamp
 *
 * WHY: Track active users, identify inactive parents
 */
async function updateUserLastMessage(phoneNumber) {
    try {
        await db.collection('whatsapp_users').doc(phoneNumber).update({
            lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
    }
}
/**
 * Get conversation history for AI context
 *
 * WHY: AI needs past messages to understand context
 * Example: "How is he doing?" - AI needs to know which student
 */
async function getConversationHistory(phoneNumber, limit = 10) {
    try {
        const snapshot = await db
            .collection('whatsapp_messages')
            .where('from', '==', phoneNumber)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push(doc.data());
        });
        return messages.reverse(); // Oldest to newest
    }
    catch (error) {
        console.error('Error getting conversation history:', error);
        return [];
    }
}
/**
 * Link user to student (for parents)
 *
 * WHY: Parents need to be linked to their kids for:
 * - Fee status queries
 * - Attendance reports
 * - Progress updates
 */
async function linkUserToStudent(phoneNumber, studentId, studentName) {
    try {
        await db.collection('whatsapp_users').doc(phoneNumber).update({
            studentId,
            name: studentName,
            role: 'parent',
        });
        console.log(`🔗 Linked ${phoneNumber} to student ${studentId}`);
    }
    catch (error) {
        console.error('Error linking user to student:', error);
        throw error;
    }
}
//# sourceMappingURL=firebaseService.js.map
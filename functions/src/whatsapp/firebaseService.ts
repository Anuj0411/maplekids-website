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

import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Message interface (TypeScript type safety)
 */
interface Message {
  messageId: string;
  from: string;
  to: string;
  text: string;
  type: string;
  timestamp: Date;
  direction: 'incoming' | 'outgoing';
}

/**
 * User interface
 */
interface User {
  phoneNumber: string;
  name?: string;
  role?: 'parent' | 'teacher' | 'admin';
  studentId?: string;
  language?: string;
  createdAt: Date;
  lastMessageAt?: Date;
}

/**
 * Save a message to Firestore
 * 
 * WHY: We need conversation history for:
 * - AI context (understanding user intent)
 * - Analytics (message volume, response time)
 * - Compliance (audit trail)
 */
export async function saveMessage(message: Message): Promise<void> {
  try {
    await db.collection('whatsapp_messages').doc(message.messageId).set({
      ...message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`💾 Saved message: ${message.messageId}`);
  } catch (error) {
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
export async function getUserByPhone(phoneNumber: string): Promise<User | null> {
  try {
    const userDoc = await db.collection('whatsapp_users').doc(phoneNumber).get();
    
    if (userDoc.exists) {
      return userDoc.data() as User;
    }
    
    // New user - create profile
    const newUser: User = {
      phoneNumber,
      createdAt: new Date(),
      role: 'parent', // Default role
    };
    
    await db.collection('whatsapp_users').doc(phoneNumber).set(newUser);
    console.log(`👤 Created new user: ${phoneNumber}`);
    
    return newUser;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Update user's last message timestamp
 * 
 * WHY: Track active users, identify inactive parents
 */
export async function updateUserLastMessage(phoneNumber: string): Promise<void> {
  try {
    await db.collection('whatsapp_users').doc(phoneNumber).update({
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

/**
 * Get conversation history for AI context
 * 
 * WHY: AI needs past messages to understand context
 * Example: "How is he doing?" - AI needs to know which student
 */
export async function getConversationHistory(
  phoneNumber: string,
  limit: number = 10
): Promise<Message[]> {
  try {
    const snapshot = await db
      .collection('whatsapp_messages')
      .where('from', '==', phoneNumber)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push(doc.data() as Message);
    });

    return messages.reverse(); // Oldest to newest
  } catch (error) {
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
export async function linkUserToStudent(
  phoneNumber: string,
  studentId: string,
  studentName: string
): Promise<void> {
  try {
    await db.collection('whatsapp_users').doc(phoneNumber).update({
      studentId,
      name: studentName,
      role: 'parent',
    });
    
    console.log(`🔗 Linked ${phoneNumber} to student ${studentId}`);
  } catch (error) {
    console.error('Error linking user to student:', error);
    throw error;
  }
}

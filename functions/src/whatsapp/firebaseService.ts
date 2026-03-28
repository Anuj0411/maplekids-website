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
import type { DocumentData } from 'firebase-admin/firestore';

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
export interface User {
  phoneNumber: string;
  name?: string;
  role?: 'parent' | 'teacher' | 'admin';
  studentId?: string;
  language?: string;
  createdAt: Date;
  lastMessageAt?: Date;
}

export interface SchoolStudentRecord {
  docId: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  class: string;
  parentName?: string;
  parentPhone?: string;
}

export interface AttendanceRollup {
  studentName: string;
  rollNumber: string;
  className: string;
  totalDaysRecorded: number;
  present: number;
  absent: number;
  late: number;
  lastRecordDate?: string;
  lastStatus?: string;
}

export interface SchoolContextForWhatsApp {
  students: SchoolStudentRecord[];
  primaryStudent?: SchoolStudentRecord;
  attendanceSummary?: AttendanceRollup;
}

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** E.164-style variants for matching Firestore parentPhone values */
export function parentPhoneQueryVariants(waPhone: string): string[] {
  const digits = digitsOnly(waPhone);
  const out = new Set<string>();
  if (digits) {
    out.add(digits);
    out.add(`+${digits}`);
  }
  if (digits.length === 10) {
    out.add(`91${digits}`);
    out.add(`+91${digits}`);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    out.add(digits);
    out.add(`+${digits}`);
    out.add(digits.slice(2));
  }
  return [...out];
}

function mapStudentDoc(docId: string, data: DocumentData): SchoolStudentRecord {
  return {
    docId,
    rollNumber: String(data.rollNumber ?? docId),
    firstName: String(data.firstName ?? ''),
    lastName: String(data.lastName ?? ''),
    class: String(data.class ?? ''),
    parentName: data.parentName ? String(data.parentName) : undefined,
    parentPhone: data.parentPhone ? String(data.parentPhone) : undefined,
  };
}

/**
 * Find students whose parentPhone matches the WhatsApp number (any common format).
 */
export async function findStudentsByParentPhone(waPhone: string): Promise<SchoolStudentRecord[]> {
  const variants = parentPhoneQueryVariants(waPhone);
  const byId = new Map<string, SchoolStudentRecord>();

  for (const v of variants) {
    const snap = await db.collection('students').where('parentPhone', '==', v).get();
    snap.forEach((doc) => {
      if (!byId.has(doc.id)) {
        byId.set(doc.id, mapStudentDoc(doc.id, doc.data()));
      }
    });
  }

  return [...byId.values()];
}

async function loadStudentByUserLink(user: User): Promise<SchoolStudentRecord | null> {
  if (!user.studentId) {
    return null;
  }
  const byDoc = await db.collection('students').doc(user.studentId).get();
  if (byDoc.exists) {
    return mapStudentDoc(byDoc.id, byDoc.data()!);
  }
  const snap = await db
    .collection('students')
    .where('rollNumber', '==', user.studentId)
    .limit(5)
    .get();
  if (snap.empty) {
    return null;
  }
  const d = snap.docs[0];
  return mapStudentDoc(d.id, d.data());
}

/**
 * Roll up attendance docs for one student (class + roll number).
 */
export async function getAttendanceRollupForStudent(
  rollNumber: string,
  className: string
): Promise<AttendanceRollup | undefined> {
  if (!className || !rollNumber) {
    return undefined;
  }

  const snap = await db.collection('attendance').where('class', '==', className).get();

  let present = 0;
  let absent = 0;
  let late = 0;
  let totalDaysRecorded = 0;
  let lastRecordDate: string | undefined;
  let lastStatus: string | undefined;

  const dated: Array<{ date: string; status: string; studentName?: string }> = [];

  snap.forEach((doc) => {
    const data = doc.data();
    const students: Array<{ rollNumber?: string; status?: string; studentName?: string }> =
      Array.isArray(data.students) ? data.students : [];
    const row = students.find((s) => String(s.rollNumber) === String(rollNumber));
    if (!row || !row.status) {
      return;
    }
    totalDaysRecorded += 1;
    if (row.status === 'present') {
      present += 1;
    } else if (row.status === 'absent') {
      absent += 1;
    } else if (row.status === 'late') {
      late += 1;
    }
    const dateStr = String(data.date ?? '');
    dated.push({
      date: dateStr,
      status: row.status,
      studentName: row.studentName,
    });
  });

  dated.sort((a, b) => b.date.localeCompare(a.date));
  if (dated.length > 0) {
    lastRecordDate = dated[0].date;
    lastStatus = dated[0].status;
  }

  const studentName = dated[0]?.studentName || '';

  return {
    studentName,
    rollNumber,
    className,
    totalDaysRecorded,
    present,
    absent,
    late,
    lastRecordDate,
    lastStatus,
  };
}

/**
 * If exactly one student matches this phone, link whatsapp_users to that roll number.
 */
export async function tryAutoLinkParentToStudent(waPhone: string): Promise<void> {
  const matches = await findStudentsByParentPhone(waPhone);
  if (matches.length !== 1) {
    return;
  }
  const s = matches[0];
  const childName = [s.firstName, s.lastName].filter(Boolean).join(' ').trim();
  await db
    .collection('whatsapp_users')
    .doc(waPhone)
    .set(
      {
        studentId: s.rollNumber,
        name: childName || s.parentName || undefined,
        role: 'parent',
      },
      { merge: true }
    );
  console.log(`Auto-linked WhatsApp user ${waPhone} to student ${s.rollNumber}`);
}

/**
 * Load linked students + attendance summary for AI context.
 */
export async function loadSchoolContextForWhatsApp(
  waPhone: string,
  user: User | null
): Promise<SchoolContextForWhatsApp> {
  let students = await findStudentsByParentPhone(waPhone);

  if (user?.studentId) {
    const linked = await loadStudentByUserLink(user);
    if (linked && !students.some((s) => s.rollNumber === linked.rollNumber)) {
      students = [linked, ...students];
    }
  }

  const primaryStudent = students[0];
  let attendanceSummary: AttendanceRollup | undefined;
  if (primaryStudent) {
    attendanceSummary = await getAttendanceRollupForStudent(
      primaryStudent.rollNumber,
      primaryStudent.class
    );
  }

  return { students, primaryStudent, attendanceSummary };
}

export function formatSchoolContextForPrompt(ctx: SchoolContextForWhatsApp): string | undefined {
  if (!ctx.primaryStudent) {
    return undefined;
  }
  const s = ctx.primaryStudent;
  const name = [s.firstName, s.lastName].filter(Boolean).join(' ').trim();
  const lines: string[] = [
    `Linked student on file: ${name || '(name missing)'} — class ${s.class || 'unknown'}, roll ${s.rollNumber}.`,
  ];
  if (ctx.attendanceSummary && ctx.attendanceSummary.totalDaysRecorded > 0) {
    const a = ctx.attendanceSummary;
    lines.push(
      `Attendance in records: ${a.present} present, ${a.absent} absent, ${a.late} late across ${a.totalDaysRecorded} class session(s).`
    );
    if (a.lastRecordDate) {
      lines.push(`Latest recorded class date: ${a.lastRecordDate} (status: ${a.lastStatus ?? 'n/a'}).`);
    }
  } else {
    lines.push('No attendance records matched this student in Firestore yet.');
  }
  if (ctx.students.length > 1) {
    lines.push(`Note: ${ctx.students.length} students share this parent phone; using the first match for summaries.`);
  }
  return lines.join('\n');
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
      const user = userDoc.data() as User;
      if (!user.studentId) {
        await tryAutoLinkParentToStudent(phoneNumber);
        const refreshed = await db.collection('whatsapp_users').doc(phoneNumber).get();
        return refreshed.data() as User;
      }
      return user;
    }

    const newUser: User = {
      phoneNumber,
      createdAt: new Date(),
      role: 'parent',
    };

    await db.collection('whatsapp_users').doc(phoneNumber).set(newUser);
    console.log(`👤 Created new user: ${phoneNumber}`);

    await tryAutoLinkParentToStudent(phoneNumber);
    const refreshed = await db.collection('whatsapp_users').doc(phoneNumber).get();
    return refreshed.data() as User;
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
): Promise<Array<{ role: string; text: string }>> {
  try {
    const snapshot = await db
      .collection('whatsapp_conversations')
      .where('userId', '==', phoneNumber)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const history: Array<{ role: string; text: string }> = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Add user message
      history.push({
        role: 'user',
        text: data.userMessage,
      });
      // Add AI response
      history.push({
        role: 'model',
        text: data.aiResponse,
      });
    });

    return history.reverse(); // Oldest to newest
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

/**
 * Save conversation turn for AI context
 * 
 * WHY: Store user message and AI response for:
 * - Building conversation history
 * - Training and improving AI
 * - Analytics and insights
 */
export async function saveConversationTurn(
  userId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  try {
    const conversationId = `${userId}_${Date.now()}`;
    
    await db.collection('whatsapp_conversations').add({
      userId,
      conversationId,
      userMessage,
      aiResponse,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date(),
    });
    
    console.log(`💬 Saved conversation turn for user: ${userId}`);
  } catch (error) {
    console.error('Error saving conversation turn:', error);
    throw error;
  }
}


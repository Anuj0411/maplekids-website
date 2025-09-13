"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserCompletely = exports.createUser = exports.deleteUserFromAuth = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin SDK
admin.initializeApp();
/**
 * Cloud Function to delete a user from Firebase Authentication
 * This function can be called from your frontend with proper authentication
 */
exports.deleteUserFromAuth = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if the user has admin role
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
    }
    const userData = userDoc.data();
    if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users');
    }
    const { email } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }
    try {
        // Get the user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        // Delete the user from Firebase Authentication
        await admin.auth().deleteUser(userRecord.uid);
        console.log(`User ${email} deleted from Firebase Authentication`);
        return { success: true, message: `User ${email} deleted successfully` };
    }
    catch (error) {
        console.error('Error deleting user from Firebase Auth:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete user from Firebase Auth');
    }
});
/**
 * Cloud Function to create a new user (both Firestore and Auth)
 * This function handles user creation without affecting the admin's session
 */
exports.createUser = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if the user has admin role
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
    }
    const userData = userDoc.data();
    if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can create users');
    }
    const { email, password, userData: newUserData } = data;
    if (!email || !password || !newUserData) {
        throw new functions.https.HttpsError('invalid-argument', 'Email, password, and user data are required');
    }
    try {
        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });
        // For students, use roll number as the document ID in Firestore
        // For other users, use Firebase Auth UID
        const documentId = newUserData.role === 'student' && newUserData.rollNumber
            ? newUserData.rollNumber
            : userRecord.uid;
        // Save user data to Firestore
        await admin.firestore().collection('users').doc(documentId).set(Object.assign(Object.assign({}, newUserData), { uid: userRecord.uid, email: userRecord.email, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: context.auth.uid }));
        // If it's a student, also create a student record
        if (newUserData.role === 'student' && newUserData.class && newUserData.rollNumber) {
            await admin.firestore().collection('students').doc(newUserData.rollNumber).set({
                firstName: newUserData.firstName,
                lastName: newUserData.lastName,
                email: newUserData.email,
                phone: newUserData.phone,
                address: newUserData.address,
                class: newUserData.class,
                rollNumber: newUserData.rollNumber,
                userId: newUserData.rollNumber,
                authUid: userRecord.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: context.auth.uid,
            });
        }
        console.log(`User ${email} created successfully by admin ${context.auth.uid}`);
        return {
            success: true,
            message: `User ${email} created successfully`,
            userId: userRecord.uid,
            documentId: documentId
        };
    }
    catch (error) {
        console.error('Error creating user:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create user');
    }
});
/**
 * Cloud Function to delete a user completely (both Firestore and Auth)
 * This function handles the complete user deletion process
 */
exports.deleteUserCompletely = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if the user has admin role
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
    }
    const userData = userDoc.data();
    if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users');
    }
    const { userId, email } = data;
    if (!userId || !email) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID and email are required');
    }
    try {
        // Delete from Firestore
        await admin.firestore().collection('users').doc(userId).delete();
        // Delete associated student record if it exists
        if ((userData === null || userData === void 0 ? void 0 : userData.role) === 'student') {
            try {
                await admin.firestore().collection('students').doc(userData.rollNumber || '').delete();
            }
            catch (studentError) {
                console.warn('Could not delete associated student record:', studentError);
            }
        }
        // Delete from Firebase Authentication
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            await admin.auth().deleteUser(userRecord.uid);
            console.log(`User ${email} deleted from Firebase Authentication`);
        }
        catch (authError) {
            console.warn('Could not delete user from Firebase Auth:', authError);
        }
        console.log(`User ${email} deleted completely`);
        return { success: true, message: `User ${email} deleted completely` };
    }
    catch (error) {
        console.error('Error deleting user completely:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete user completely');
    }
});
//# sourceMappingURL=index.js.map
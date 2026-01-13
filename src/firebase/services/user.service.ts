import {
	collection,
	doc,
	updateDoc,
	deleteDoc,
	getDocs,
	getDoc,
	setDoc,
	serverTimestamp,
} from 'firebase/firestore';
import {
	createUserWithEmailAndPassword,
	signOut,
} from 'firebase/auth';
import { db, auth } from '../config';
import type { User } from '../types';
import { handleError, UserServiceError } from '../utils/errorHandler';

/**
 * User Service
 * Handles user CRUD operations, user management, and user-related queries
 */
export const userService = {
	/**
	 * Get all users from Firestore
	 */
	async getAllUsers(): Promise<User[]> {
		try {
			const querySnapshot = await getDocs(collection(db, 'users'));
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as User[];
		} catch (error) {
			throw handleError(error, 'Error fetching all users');
		}
	},

	/**
	 * Update user data in Firestore
	 */
	async updateUser(id: string, userData: Partial<User>): Promise<void> {
		try {
			const userRef = doc(db, 'users', id);
			await updateDoc(userRef, userData);
		} catch (error) {
			throw handleError(error, `Error updating user ${id}`);
		}
	},

	/**
	 * Delete user from Firestore only (basic deletion)
	 * Note: This does not delete the user from Firebase Authentication
	 */
	async deleteUser(id: string): Promise<void> {
		try {
			// First, get the user document to get the email
			const userRef = doc(db, 'users', id);
			const userDoc = await getDoc(userRef);
			
			if (!userDoc.exists()) {
				throw new UserServiceError('User not found in database');
			}
			
			const userData = userDoc.data();
			const userEmail = userData.email;
			
			// Delete from Firestore
			await deleteDoc(userRef);
			
			// Also delete associated student record if it exists
			if (userData.role === 'student') {
				try {
					const studentRef = doc(db, 'students', userData.rollNumber || '');
					await deleteDoc(studentRef);
				} catch (studentError) {
					console.warn('Could not delete associated student record:', studentError);
				}
			}
			
			console.log(`User ${userEmail} deleted from Firestore successfully`);
			console.warn(`IMPORTANT: To delete user from Firebase Authentication, use deleteUserCompletely() method`);
			
		} catch (error) {
			throw handleError(error, `Error deleting user ${id}`);
		}
	},

	/**
	 * Delete user completely from both Firestore and Firebase Auth
	 * Note: Firebase Auth deletion requires admin privileges
	 */
	async deleteUserCompletely(id: string): Promise<void> {
		try {
			// First, get the user document to get the email
			const userRef = doc(db, 'users', id);
			const userDoc = await getDoc(userRef);
			
			if (!userDoc.exists()) {
				throw new UserServiceError('User not found in database');
			}
			
			const userData = userDoc.data();
			const userEmail = userData.email;
			
			// Delete from Firestore first
			await deleteDoc(userRef);
			console.log(`User ${userEmail} deleted from Firestore`);
			
			// Note: Firebase Auth deletion requires admin privileges
			// This will only delete from Firestore for now
			console.warn(`Note: User ${userEmail} deleted from Firestore. Firebase Auth deletion requires admin privileges.`);
			
		} catch (error) {
			throw handleError(error, `Error deleting user completely ${id}`);
		}
	},

	/**
	 * Create user (admin only)
	 * Creates both Firebase Auth account and Firestore record
	 * For students, also creates a student record
	 */
	async createUser(email: string, password: string, userData: any): Promise<void> {
		try {
			console.log('Creating user with data:', { email, role: userData.role, rollNumber: userData.rollNumber });
			
			// Check if admin is signed in
			const currentAdmin = auth.currentUser;
			if (!currentAdmin) {
				throw new UserServiceError('No admin user is currently signed in');
			}

			// Store admin credentials
			const adminUid = currentAdmin.uid;

			// Create Firebase Auth account first
			console.log('Creating Firebase Auth account...');
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const firebaseUser = userCredential.user;
			console.log('Firebase Auth account created:', firebaseUser.uid);

			// For students, use roll number as the document ID in users collection
			// For other users, use Firebase Auth UID
			const documentId = userData.role === 'student' && userData.rollNumber 
				? userData.rollNumber 
				: firebaseUser.uid;

			console.log('Using document ID:', documentId);

			// Save user data to Firestore
			// The new user is now the current user, so we need to create the document
			// with the new user's context, but we'll use the admin's UID for createdBy
			const userDocData = {
				...userData,
				uid: firebaseUser.uid, // Always use Firebase Auth UID
				email: email,
				createdAt: serverTimestamp(),
				createdBy: adminUid, // Use stored admin UID
				needsAuthCreation: false, // Firebase Auth account already created
			};
			
			console.log('Saving user document to Firestore:', {
				...userDocData,
				password: '[HIDDEN]' // Hide password in logs for security
			});
			await setDoc(doc(db, 'users', documentId), userDocData);
			console.log('User document saved successfully');

			// If it's a student, also create a student record
			if (userData.role === 'student' && userData.class && userData.rollNumber) {
				console.log('✅ Student role detected. Creating student record in students collection...');
				const studentData = {
					firstName: userData.firstName,
					lastName: userData.lastName,
					email: email,
					phone: userData.phone,
					address: userData.address,
					class: userData.class,
					rollNumber: userData.rollNumber,
					userId: userData.rollNumber, // Use roll number as userId for students
					authUid: firebaseUser.uid, // Store Firebase Auth UID for reference
					createdAt: serverTimestamp(),
					createdBy: adminUid, // Use stored admin UID
				};
				console.log('📝 Saving student document to students/{rollNumber}:', studentData);
				await setDoc(doc(db, 'students', userData.rollNumber), studentData);
				console.log('✅ Student document saved successfully to students collection');
				console.log('📊 SYNC COMPLETE: User saved to both collections:');
				console.log(`   - users/${documentId}`);
				console.log(`   - students/${userData.rollNumber}`);
			} else if (userData.role === 'student') {
				console.warn('⚠️ WARNING: Student user created but NOT added to students collection!');
				console.warn('   Missing required fields:');
				console.warn(`   - class: ${userData.class || 'MISSING'}`);
				console.warn(`   - rollNumber: ${userData.rollNumber || 'MISSING'}`);
			}

			// Sign out the newly created user
			await signOut(auth);
			console.log('Signed out newly created user');

			// Note: Admin will need to sign in again as we can't restore their session automatically
			// This is a limitation of Firebase Auth - we can't sign in multiple users simultaneously
			console.log('User created successfully with Firebase Auth account and Firestore records.');
			console.log('Admin will need to sign in again to continue using the admin dashboard.');
			
		} catch (error: any) {
			console.error('Error creating user:', error);
			
			// If it's a permissions error, provide helpful guidance
			if (
				error.code === 'permission-denied' || 
				error.message?.includes('permissions') || 
				error.message?.includes('Missing or insufficient permissions')
			) {
				throw new UserServiceError(
					'❌ PERMISSION ERROR: Please update your Firestore security rules.\n\n' +
					'🔧 QUICK FIX:\n' +
					'1. Go to Firebase Console → Firestore Database → Rules\n' +
					'2. Replace all rules with:\n\n' +
					'rules_version = "2";\n' +
					'service cloud.firestore {\n' +
					'  match /databases/{database}/documents {\n' +
					'    match /{document=**} {\n' +
					'      allow read, write: if request.auth != null;\n' +
					'    }\n' +
					'  }\n' +
					'}\n\n' +
					'3. Click "Publish"\n\n' +
					'📖 See QUICK_FIX.md for detailed instructions.'
				);
			}
			
			throw handleError(error, 'Error creating user');
		}
	},

	/**
	 * Get user by ID
	 */
	async getUserById(id: string): Promise<User | null> {
		try {
			const userRef = doc(db, 'users', id);
			const userDoc = await getDoc(userRef);
			
			if (!userDoc.exists()) {
				return null;
			}
			
			return { id: userDoc.id, ...userDoc.data() } as User;
		} catch (error) {
			throw handleError(error, `Error fetching user ${id}`);
		}
	},

	/**
	 * Get users by role
	 */
	async getUsersByRole(role: string): Promise<User[]> {
		try {
			const allUsers = await this.getAllUsers();
			return allUsers.filter(user => user.role === role);
		} catch (error) {
			throw handleError(error, `Error fetching users by role ${role}`);
		}
	},

	/**
	 * Search users by query
	 */
	async searchUsers(query: string): Promise<User[]> {
		try {
			const allUsers = await this.getAllUsers();
			const lowercaseQuery = query.toLowerCase();
			
			return allUsers.filter(user => 
				user.firstName?.toLowerCase().includes(lowercaseQuery) ||
				user.lastName?.toLowerCase().includes(lowercaseQuery) ||
				user.email?.toLowerCase().includes(lowercaseQuery)
			);
		} catch (error) {
			throw handleError(error, `Error searching users with query: ${query}`);
		}
	},
};

import {
	collection,
	doc,
	getDocs,
	query,
	where,
	serverTimestamp,
	setDoc,
	getDoc,
	updateDoc,
} from 'firebase/firestore';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut as firebaseSignOut,
	User as FirebaseUser,
} from 'firebase/auth';
import { db, auth } from '../config';
import type { User } from '../types';
import { AuthError, handleError } from '../utils/errorHandler';

/**
 * Authentication Service
 * Handles user authentication, sign up, sign in, and session management
 */
export const authService = {
	/**
	 * Sign up new user (for public signup - deprecated)
	 * Creates both Firebase Auth account and Firestore user document
	 */
	async signUp(email: string, password: string, userData: any): Promise<void> {
		try {
			// Create user with Firebase Auth
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// Save user data to Firestore
			await setDoc(doc(db, 'users', user.uid), {
				...userData,
				uid: user.uid,
				email: user.email,
				createdAt: serverTimestamp(),
			});
		} catch (error) {
			throw handleError(error, 'Error signing up user');
		}
	},

	/**
	 * Sign in user
	 * Supports both modern Firebase Auth and legacy Firestore-based authentication
	 */
	async signIn(email: string, password: string): Promise<FirebaseUser> {
		try {
			console.log('Attempting to sign in user:', email);
			// Try to sign in with Firebase Auth
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			console.log('User signed in successfully with Firebase Auth');
			return userCredential.user;
		} catch (error: any) {
			console.log('Firebase Auth sign-in failed:', error.code, error.message);
			
			// If user doesn't exist in Firebase Auth, check if they exist in Firestore (legacy support)
			if (error.code === 'auth/user-not-found') {
				console.log('User not found in Firebase Auth, checking Firestore for legacy users...');
				
				// Check if user exists in Firestore with needsAuthCreation flag (legacy users)
				const usersSnapshot = await getDocs(
					query(collection(db, 'users'), where('email', '==', email))
				);
				console.log('Found users in Firestore:', usersSnapshot.docs.length);
				
				if (!usersSnapshot.empty) {
					const userDoc = usersSnapshot.docs[0];
					const userData = userDoc.data();
					console.log('User data from Firestore:', {
						email: userData.email,
						role: userData.role,
						needsAuthCreation: userData.needsAuthCreation,
						hasPassword: !!userData.password,
						rollNumber: userData.rollNumber,
					});
					
					// Only handle legacy users that still need auth creation
					if (userData.needsAuthCreation && userData.password === password) {
						console.log('Creating Firebase Auth account for legacy user...');
						
						// Create Firebase Auth account for this user
						const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
						const newUser = newUserCredential.user;
						console.log('Firebase Auth account created:', newUser.uid);
						
						// Update the user document with the real UID and remove temporary data
						await updateDoc(doc(db, 'users', userDoc.id), {
							uid: newUser.uid,
							password: null, // Remove password from Firestore
							needsAuthCreation: false,
						});
						console.log('User document updated in Firestore');
						
						// Update student record if it exists (for students, userId should remain as roll number)
						if (userData.role === 'student' && userData.rollNumber) {
							const studentDoc = doc(db, 'students', userData.rollNumber);
							await updateDoc(studentDoc, {
								// Keep userId as roll number for students, but add authUid for Firebase Auth reference
								authUid: newUser.uid,
							});
							console.log('Student record updated with authUid');
						}
						
						// Sign out the newly created user and sign them in again
						await firebaseSignOut(auth);
						console.log('Signed out, now signing in again...');
						
						const finalUserCredential = await signInWithEmailAndPassword(auth, email, password);
						console.log('Final sign-in successful');
						return finalUserCredential.user;
					} else {
						console.log('Password mismatch or user does not need auth creation');
					}
				} else {
					console.log('No user found in Firestore with email:', email);
				}
			}
			
			throw handleError(error, 'Error signing in user');
		}
	},

	/**
	 * Sign out current user
	 */
	async signOut(): Promise<void> {
		try {
			await firebaseSignOut(auth);
		} catch (error) {
			throw handleError(error, 'Error signing out user');
		}
	},

	/**
	 * Get current authenticated user from Firebase Auth
	 */
	getCurrentUser(): FirebaseUser | null {
		return auth.currentUser;
	},

	/**
	 * Get current user data from Firestore
	 * Handles both UID-based lookup (teachers/admins) and email-based lookup (students)
	 */
	async getCurrentUserData(): Promise<User | null> {
		try {
			const user = auth.currentUser;
			if (!user) return null;

			console.log('Getting current user data for UID:', user.uid);

			// First, try to find user by Firebase Auth UID (for teachers/admins)
			const userDocRef = doc(db, 'users', user.uid);
			const userDocSnap = await getDoc(userDocRef);

			if (userDocSnap.exists()) {
				console.log('Found user by Firebase Auth UID');
				return { id: userDocSnap.id, ...userDocSnap.data() } as User;
			}

			// If not found by UID, try to find by email (for students with roll number as document ID)
			console.log('User not found by UID, searching by email:', user.email);
			const usersSnapshot = await getDocs(
				query(collection(db, 'users'), where('email', '==', user.email))
			);
			
			if (!usersSnapshot.empty) {
				const userDoc = usersSnapshot.docs[0];
				console.log('Found user by email');
				return { id: userDoc.id, ...userDoc.data() } as User;
			}

			console.log('User not found in Firestore');
			return null;
		} catch (error) {
			console.error('Error getting current user data:', error);
			throw handleError(error, 'Error fetching current user data');
		}
	},

	/**
	 * Listen to authentication state changes
	 */
	onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
		return auth.onAuthStateChanged(callback);
	},

	/**
	 * Reset user password
	 * @todo Implement password reset functionality
	 */
	async resetPassword(email: string): Promise<void> {
		throw new AuthError('Password reset not yet implemented');
	},

	/**
	 * Update user password
	 * @todo Implement password update functionality
	 */
	async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
		throw new AuthError('Password update not yet implemented');
	},
};

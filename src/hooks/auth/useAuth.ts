import { useState, useEffect, useCallback } from 'react';
import {
	User as FirebaseUser,
	signOut as firebaseSignOut,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	updatePassword as firebaseUpdatePassword,
	reauthenticateWithCredential,
	EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import type { User } from '@/firebase/types';

/**
 * Authentication Hook
 * 
 * Manages authentication state and provides authentication methods.
 * Includes real-time auth state updates via Firebase onAuthStateChanged.
 * 
 * @returns {Object} Authentication state and methods
 * 
 * @property {FirebaseUser | null} user - Current Firebase user
 * @property {boolean} loading - Whether auth operation is in progress
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {string | null} error - Last authentication error message
 * @property {Function} signIn - Sign in with email and password
 * @property {Function} signUp - Create new user account
 * @property {Function} resetPassword - Send password reset email
 * @property {Function} reauthenticate - Reauthenticate user for sensitive operations
 * @property {Function} updatePassword - Update user password
 * @property {Function} signOut - Sign out current user
 * 
 * @example
 * // Sign in
 * const { signIn, loading, error } = useAuth();
 * await signIn('user@example.com', 'password123');
 * 
 * @example
 * // Sign up
 * const { signUp, loading, error } = useAuth();
 * await signUp('user@example.com', 'password123', {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   role: 'student'
 * });
 * 
 * @example
 * // Reset password
 * const { resetPassword } = useAuth();
 * await resetPassword('user@example.com');
 * 
 * @example
 * // Update password
 * const { updatePassword } = useAuth();
 * await updatePassword('currentPassword', 'newPassword123');
 * 
 * @example
 * // Sign out
 * const { signOut } = useAuth();
 * await signOut();
 */
export const useAuth = () => {
	const [user, setUser] = useState<FirebaseUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Subscribe to authentication state changes
		const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
			setUser(firebaseUser);
			setLoading(false);
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, []);

	/**
	 * Sign in with email and password
	 */
	const signIn = useCallback(async (
		email: string,
		password: string
	): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			await signInWithEmailAndPassword(auth, email, password);

			// User state will auto-update via onAuthStateChanged listener

		} catch (err: any) {
			console.error('Error signing in:', err);

			// Map Firebase errors to user-friendly messages
			let errorMessage = 'Failed to sign in';

			if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
				errorMessage = 'Invalid email or password';
			} else if (err.code === 'auth/user-disabled') {
				errorMessage = 'This account has been disabled';
			} else if (err.code === 'auth/too-many-requests') {
				errorMessage = 'Too many failed attempts. Please try again later';
			} else if (err.code === 'auth/network-request-failed') {
				errorMessage = 'Network error. Please check your connection';
			}

			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Sign up new user with email and password
	 */
	const signUp = useCallback(async (
		email: string,
		password: string,
		userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			// Create Firebase Auth user
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);

			const { uid } = userCredential.user;

			// Create Firestore user document
			await setDoc(doc(db, 'users', uid), {
				...userData,
				email,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			// User state will auto-update via onAuthStateChanged listener
			// User is automatically signed in after creation

		} catch (err: any) {
			console.error('Error signing up:', err);

			// Map Firebase errors to user-friendly messages
			let errorMessage = 'Failed to create account';

			if (err.code === 'auth/email-already-in-use') {
				errorMessage = 'An account with this email already exists';
			} else if (err.code === 'auth/invalid-email') {
				errorMessage = 'Invalid email address';
			} else if (err.code === 'auth/weak-password') {
				errorMessage = 'Password should be at least 6 characters';
			} else if (err.code === 'auth/operation-not-allowed') {
				errorMessage = 'Email/password accounts are not enabled';
			} else if (err.code === 'auth/network-request-failed') {
				errorMessage = 'Network error. Please check your connection';
			}

			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Send password reset email
	 */
	const resetPassword = useCallback(async (
		email: string
	): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			await sendPasswordResetEmail(auth, email);

			// Success - email sent

		} catch (err: any) {
			console.error('Error sending password reset email:', err);

			// Map Firebase errors to user-friendly messages
			let errorMessage = 'Failed to send password reset email';

			if (err.code === 'auth/invalid-email') {
				errorMessage = 'Invalid email address';
			} else if (err.code === 'auth/user-not-found') {
				errorMessage = 'No account found with this email';
			} else if (err.code === 'auth/too-many-requests') {
				errorMessage = 'Too many requests. Please try again later';
			} else if (err.code === 'auth/network-request-failed') {
				errorMessage = 'Network error. Please check your connection';
			}

			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Reauthenticate user for sensitive operations
	 */
	const reauthenticate = useCallback(async (
		password: string
	): Promise<void> => {
		try {
			if (!user || !user.email) {
				throw new Error('No user is currently signed in');
			}

			setLoading(true);
			setError(null);

			// Create credentials with current email and password
			const credential = EmailAuthProvider.credential(
				user.email,
				password
			);

			// Reauthenticate user
			await reauthenticateWithCredential(user, credential);

			// Success - user reauthenticated

		} catch (err: any) {
			console.error('Error reauthenticating user:', err);

			// Map Firebase errors to user-friendly messages
			let errorMessage = 'Failed to verify password';

			if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
				errorMessage = 'Incorrect password';
			} else if (err.code === 'auth/too-many-requests') {
				errorMessage = 'Too many failed attempts. Please try again later';
			} else if (err.code === 'auth/network-request-failed') {
				errorMessage = 'Network error. Please check your connection';
			} else if (err.message.includes('No user')) {
				errorMessage = 'You must be signed in to perform this action';
			}

			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [user]);

	/**
	 * Update user password
	 */
	const updatePassword = useCallback(async (
		currentPassword: string,
		newPassword: string
	): Promise<void> => {
		try {
			if (!user) {
				throw new Error('No user is currently signed in');
			}

			setLoading(true);
			setError(null);

			// Step 1: Reauthenticate user (required for password change)
			await reauthenticate(currentPassword);

			// Step 2: Update password
			await firebaseUpdatePassword(user, newPassword);

			// Success - password updated

		} catch (err: any) {
			console.error('Error updating password:', err);

			// Map Firebase errors to user-friendly messages
			let errorMessage = 'Failed to update password';

			if (err.code === 'auth/weak-password') {
				errorMessage = 'New password should be at least 6 characters';
			} else if (err.code === 'auth/requires-recent-login') {
				errorMessage = 'Please sign in again to change your password';
			} else if (err.message.includes('Incorrect password')) {
				// From reauthenticate
				errorMessage = 'Current password is incorrect';
			} else if (err.message.includes('No user')) {
				errorMessage = 'You must be signed in to change your password';
			} else if (err.code === 'auth/network-request-failed') {
				errorMessage = 'Network error. Please check your connection';
			}

			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [user, reauthenticate]);

	/**
	 * Sign out the current user
	 */
	const signOut = useCallback(async (): Promise<void> => {
		try {
			await firebaseSignOut(auth);
			// User state will automatically update via onAuthStateChanged listener
		} catch (err: any) {
			console.error('Error signing out:', err);
			throw new Error(err.message || 'Failed to sign out');
		}
	}, []);

	return {
		user,
		loading,
		isAuthenticated: !!user,
		error,
		signIn,
		signUp,
		resetPassword,
		reauthenticate,
		updatePassword,
		signOut,
	};
};

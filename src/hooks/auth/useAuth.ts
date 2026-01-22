import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/firebase/config';

/**
 * Authentication Hook
 * 
 * Manages authentication state and provides real-time updates
 * when the user signs in or out.
 * 
 * @returns {Object} Authentication state
 * @property {FirebaseUser | null} user - Current Firebase user
 * @property {boolean} loading - Whether authentication state is being loaded
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * 
 * @example
 * ```tsx
 * const { user, loading, isAuthenticated } = useAuth();
 * 
 * if (loading) return <div>Loading...</div>;
 * if (!isAuthenticated) return <Navigate to="/signin" />;
 * 
 * return <div>Welcome {user?.email}</div>;
 * ```
 */
export const useAuth = () => {
	const [user, setUser] = useState<FirebaseUser | null>(null);
	const [loading, setLoading] = useState(true);

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
		signOut,
	};
};

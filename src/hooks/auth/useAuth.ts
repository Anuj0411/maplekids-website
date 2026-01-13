import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
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

	return {
		user,
		loading,
		isAuthenticated: !!user,
	};
};

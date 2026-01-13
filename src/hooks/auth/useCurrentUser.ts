import { useState, useEffect } from 'react';
import type { User } from '@/firebase/types';
import { authService } from '@/firebase/services';

/**
 * Current User Hook
 * 
 * Fetches the current user's data from Firestore.
 * This includes all user profile information, not just auth data.
 * 
 * @returns {Object} Current user data and loading state
 * @property {User | null} userData - Current user data from Firestore
 * @property {boolean} loading - Whether user data is being loaded
 * @property {string | null} error - Error message if fetch failed
 * @property {Function} refetch - Function to manually refetch user data
 * 
 * @example
 * ```tsx
 * const { userData, loading, error, refetch } = useCurrentUser();
 * 
 * if (loading) return <div>Loading user data...</div>;
 * if (error) return <div>Error: {error}</div>;
 * if (!userData) return <div>No user found</div>;
 * 
 * return (
 *   <div>
 *     <h1>Welcome {userData.firstName} {userData.lastName}</h1>
 *     <p>Role: {userData.role}</p>
 *     <button onClick={refetch}>Refresh</button>
 *   </div>
 * );
 * ```
 */
export const useCurrentUser = () => {
	const [userData, setUserData] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchUserData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await authService.getCurrentUserData();
			setUserData(data);
		} catch (err: any) {
			console.error('Error fetching current user data:', err);
			setError(err.message || 'Failed to fetch user data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	return {
		userData,
		loading,
		error,
		refetch: fetchUserData,
	};
};

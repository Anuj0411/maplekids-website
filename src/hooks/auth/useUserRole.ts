import { useCurrentUser } from './useCurrentUser';

/**
 * User Role Hook
 * 
 * Provides role-based information and permission checks for the current user.
 * Built on top of useCurrentUser hook.
 * 
 * @returns {Object} User role information
 * @property {string | undefined} role - User's role ('admin', 'teacher', 'student')
 * @property {boolean} isAdmin - Whether user is an admin
 * @property {boolean} isTeacher - Whether user is a teacher  
 * @property {boolean} isStudent - Whether user is a student
 * @property {boolean} isGuest - Whether user has no role (guest)
 * @property {boolean} loading - Whether user data is being loaded
 * 
 * @example
 * ```tsx
 * const { isAdmin, isTeacher, isStudent, loading } = useUserRole();
 * 
 * if (loading) return <div>Loading...</div>;
 * 
 * if (isAdmin) {
 *   return <AdminDashboard />;
 * }
 * 
 * if (isTeacher) {
 *   return <TeacherDashboard />;
 * }
 * 
 * if (isStudent) {
 *   return <StudentDashboard />;
 * }
 * 
 * return <GuestDashboard />;
 * ```
 */
export const useUserRole = () => {
	const { userData, loading, error } = useCurrentUser();

	const role = userData?.role;

	return {
		role,
		isAdmin: role === 'admin',
		isTeacher: role === 'teacher',
		isStudent: role === 'student',
		isGuest: !role,
		loading,
		error,
	};
};

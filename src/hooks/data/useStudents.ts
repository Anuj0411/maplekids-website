import { useState, useEffect, useCallback } from 'react';
import type { Student } from '@/firebase/types';
import { studentService } from '@/firebase/services';

interface UseStudentsOptions {
	className?: string;
	autoFetch?: boolean;
}

/**
 * Students Data Hook
 * 
 * Fetches and manages student data with optional class filtering.
 * Provides loading states, error handling, and manual refetch capability.
 * 
 * @param options - Configuration options
 * @param options.className - Optional class name to filter students
 * @param options.autoFetch - Whether to automatically fetch on mount (default: true)
 * 
 * @returns Student data and control functions
 * 
 * @example
 * // Fetch all students
 * const { students, loading, error, refetch } = useStudents();
 * 
 * @example
 * // Fetch students by class
 * const { students, loading } = useStudents({ className: 'nursery' });
 * 
 * @example
 * // Manual fetch control
 * const { students, loading, fetchStudents } = useStudents({ autoFetch: false });
 * // Later: fetchStudents('lkg');
 */
export const useStudents = (options: UseStudentsOptions = {}) => {
	const { className, autoFetch = true } = options;

	const [students, setStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(autoFetch);
	const [error, setError] = useState<string | null>(null);

	const fetchStudents = useCallback(async (classFilter?: string) => {
		try {
			setLoading(true);
			setError(null);

			const data = classFilter
				? await studentService.getStudentsByClass(classFilter)
				: await studentService.getAllStudents();

			setStudents(data);
		} catch (err: any) {
			console.error('Error fetching students:', err);
			setError(err.message || 'Failed to fetch students');
			setStudents([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (autoFetch) {
			fetchStudents(className);
		}
	}, [className, autoFetch, fetchStudents]);

	const refetch = useCallback(() => {
		fetchStudents(className);
	}, [className, fetchStudents]);

	return {
		students,
		loading,
		error,
		refetch,
		fetchStudents,
	};
};

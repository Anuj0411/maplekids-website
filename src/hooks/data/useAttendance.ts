import { useState, useEffect, useCallback } from 'react';
import type { Attendance } from '@/firebase/types';
import { attendanceService } from '@/firebase/services';

interface UseAttendanceOptions {
	date?: Date;
	rollNumber?: string;
	startDate?: Date;
	endDate?: Date;
	autoFetch?: boolean;
}

/**
 * Attendance Data Hook
 * 
 * Fetches attendance records with flexible filtering options.
 * Supports fetching by date, student, or date range.
 * 
 * @param options - Configuration options
 * @param options.date - Specific date to fetch attendance for
 * @param options.rollNumber - Student roll number to filter by
 * @param options.startDate - Start date for range queries
 * @param options.endDate - End date for range queries
 * @param options.autoFetch - Whether to automatically fetch on mount (default: true)
 * 
 * @returns Attendance records and control functions
 * 
 * @example
 * // Fetch attendance for today
 * const { attendance, loading } = useAttendance({ date: new Date() });
 * 
 * @example
 * // Fetch student attendance history
 * const { attendance, loading } = useAttendance({ rollNumber: '2024001' });
 * 
 * @example
 * // Fetch attendance for date range
 * const { attendance, loading } = useAttendance({
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-01-31')
 * });
 */
export const useAttendance = (options: UseAttendanceOptions = {}) => {
	const { date, rollNumber, startDate, endDate, autoFetch = true } = options;

	const [attendance, setAttendance] = useState<Attendance[]>([]);
	const [loading, setLoading] = useState(autoFetch);
	const [error, setError] = useState<string | null>(null);

	const fetchAttendance = useCallback(async (fetchOptions?: UseAttendanceOptions) => {
		try {
			setLoading(true);
			setError(null);

			const opts = fetchOptions || options;
			let data: Attendance[] = [];

			if (opts.rollNumber) {
				// All attendance for a student
				data = await attendanceService.getAttendanceByStudent(opts.rollNumber);
			} else if (opts.date) {
				// Attendance for specific date
				const dateStr = opts.date.toISOString().split('T')[0];
				data = await attendanceService.getAttendanceByDate(dateStr);
			} else if (opts.startDate && opts.endDate) {
				// Attendance for date range
				const startStr = opts.startDate.toISOString().split('T')[0];
				const endStr = opts.endDate.toISOString().split('T')[0];
				data = await attendanceService.getAttendanceByDateRange(startStr, endStr);
			} else {
				// Default: today's attendance
				const todayStr = new Date().toISOString().split('T')[0];
				data = await attendanceService.getAttendanceByDate(todayStr);
			}

			setAttendance(data);
		} catch (err: any) {
			console.error('Error fetching attendance:', err);
			setError(err.message || 'Failed to fetch attendance');
			setAttendance([]);
		} finally {
			setLoading(false);
		}
	}, [options]);

	useEffect(() => {
		if (autoFetch) {
			fetchAttendance();
		}
	}, [date, rollNumber, startDate, endDate, autoFetch, fetchAttendance]);

	const refetch = useCallback(() => {
		fetchAttendance();
	}, [fetchAttendance]);

	return {
		attendance,
		loading,
		error,
		refetch,
		fetchAttendance,
	};
};

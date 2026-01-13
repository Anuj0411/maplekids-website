import { useState, useEffect, useCallback } from 'react';
import type { FinancialRecord } from '@/firebase/types';
import { financialService } from '@/firebase/services';

interface UseFinancialRecordsOptions {
	type?: 'income' | 'expense';
	autoFetch?: boolean;
}

/**
 * Financial Records Data Hook
 * 
 * Fetches financial records with optional filtering by type.
 * Provides loading states, error handling, and manual refetch capability.
 * 
 * @param options - Configuration options
 * @param options.type - Filter by 'income' or 'expense'
 * @param options.autoFetch - Whether to automatically fetch on mount (default: true)
 * 
 * @returns Financial records and control functions
 * 
 * @example
 * // Fetch all financial records
 * const { records, loading } = useFinancialRecords();
 * 
 * @example
 * // Fetch only income records
 * const { records, loading } = useFinancialRecords({ type: 'income' });
 */
export const useFinancialRecords = (options: UseFinancialRecordsOptions = {}) => {
	const { type, autoFetch = true } = options;

	const [records, setRecords] = useState<FinancialRecord[]>([]);
	const [loading, setLoading] = useState(autoFetch);
	const [error, setError] = useState<string | null>(null);

	const fetchRecords = useCallback(async (fetchOptions?: UseFinancialRecordsOptions) => {
		try {
			setLoading(true);
			setError(null);

			const opts = fetchOptions || options;
			let data: FinancialRecord[] = [];

			if (opts.type) {
				// Filter by type
				data = await financialService.getFinancialRecordsByType(opts.type);
			} else {
				// Get all records
				data = await financialService.getAllFinancialRecords();
			}

			setRecords(data);
		} catch (err: any) {
			console.error('Error fetching financial records:', err);
			setError(err.message || 'Failed to fetch financial records');
			setRecords([]);
		} finally {
			setLoading(false);
		}
	}, [options]);

	useEffect(() => {
		if (autoFetch) {
			fetchRecords();
		}
	}, [type, autoFetch, fetchRecords]);

	const refetch = useCallback(() => {
		fetchRecords();
	}, [fetchRecords]);

	return {
		records,
		loading,
		error,
		refetch,
		fetchRecords,
	};
};

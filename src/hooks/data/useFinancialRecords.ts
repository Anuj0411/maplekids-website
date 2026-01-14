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

	/**
	 * Add a new financial record
	 */
	const addRecord = useCallback(async (recordData: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
		try {
			setLoading(true);
			setError(null);
			
			console.log('useFinancialRecords: Adding record:', recordData);
			const newRecord = await financialService.addFinancialRecord(recordData);
			
			// Optimistically update local state
			setRecords(prev => [...prev, newRecord]);
			console.log('useFinancialRecords: Record added successfully');
			
			return newRecord;
		} catch (err: any) {
			const errorMessage = err.message || 'Error adding financial record';
			setError(errorMessage);
			console.error('useFinancialRecords: Error adding record:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Update an existing financial record
	 */
	const updateRecord = useCallback(async (id: string, recordData: Partial<FinancialRecord>) => {
		try {
			setLoading(true);
			setError(null);
			
			console.log('useFinancialRecords: Updating record:', id, recordData);
			await financialService.updateFinancialRecord(id, recordData);
			
			// Optimistically update local state
			setRecords(prev => 
				prev.map(record => 
					record.id === id ? { ...record, ...recordData } : record
				)
			);
			console.log('useFinancialRecords: Record updated successfully');
		} catch (err: any) {
			const errorMessage = err.message || 'Error updating financial record';
			setError(errorMessage);
			console.error('useFinancialRecords: Error updating record:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Delete a financial record
	 */
	const deleteRecord = useCallback(async (id: string) => {
		try {
			setLoading(true);
			setError(null);
			
			console.log('useFinancialRecords: Deleting record:', id);
			await financialService.deleteFinancialRecord(id);
			
			// Optimistically update local state
			setRecords(prev => prev.filter(record => record.id !== id));
			console.log('useFinancialRecords: Record deleted successfully');
		} catch (err: any) {
			const errorMessage = err.message || 'Error deleting financial record';
			setError(errorMessage);
			console.error('useFinancialRecords: Error deleting record:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Calculate financial statistics
	 */
	const calculateStats = useCallback(() => {
		const totalIncome = records
			.filter(record => record.type === 'income')
			.reduce((sum, record) => sum + (record.amount || 0), 0);
		
		const totalExpense = records
			.filter(record => record.type === 'expense')
			.reduce((sum, record) => sum + (record.amount || 0), 0);
		
		return {
			totalIncome,
			totalExpense,
			balance: totalIncome - totalExpense,
			recordCount: records.length,
			incomeCount: records.filter(r => r.type === 'income').length,
			expenseCount: records.filter(r => r.type === 'expense').length,
		};
	}, [records]);

	/**
	 * Get records by type (income or expense)
	 */
	const getRecordsByType = useCallback((recordType: 'income' | 'expense') => {
		return records.filter(record => record.type === recordType);
	}, [records]);

	/**
	 * Get records by class
	 */
	const getRecordsByClass = useCallback((className: string) => {
		if (className === 'all') return records;
		return records.filter(record => record.studentClass === className);
	}, [records]);

	/**
	 * Get records by date range
	 */
	const getRecordsByDateRange = useCallback((startDate: string, endDate: string) => {
		const start = new Date(startDate);
		const end = new Date(endDate);
		
		return records.filter(record => {
			const recordDate = new Date(record.date);
			return recordDate >= start && recordDate <= end;
		});
	}, [records]);

	/**
	 * Get records by category
	 */
	const getRecordsByCategory = useCallback((category: string) => {
		return records.filter(record => record.category === category);
	}, [records]);

	return {
		// Data
		records,
		incomeRecords: getRecordsByType('income'),
		expenseRecords: getRecordsByType('expense'),
		stats: calculateStats(),
		
		// State
		loading,
		error,
		
		// Actions (CRUD)
		addRecord,
		updateRecord,
		deleteRecord,
		refetch,
		fetchRecords,
		
		// Filters/Helpers
		getRecordsByType,
		getRecordsByClass,
		getRecordsByDateRange,
		getRecordsByCategory,
		calculateStats,
	};
};

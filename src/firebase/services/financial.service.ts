import {
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	getDocs,
	query,
	where,
	orderBy,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { FinancialRecord } from '../types';
import { handleError } from '../utils/errorHandler';

/**
 * Financial Service
 * Handles income and expense tracking, financial records management
 */
export const financialService = {
	/**
	 * Add new financial record
	 */
	async addFinancialRecord(
		recordData: Omit<FinancialRecord, 'id' | 'createdAt'>
	): Promise<FinancialRecord> {
		try {
			const docRef = await addDoc(collection(db, 'financialRecords'), {
				...recordData,
				createdAt: serverTimestamp(),
			});
			return { ...recordData, id: docRef.id };
		} catch (error) {
			throw handleError(error, 'Error adding financial record');
		}
	},

	/**
	 * Get all financial records
	 */
	async getAllFinancialRecords(): Promise<FinancialRecord[]> {
		try {
			const querySnapshot = await getDocs(
				collection(db, 'financialRecords')
			);
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as FinancialRecord[];
		} catch (error) {
			throw handleError(error, 'Error fetching all financial records');
		}
	},

	/**
	 * Get records by type (income or expense)
	 */
	async getFinancialRecordsByType(
		type: 'income' | 'expense'
	): Promise<FinancialRecord[]> {
		try {
			const q = query(
				collection(db, 'financialRecords'),
				where('type', '==', type),
				orderBy('date', 'desc')
			);
			const querySnapshot = await getDocs(q);
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as FinancialRecord[];
		} catch (error) {
			throw handleError(error, `Error fetching ${type} records`);
		}
	},

	/**
	 * Update financial record
	 */
	async updateFinancialRecord(
		id: string,
		recordData: Partial<FinancialRecord>
	): Promise<void> {
		try {
			const recordRef = doc(db, 'financialRecords', id);
			await updateDoc(recordRef, recordData);
		} catch (error) {
			throw handleError(error, `Error updating financial record ${id}`);
		}
	},

	/**
	 * Delete financial record
	 */
	async deleteFinancialRecord(id: string): Promise<void> {
		try {
			const recordRef = doc(db, 'financialRecords', id);
			await deleteDoc(recordRef);
		} catch (error) {
			throw handleError(error, `Error deleting financial record ${id}`);
		}
	},

	/**
	 * Get financial record by ID
	 */
	async getFinancialRecordById(id: string): Promise<FinancialRecord | null> {
		try {
			const allRecords = await this.getAllFinancialRecords();
			return allRecords.find(record => record.id === id) || null;
		} catch (error) {
			throw handleError(error, `Error fetching financial record ${id}`);
		}
	},

	/**
	 * Get financial records by date range
	 */
	async getFinancialRecordsByDateRange(startDate: string, endDate: string): Promise<FinancialRecord[]> {
		try {
			const q = query(
				collection(db, 'financialRecords'),
				where('date', '>=', startDate),
				where('date', '<=', endDate),
				orderBy('date', 'desc')
			);
			const querySnapshot = await getDocs(q);
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as FinancialRecord[];
		} catch (error) {
			throw handleError(error, `Error fetching records from ${startDate} to ${endDate}`);
		}
	},

	/**
	 * Get financial statistics (total income, total expense, balance)
	 */
	async getFinancialStats(month?: string, year?: string): Promise<{
		totalIncome: number;
		totalExpense: number;
		balance: number;
		incomeRecords: number;
		expenseRecords: number;
	}> {
		try {
			let records = await this.getAllFinancialRecords();
			
			// Filter by month and year if provided
			if (month && year) {
				records = records.filter(record => {
					const recordDate = new Date(record.date);
					const recordMonth = (recordDate.getMonth() + 1).toString().padStart(2, '0');
					const recordYear = recordDate.getFullYear().toString();
					return recordMonth === month && recordYear === year;
				});
			}
			
			const totalIncome = records
				.filter(r => r.type === 'income')
				.reduce((sum, r) => sum + r.amount, 0);
			
			const totalExpense = records
				.filter(r => r.type === 'expense')
				.reduce((sum, r) => sum + r.amount, 0);
			
			const incomeRecords = records.filter(r => r.type === 'income').length;
			const expenseRecords = records.filter(r => r.type === 'expense').length;
			
			return {
				totalIncome,
				totalExpense,
				balance: totalIncome - totalExpense,
				incomeRecords,
				expenseRecords,
			};
		} catch (error) {
			throw handleError(error, 'Error calculating financial statistics');
		}
	},
};

/**
 * Financial-related type definitions
 */

/**
 * Financial transaction type
 */
export type FinancialType = 'income' | 'expense';

/**
 * Financial record interface representing income or expense transactions
 */
export interface FinancialRecord {
	/** Unique identifier (Firestore document ID) */
	id?: string;
	
	/** Type of transaction (income or expense) */
	type: FinancialType;
	
	/** Category of the transaction */
	category: string;
	
	/** Transaction amount */
	amount: number;
	
	/** Description of the transaction */
	description: string;
	
	/** Transaction date (ISO string) */
	date: string;
	
	/** Receipt number (optional) */
	receiptNumber?: string;
	
	/** Student name (for student-related transactions) */
	studentName?: string;
	
	/** Student class (for student-related transactions) */
	studentClass?: string;
	
	/** Month of the transaction */
	month?: string;
	
	/** Academic year */
	academicYear?: string;
	
	/** Timestamp when record was created */
	createdAt?: any;
}

/**
 * Partial financial record data for updates
 */
export type FinancialRecordUpdate = Partial<Omit<FinancialRecord, 'id' | 'createdAt'>>;

/**
 * Financial record creation data (without auto-generated fields)
 */
export type FinancialRecordCreateData = Omit<FinancialRecord, 'id' | 'createdAt'>;

/**
 * Financial summary statistics
 */
export interface FinancialSummary {
	/** Total income */
	totalIncome: number;
	
	/** Total expenses */
	totalExpenses: number;
	
	/** Net balance (income - expenses) */
	netBalance: number;
	
	/** Number of income transactions */
	incomeCount: number;
	
	/** Number of expense transactions */
	expenseCount: number;
}

/**
 * Financial date range for queries
 */
export interface FinancialDateRange {
	/** Start date (ISO string) */
	startDate: string;
	
	/** End date (ISO string) */
	endDate: string;
}

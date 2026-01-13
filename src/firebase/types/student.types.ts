/**
 * Student-related type definitions
 */

/**
 * Student class enumeration
 */
export type StudentClass = 'play' | 'nursery' | 'lkg' | 'ukg' | '1st';

/**
 * Student interface representing a student in the system
 */
export interface Student {
	/** Unique identifier (Firestore document ID) */
	id?: string;
	
	/** Student's roll number (unique identifier) */
	rollNumber: string;
	
	/** Student's first name */
	firstName: string;
	
	/** Student's last name */
	lastName: string;
	
	/** Student's email address */
	email: string;
	
	/** Student's phone number */
	phone: string;
	
	/** Student's address */
	address: string;
	
	/** Student's class */
	class: StudentClass;
	
	/** User ID (for students, this is the roll number) */
	userId: string;
	
	/** Firebase Auth UID (optional, added when user signs in) */
	authUid?: string;
	
	/** Student's age */
	age?: number;
	
	/** Parent's name */
	parentName?: string;
	
	/** Parent's phone number */
	parentPhone?: string;
	
	/** Admission date (ISO string) */
	admissionDate?: string;
	
	/** Profile photo URL */
	photo?: string;
	
	/** Timestamp when student was created */
	createdAt?: any;
}

/**
 * Partial student data for updates
 */
export type StudentUpdate = Partial<Omit<Student, 'id' | 'createdAt' | 'rollNumber'>>;

/**
 * Student creation data (without auto-generated fields)
 */
export type StudentCreateData = Omit<Student, 'id' | 'createdAt'>;

/**
 * Bulk student creation data
 */
export interface BulkStudentData {
	students: StudentCreateData[];
}

/**
 * User-related type definitions
 */

/**
 * User role enumeration
 */
export type UserRole = 'admin' | 'teacher' | 'student';

/**
 * User interface representing a user in the system
 */
export interface User {
	/** Unique identifier (Firestore document ID) */
	id?: string;
	
	/** User's first name */
	firstName: string;
	
	/** User's last name */
	lastName: string;
	
	/** User's email address (must be unique) */
	email: string;
	
	/** User's phone number */
	phone: string;
	
	/** User's address */
	address: string;
	
	/** User's role in the system */
	role: UserRole;
	
	/** Timestamp when user was created */
	createdAt?: any;
}

/**
 * Partial user data for updates
 */
export type UserUpdate = Partial<Omit<User, 'id' | 'createdAt'>>;

/**
 * User creation data (without auto-generated fields)
 */
export type UserCreateData = Omit<User, 'id' | 'createdAt'>;

/**
 * Firebase Service Error Handling Utilities
 * 
 * Provides centralized error handling for Firebase operations
 */

/**
 * Custom error class for Firebase service operations
 */
export class FirebaseServiceError extends Error {
	/**
	 * Creates a new FirebaseServiceError
	 * @param message - Human-readable error message
	 * @param code - Error code for programmatic handling
	 * @param context - Context where the error occurred
	 * @param originalError - The original error that was caught
	 */
	constructor(
		message: string,
		public code: string,
		public context?: string,
		public originalError?: any
	) {
		super(message);
		this.name = 'FirebaseServiceError';
		
		// Maintains proper stack trace for where error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, FirebaseServiceError);
		}
	}
}

/**
 * Common Firebase error codes
 */
export enum FirebaseErrorCode {
	// Authentication errors
	AUTH_USER_NOT_FOUND = 'auth/user-not-found',
	AUTH_WRONG_PASSWORD = 'auth/wrong-password',
	AUTH_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
	AUTH_WEAK_PASSWORD = 'auth/weak-password',
	AUTH_INVALID_EMAIL = 'auth/invalid-email',
	AUTH_REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',
	
	// Firestore errors
	PERMISSION_DENIED = 'permission-denied',
	NOT_FOUND = 'not-found',
	ALREADY_EXISTS = 'already-exists',
	RESOURCE_EXHAUSTED = 'resource-exhausted',
	UNAVAILABLE = 'unavailable',
	
	// Storage errors
	STORAGE_UNAUTHORIZED = 'storage/unauthorized',
	STORAGE_QUOTA_EXCEEDED = 'storage/quota-exceeded',
	STORAGE_UNAUTHENTICATED = 'storage/unauthenticated',
	
	// Custom errors
	INVALID_INPUT = 'invalid-input',
	OPERATION_FAILED = 'operation-failed',
	UNKNOWN_ERROR = 'unknown-error',
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<string, string> = {
	// Auth messages
	[FirebaseErrorCode.AUTH_USER_NOT_FOUND]: 'No account found with this email address.',
	[FirebaseErrorCode.AUTH_WRONG_PASSWORD]: 'Incorrect password. Please try again.',
	[FirebaseErrorCode.AUTH_EMAIL_ALREADY_IN_USE]: 'An account with this email already exists.',
	[FirebaseErrorCode.AUTH_WEAK_PASSWORD]: 'Password should be at least 6 characters long.',
	[FirebaseErrorCode.AUTH_INVALID_EMAIL]: 'Please enter a valid email address.',
	[FirebaseErrorCode.AUTH_REQUIRES_RECENT_LOGIN]: 'This operation requires recent login. Please sign in again.',
	
	// Firestore messages
	[FirebaseErrorCode.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
	[FirebaseErrorCode.NOT_FOUND]: 'The requested resource was not found.',
	[FirebaseErrorCode.ALREADY_EXISTS]: 'This resource already exists.',
	[FirebaseErrorCode.RESOURCE_EXHAUSTED]: 'Too many requests. Please try again later.',
	[FirebaseErrorCode.UNAVAILABLE]: 'Service temporarily unavailable. Please try again.',
	
	// Storage messages
	[FirebaseErrorCode.STORAGE_UNAUTHORIZED]: 'You do not have permission to access this file.',
	[FirebaseErrorCode.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded. Please contact administrator.',
	[FirebaseErrorCode.STORAGE_UNAUTHENTICATED]: 'Please sign in to upload files.',
	
	// Custom messages
	[FirebaseErrorCode.INVALID_INPUT]: 'Invalid input data. Please check your entries.',
	[FirebaseErrorCode.OPERATION_FAILED]: 'Operation failed. Please try again.',
	[FirebaseErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Handles Firebase errors and returns a user-friendly FirebaseServiceError
 * 
 * @param error - The error object caught from Firebase
 * @param context - Context where the error occurred (e.g., 'userService.createUser')
 * @returns FirebaseServiceError with user-friendly message
 * 
 * @example
 * try {
 *   await signInWithEmailAndPassword(auth, email, password);
 * } catch (error) {
 *   throw handleFirebaseError(error, 'authService.signIn');
 * }
 */
export const handleFirebaseError = (
	error: any,
	context?: string
): FirebaseServiceError => {
	// If it's already a FirebaseServiceError, return it
	if (error instanceof FirebaseServiceError) {
		return error;
	}
	
	// Extract error code and message
	const errorCode = error?.code || FirebaseErrorCode.UNKNOWN_ERROR;
	const errorMessage = ERROR_MESSAGES[errorCode] || error?.message || 'An unexpected error occurred';
	
	// Log error for debugging
	console.error(`[${context || 'Firebase'}] Error:`, {
		code: errorCode,
		message: errorMessage,
		originalError: error,
	});
	
	return new FirebaseServiceError(
		errorMessage,
		errorCode,
		context,
		error
	);
};

/**
 * Validates required fields in an object
 * 
 * @param data - The object to validate
 * @param requiredFields - Array of required field names
 * @param context - Context for error reporting
 * @throws FirebaseServiceError if validation fails
 * 
 * @example
 * validateRequiredFields(
 *   userData,
 *   ['email', 'firstName', 'lastName'],
 *   'userService.createUser'
 * );
 */
export const validateRequiredFields = (
	data: Record<string, any>,
	requiredFields: string[],
	context?: string
): void => {
	const missingFields = requiredFields.filter(field => !data[field]);
	
	if (missingFields.length > 0) {
		throw new FirebaseServiceError(
			`Missing required fields: ${missingFields.join(', ')}`,
			FirebaseErrorCode.INVALID_INPUT,
			context
		);
	}
};

/**
 * Validates email format
 * 
 * @param email - Email address to validate
 * @param context - Context for error reporting
 * @throws FirebaseServiceError if email is invalid
 */
export const validateEmail = (email: string, context?: string): void => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	if (!emailRegex.test(email)) {
		throw new FirebaseServiceError(
			'Please enter a valid email address',
			FirebaseErrorCode.AUTH_INVALID_EMAIL,
			context
		);
	}
};

/**
 * Wraps an async function with error handling
 * 
 * @param fn - Async function to wrap
 * @param context - Context for error reporting
 * @returns Wrapped function with error handling
 * 
 * @example
 * const safeGetUser = withErrorHandling(
 *   async (id: string) => getDoc(doc(db, 'users', id)),
 *   'userService.getUser'
 * );
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
	fn: T,
	context: string
): T => {
	return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		try {
			return await fn(...args);
		} catch (error) {
			throw handleFirebaseError(error, context);
		}
	}) as T;
};

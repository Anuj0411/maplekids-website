/**
 * Custom Error Classes for Firebase Services
 */

export class FirebaseServiceError extends Error {
	constructor(
		message: string,
		public code?: string,
		public originalError?: unknown
	) {
		super(message);
		this.name = 'FirebaseServiceError';
	}
}

export class AuthError extends FirebaseServiceError {
	constructor(message: string, code?: string, originalError?: unknown) {
		super(message, code, originalError);
		this.name = 'AuthError';
	}
}

export class UserServiceError extends FirebaseServiceError {
	constructor(message: string, code?: string, originalError?: unknown) {
		super(message, code, originalError);
		this.name = 'UserServiceError';
	}
}

export class StudentServiceError extends FirebaseServiceError {
	constructor(message: string, code?: string, originalError?: unknown) {
		super(message, code, originalError);
		this.name = 'StudentServiceError';
	}
}

export class AttendanceServiceError extends FirebaseServiceError {
	constructor(message: string, code?: string, originalError?: unknown) {
		super(message, code, originalError);
		this.name = 'AttendanceServiceError';
	}
}

export class FinancialServiceError extends FirebaseServiceError {
	constructor(message: string, code?: string, originalError?: unknown) {
		super(message, code, originalError);
		this.name = 'FinancialServiceError';
	}
}

export class EventServiceError extends FirebaseServiceError {
	constructor(message: string, code?: string, originalError?: unknown) {
		super(message, code, originalError);
		this.name = 'EventServiceError';
	}
}

export class PhotoServiceError extends FirebaseServiceError {
	constructor(message: string, code?: string, originalError?: unknown) {
		super(message, code, originalError);
		this.name = 'PhotoServiceError';
	}
}

/**
 * Error Handler Utility
 * Wraps Firebase errors with custom error classes
 */
export function handleError(error: unknown, context: string): never {
	if (error instanceof FirebaseServiceError) {
		throw error;
	}

	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorCode = (error as any)?.code;

	console.error(`[${context}]`, {
		message: errorMessage,
		code: errorCode,
		error,
	});

	throw new FirebaseServiceError(
		`${context}: ${errorMessage}`,
		errorCode,
		error
	);
}

/**
 * Async wrapper with error handling
 */
export async function withErrorHandling<T>(
	operation: () => Promise<T>,
	context: string
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		throw handleError(error, context);
	}
}

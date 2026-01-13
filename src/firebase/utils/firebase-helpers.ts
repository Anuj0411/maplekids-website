/**
 * Common Firebase Operation Helpers
 * 
 * Provides reusable utility functions for common Firebase operations
 */

import {
	collection,
	doc,
	addDoc,
	setDoc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	query,
	QueryConstraint,
	DocumentData,
	serverTimestamp,
	Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { handleFirebaseError } from './error-handler';

/**
 * Creates a new document in a collection
 * 
 * @param collectionName - Name of the Firestore collection
 * @param data - Data to store in the document
 * @param context - Context for error reporting
 * @returns Document ID of the created document
 * 
 * @example
 * const userId = await createDocument('users', {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com'
 * }, 'userService.create');
 */
export const createDocument = async <T extends DocumentData>(
	collectionName: string,
	data: T,
	context?: string
): Promise<string> => {
	try {
		const dataWithTimestamp = {
			...data,
			createdAt: serverTimestamp(),
		};
		
		const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
		return docRef.id;
	} catch (error) {
		throw handleFirebaseError(error, context);
	}
};

/**
 * Creates a document with a specific ID
 * 
 * @param collectionName - Name of the Firestore collection
 * @param documentId - ID for the document
 * @param data - Data to store in the document
 * @param context - Context for error reporting
 * 
 * @example
 * await setDocument('students', 'ROLL-001', {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   class: 'nursery'
 * }, 'studentService.create');
 */
export const setDocument = async <T extends DocumentData>(
	collectionName: string,
	documentId: string,
	data: T,
	context?: string
): Promise<void> => {
	try {
		const dataWithTimestamp = {
			...data,
			createdAt: serverTimestamp(),
		};
		
		const docRef = doc(db, collectionName, documentId);
		await setDoc(docRef, dataWithTimestamp);
	} catch (error) {
		throw handleFirebaseError(error, context);
	}
};

/**
 * Gets a single document by ID
 * 
 * @param collectionName - Name of the Firestore collection
 * @param documentId - ID of the document to retrieve
 * @param context - Context for error reporting
 * @returns Document data with ID, or null if not found
 * 
 * @example
 * const user = await getDocument<User>('users', userId, 'userService.get');
 */
export const getDocument = async <T extends DocumentData>(
	collectionName: string,
	documentId: string,
	context?: string
): Promise<(T & { id: string }) | null> => {
	try {
		const docRef = doc(db, collectionName, documentId);
		const docSnap = await getDoc(docRef);
		
		if (!docSnap.exists()) {
			return null;
		}
		
		return {
			id: docSnap.id,
			...docSnap.data(),
		} as T & { id: string };
	} catch (error) {
		throw handleFirebaseError(error, context);
	}
};

/**
 * Gets all documents from a collection
 * 
 * @param collectionName - Name of the Firestore collection
 * @param context - Context for error reporting
 * @returns Array of documents with IDs
 * 
 * @example
 * const users = await getAllDocuments<User>('users', 'userService.getAll');
 */
export const getAllDocuments = async <T extends DocumentData>(
	collectionName: string,
	context?: string
): Promise<(T & { id: string })[]> => {
	try {
		const querySnapshot = await getDocs(collection(db, collectionName));
		
		return querySnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		})) as (T & { id: string })[];
	} catch (error) {
		throw handleFirebaseError(error, context);
	}
};

/**
 * Queries documents with filters
 * 
 * @param collectionName - Name of the Firestore collection
 * @param constraints - Array of query constraints (where, orderBy, limit, etc.)
 * @param context - Context for error reporting
 * @returns Array of matching documents with IDs
 * 
 * @example
 * const students = await queryDocuments<Student>(
 *   'students',
 *   [
 *     where('class', '==', 'nursery'),
 *     orderBy('firstName', 'asc'),
 *     limit(10)
 *   ],
 *   'studentService.query'
 * );
 */
export const queryDocuments = async <T extends DocumentData>(
	collectionName: string,
	constraints: QueryConstraint[],
	context?: string
): Promise<(T & { id: string })[]> => {
	try {
		const q = query(collection(db, collectionName), ...constraints);
		const querySnapshot = await getDocs(q);
		
		return querySnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		})) as (T & { id: string })[];
	} catch (error) {
		throw handleFirebaseError(error, context);
	}
};

/**
 * Updates a document
 * 
 * @param collectionName - Name of the Firestore collection
 * @param documentId - ID of the document to update
 * @param data - Partial data to update
 * @param context - Context for error reporting
 * 
 * @example
 * await updateDocument('users', userId, {
 *   firstName: 'Jane',
 *   phone: '123-456-7890'
 * }, 'userService.update');
 */
export const updateDocument = async <T extends DocumentData>(
	collectionName: string,
	documentId: string,
	data: Partial<T>,
	context?: string
): Promise<void> => {
	try {
		const docRef = doc(db, collectionName, documentId);
		await updateDoc(docRef, data as any);
	} catch (error) {
		throw handleFirebaseError(error, context);
	}
};

/**
 * Deletes a document
 * 
 * @param collectionName - Name of the Firestore collection
 * @param documentId - ID of the document to delete
 * @param context - Context for error reporting
 * 
 * @example
 * await deleteDocument('users', userId, 'userService.delete');
 */
export const deleteDocument = async (
	collectionName: string,
	documentId: string,
	context?: string
): Promise<void> => {
	try {
		const docRef = doc(db, collectionName, documentId);
		await deleteDoc(docRef);
	} catch (error) {
		throw handleFirebaseError(error, context);
	}
};

/**
 * Checks if a document exists
 * 
 * @param collectionName - Name of the Firestore collection
 * @param documentId - ID of the document to check
 * @param context - Context for error reporting
 * @returns true if document exists, false otherwise
 * 
 * @example
 * const exists = await documentExists('users', userId, 'userService.exists');
 */
export const documentExists = async (
	collectionName: string,
	documentId: string,
	context?: string
): Promise<boolean> => {
	try {
		const docRef = doc(db, collectionName, documentId);
		const docSnap = await getDoc(docRef);
		return docSnap.exists();
	} catch (error) {
		throw handleFirebaseError(error, context);
	}
};

/**
 * Converts Firestore Timestamp to ISO string
 * 
 * @param timestamp - Firestore Timestamp object
 * @returns ISO date string or undefined
 * 
 * @example
 * const dateStr = timestampToISO(user.createdAt);
 */
export const timestampToISO = (timestamp: Timestamp | any): string | undefined => {
	if (!timestamp) return undefined;
	
	if (timestamp instanceof Timestamp) {
		return timestamp.toDate().toISOString();
	}
	
	if (timestamp?.toDate) {
		return timestamp.toDate().toISOString();
	}
	
	return undefined;
};

/**
 * Formats date for display
 * 
 * @param date - Date string or Timestamp
 * @returns Formatted date string (e.g., "Jan 15, 2026")
 * 
 * @example
 * const formatted = formatDate(user.createdAt);
 */
export const formatDate = (date: string | Timestamp | any): string => {
	try {
		let dateObj: Date;
		
		if (typeof date === 'string') {
			dateObj = new Date(date);
		} else if (date instanceof Timestamp) {
			dateObj = date.toDate();
		} else if (date?.toDate) {
			dateObj = date.toDate();
		} else {
			return 'Invalid Date';
		}
		
		return dateObj.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch (error) {
		return 'Invalid Date';
	}
};

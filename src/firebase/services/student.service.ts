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
	onSnapshot,
} from 'firebase/firestore';
import { db } from '../config';
import type { Student } from '../types';
import { handleError, StudentServiceError } from '../utils/errorHandler';

/**
 * Student Service
 * Handles student CRUD operations, class management, and real-time updates
 */
export const studentService = {
	/**
	 * Add new student to the database
	 */
	async addStudent(
		studentData: Omit<Student, 'id' | 'createdAt'> & { rollNumber: string }
	): Promise<Student> {
		try {
			// Use the provided roll number (should already include class prefix)
			const rollNumber = studentData.rollNumber;
			const docRef = await addDoc(collection(db, 'students'), {
				...studentData,
				rollNumber,
				createdAt: serverTimestamp(),
			});
			return { ...studentData, rollNumber, id: docRef.id };
		} catch (error) {
			throw handleError(error, 'Error adding student');
		}
	},

	/**
	 * Get all students from database
	 */
	async getAllStudents(): Promise<Student[]> {
		try {
			const querySnapshot = await getDocs(collection(db, 'students'));
			const students = querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Student[];
			return students;
		} catch (error) {
			console.error('Error in getAllStudents:', error);
			throw handleError(error, 'Error fetching all students');
		}
	},

	/**
	 * Get students by class
	 */
	async getStudentsByClass(className: string): Promise<Student[]> {
		try {
			const q = query(
				collection(db, 'students'),
				where('class', '==', className),
				orderBy('firstName')
			);
			const querySnapshot = await getDocs(q);
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Student[];
		} catch (error) {
			throw handleError(error, `Error fetching students for class ${className}`);
		}
	},

	/**
	 * Subscribe to students by class (real-time updates)
	 * Returns an unsubscribe function to stop listening
	 */
	subscribeToStudentsByClass(
		className: string, 
		callback: (students: Student[]) => void
	): () => void {
		try {
			const q = query(
				collection(db, 'students'),
				where('class', '==', className),
				orderBy('firstName')
			);
			
			// Set up real-time listener
			const unsubscribe = onSnapshot(
				q, 
				(querySnapshot) => {
					const students = querySnapshot.docs.map((doc: any) => ({
						id: doc.id,
						...doc.data(),
					})) as Student[];
					callback(students);
				}, 
				(error) => {
					console.error('Error in student subscription:', error);
				}
			);
			
			return unsubscribe;
		} catch (error) {
			console.error('Error setting up student subscription:', error);
			// Return a no-op unsubscribe function
			return () => {};
		}
	},

	/**
	 * Get student by roll number
	 */
	async getStudentByRollNumber(rollNumber: string): Promise<Student | null> {
		try {
			const q = query(
				collection(db, 'students'),
				where('rollNumber', '==', rollNumber)
			);
			const querySnapshot = await getDocs(q);
			
			if (!querySnapshot.empty) {
				const doc = querySnapshot.docs[0];
				return { id: doc.id, ...doc.data() } as Student;
			}
			return null;
		} catch (error) {
			throw handleError(error, `Error fetching student with roll number ${rollNumber}`);
		}
	},

	/**
	 * Get student by Firebase Auth UID
	 */
	async getStudentByAuthUid(authUid: string): Promise<Student | null> {
		try {
			const q = query(
				collection(db, 'students'),
				where('authUid', '==', authUid)
			);
			const querySnapshot = await getDocs(q);
			
			if (!querySnapshot.empty) {
				const doc = querySnapshot.docs[0];
				return { id: doc.id, ...doc.data() } as Student;
			}
			return null;
		} catch (error) {
			throw handleError(error, `Error fetching student with authUid ${authUid}`);
		}
	},

	/**
	 * Update student by roll number
	 */
	async updateStudentByRollNumber(
		rollNumber: string,
		studentData: Partial<Student>
	): Promise<void> {
		try {
			const student = await this.getStudentByRollNumber(rollNumber);
			if (!student) {
				throw new StudentServiceError(`Student with roll number ${rollNumber} not found`);
			}
			
			const studentRef = doc(db, 'students', student.id!);
			await updateDoc(studentRef, studentData);
		} catch (error) {
			throw handleError(error, `Error updating student ${rollNumber}`);
		}
	},

	/**
	 * Update student by document ID (keeping for backward compatibility)
	 */
	async updateStudent(
		id: string,
		studentData: Partial<Student>
	): Promise<void> {
		try {
			const studentRef = doc(db, 'students', id);
			await updateDoc(studentRef, studentData);
		} catch (error) {
			throw handleError(error, `Error updating student ${id}`);
		}
	},

	/**
	 * Delete student by roll number
	 */
	async deleteStudentByRollNumber(rollNumber: string): Promise<void> {
		try {
			const student = await this.getStudentByRollNumber(rollNumber);
			if (!student) {
				throw new StudentServiceError(`Student with roll number ${rollNumber} not found`);
			}
			
			const studentRef = doc(db, 'students', student.id!);
			await deleteDoc(studentRef);
		} catch (error) {
			throw handleError(error, `Error deleting student ${rollNumber}`);
		}
	},

	/**
	 * Delete student by document ID (keeping for backward compatibility)
	 */
	async deleteStudent(id: string): Promise<void> {
		try {
			const studentRef = doc(db, 'students', id);
			await deleteDoc(studentRef);
		} catch (error) {
			throw handleError(error, `Error deleting student ${id}`);
		}
	},

	/**
	 * Get student by ID (alias for getStudentByRollNumber)
	 */
	async getStudentById(id: string): Promise<Student | null> {
		return this.getStudentByRollNumber(id);
	},

	/**
	 * Sync student with user
	 * Used to link student record with user account
	 */
	async syncStudentWithUser(studentId: string, userId: string): Promise<void> {
		try {
			await this.updateStudent(studentId, { userId });
			console.log(`Student ${studentId} synced with user ${userId}`);
		} catch (error) {
			throw handleError(error, `Error syncing student ${studentId} with user ${userId}`);
		}
	},
};

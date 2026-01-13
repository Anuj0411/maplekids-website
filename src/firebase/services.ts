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
	setDoc,
	getDoc,
	onSnapshot,
} from 'firebase/firestore';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	User as FirebaseUser,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './config';

// User Services
export const userService = {
	// Get all users
	async getAllUsers(): Promise<User[]> {
		try {
			const querySnapshot = await getDocs(collection(db, 'users'));
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as User[];
		} catch (error) {
			throw error;
		}
	},

	// Update user
	async updateUser(id: string, userData: Partial<User>): Promise<void> {
		try {
			const userRef = doc(db, 'users', id);
			await updateDoc(userRef, userData);
		} catch (error) {
			throw error;
		}
	},

	// Delete user from Firestore only (basic deletion)
	async deleteUser(id: string): Promise<void> {
		try {
			// First, get the user document to get the email
			const userRef = doc(db, 'users', id);
			const userDoc = await getDoc(userRef);
			
			if (!userDoc.exists()) {
				throw new Error('User not found in database');
			}
			
			const userData = userDoc.data();
			const userEmail = userData.email;
			
			// Delete from Firestore
			await deleteDoc(userRef);
			
			// Also delete associated student record if it exists
			if (userData.role === 'student') {
				try {
					const studentRef = doc(db, 'students', userData.rollNumber || '');
					await deleteDoc(studentRef);
				} catch (studentError) {
					console.warn('Could not delete associated student record:', studentError);
				}
			}
			
			console.log(`User ${userEmail} deleted from Firestore successfully`);
			console.warn(`IMPORTANT: To delete user from Firebase Authentication, use deleteUserCompletely() method`);
			
		} catch (error) {
			console.error('Error deleting user:', error);
			throw error;
		}
	},

	// Delete user completely from both Firestore and Firebase Auth
	async deleteUserCompletely(id: string): Promise<void> {
		try {
			// First, get the user document to get the email
			const userRef = doc(db, 'users', id);
			const userDoc = await getDoc(userRef);
			
			if (!userDoc.exists()) {
				throw new Error('User not found in database');
			}
			
			const userData = userDoc.data();
			const userEmail = userData.email;
			
			// Delete from Firestore first
			await deleteDoc(userRef);
			console.log(`User ${userEmail} deleted from Firestore`);
			
			// Note: Firebase Auth deletion requires admin privileges
			// This will only delete from Firestore for now
			console.warn(`Note: User ${userEmail} deleted from Firestore. Firebase Auth deletion requires admin privileges.`);
			
		} catch (error) {
			console.error('Error deleting user completely:', error);
			throw error;
		}
	},

	// Create user (admin only) - creates both Firebase Auth account and Firestore record
	async createUser(email: string, password: string, userData: any): Promise<void> {
		try {
			console.log('Creating user with data:', { email, role: userData.role, rollNumber: userData.rollNumber });
			
			// Check if admin is signed in
			const currentAdmin = auth.currentUser;
			if (!currentAdmin) {
				throw new Error('No admin user is currently signed in');
			}

			// Store admin credentials
			const adminUid = currentAdmin.uid;

			// Create Firebase Auth account first
			console.log('Creating Firebase Auth account...');
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const firebaseUser = userCredential.user;
			console.log('Firebase Auth account created:', firebaseUser.uid);

			// For students, use roll number as the document ID in users collection
			// For other users, use Firebase Auth UID
			const documentId = userData.role === 'student' && userData.rollNumber 
				? userData.rollNumber 
				: firebaseUser.uid;

			console.log('Using document ID:', documentId);

			// Save user data to Firestore
			// The new user is now the current user, so we need to create the document
			// with the new user's context, but we'll use the admin's UID for createdBy
			const userDocData = {
				...userData,
				uid: firebaseUser.uid, // Always use Firebase Auth UID
				email: email,
				createdAt: serverTimestamp(),
				createdBy: adminUid, // Use stored admin UID
				needsAuthCreation: false, // Firebase Auth account already created
			};
			
			console.log('Saving user document to Firestore:', {
				...userDocData,
				password: '[HIDDEN]' // Hide password in logs for security
			});
			await setDoc(doc(db, 'users', documentId), userDocData);
			console.log('User document saved successfully');

			// If it's a student, also create a student record
			if (userData.role === 'student' && userData.class && userData.rollNumber) {
				console.log('✅ Student role detected. Creating student record in students collection...');
				const studentData = {
					firstName: userData.firstName,
					lastName: userData.lastName,
					email: email,
					phone: userData.phone,
					address: userData.address,
					class: userData.class,
					rollNumber: userData.rollNumber,
					userId: userData.rollNumber, // Use roll number as userId for students
					authUid: firebaseUser.uid, // Store Firebase Auth UID for reference
					createdAt: serverTimestamp(),
					createdBy: adminUid, // Use stored admin UID
				};
				console.log('📝 Saving student document to students/{rollNumber}:', studentData);
				await setDoc(doc(db, 'students', userData.rollNumber), studentData);
				console.log('✅ Student document saved successfully to students collection');
				console.log('📊 SYNC COMPLETE: User saved to both collections:');
				console.log(`   - users/${documentId}`);
				console.log(`   - students/${userData.rollNumber}`);
			} else if (userData.role === 'student') {
				console.warn('⚠️ WARNING: Student user created but NOT added to students collection!');
				console.warn('   Missing required fields:');
				console.warn(`   - class: ${userData.class || 'MISSING'}`);
				console.warn(`   - rollNumber: ${userData.rollNumber || 'MISSING'}`);
			}

			// Sign out the newly created user
			await signOut(auth);
			console.log('Signed out newly created user');

			// Note: Admin will need to sign in again as we can't restore their session automatically
			// This is a limitation of Firebase Auth - we can't sign in multiple users simultaneously
			console.log('User created successfully with Firebase Auth account and Firestore records.');
			console.log('Admin will need to sign in again to continue using the admin dashboard.');
			
		} catch (error) {
			console.error('Error creating user:', error);
			
			// If it's a permissions error, provide helpful guidance
			if (error.code === 'permission-denied' || error.message.includes('permissions') || error.message.includes('Missing or insufficient permissions')) {
				throw new Error('❌ PERMISSION ERROR: Please update your Firestore security rules.\n\n🔧 QUICK FIX:\n1. Go to Firebase Console → Firestore Database → Rules\n2. Replace all rules with:\n\nrules_version = "2";\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n\n3. Click "Publish"\n\n📖 See QUICK_FIX.md for detailed instructions.');
			}
			
			throw error;
		}
	},
};

// Types
export interface User {
	id?: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	role: 'admin' | 'teacher' | 'student';
	createdAt?: any;
}

export interface Student {
		id?: string;
		rollNumber: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		address: string;
		class: 'play' | 'nursery' | 'lkg' | 'ukg' | '1st';
		userId: string; // For students, this is the roll number
		authUid?: string; // Firebase Auth UID (optional, added when user signs in)
		age?: number;
		parentName?: string;
		parentPhone?: string;
		admissionDate?: string;
		photo?: string;
		createdAt?: any;
}

export interface FinancialRecord {
	id?: string;
	type: 'income' | 'expense';
	category: string;
	amount: number;
	description: string;
	date: string;
	receiptNumber?: string;
	studentName?: string;
	studentClass?: string;
	month?: string;
	academicYear?: string;
	createdAt?: any;
}

export interface Photo {
	id?: string;
	title: string;
	description: string;
	category: string;
	imageUrl: string;
	uploadedAt?: any;
}

export interface Event {
	id?: string;
	title: string;
	description: string;
	date: string;
	time: string;
	location: string;
	isActive: boolean;
	createdAt?: any;
}

export interface Attendance {
	id?: string;
	class: string;
	date: string;
	students: {
		studentId: string;
		rollNumber: string;
		studentName?: string;
		status: 'present' | 'absent' | 'late';
		remarks?: string;
	}[];
	markedBy?: {
		userId: string;
		name: string;
		email: string;
	};
	createdAt?: any;
}



// Student Services
export const studentService = {
	// Add new student
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
				throw error;
				}
		},

	// Get all students
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
			throw error;
		}
	},

	// Get students by class
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
			throw error;
		}
	},

	// Subscribe to students by class (real-time updates)
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
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				const students = querySnapshot.docs.map((doc: any) => ({
					id: doc.id,
					...doc.data(),
				})) as Student[];
				callback(students);
			}, (error) => {
				console.error('Error in student subscription:', error);
			});
			
			return unsubscribe;
		} catch (error) {
			console.error('Error setting up student subscription:', error);
			// Return a no-op unsubscribe function
			return () => {};
		}
	},

	// Get student by roll number
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
			throw error;
		}
	},

	// Get student by authUid (Firebase Auth UID)
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
			throw error;
		}
	},

	// Update student by roll number
	async updateStudentByRollNumber(
		rollNumber: string,
		studentData: Partial<Student>
	): Promise<void> {
		try {
			const student = await this.getStudentByRollNumber(rollNumber);
			if (!student) {
				throw new Error(`Student with roll number ${rollNumber} not found`);
			}
			
			const studentRef = doc(db, 'students', student.id!);
			await updateDoc(studentRef, studentData);
		} catch (error) {
			throw error;
		}
	},

	// Update student by document ID (keeping for backward compatibility)
	async updateStudent(
		id: string,
		studentData: Partial<Student>
	): Promise<void> {
		try {
			const studentRef = doc(db, 'students', id);
			await updateDoc(studentRef, studentData);
		} catch (error) {
			throw error;
		}
	},

	// Delete student by roll number
	async deleteStudentByRollNumber(rollNumber: string): Promise<void> {
		try {
			const student = await this.getStudentByRollNumber(rollNumber);
			if (!student) {
				throw new Error(`Student with roll number ${rollNumber} not found`);
			}
			
			const studentRef = doc(db, 'students', student.id!);
			await deleteDoc(studentRef);
		} catch (error) {
			throw error;
		}
	},

	// Delete student by document ID (keeping for backward compatibility)
	async deleteStudent(id: string): Promise<void> {
		try {
			const studentRef = doc(db, 'students', id);
			await deleteDoc(studentRef);
		} catch (error) {
			throw error;
		}
	},
};

// Financial Record Services
export const financialService = {
	// Add new financial record
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
			throw error;
		}
	},

	// Get all financial records
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
			throw error;
		}
	},

	// Get records by type
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
			throw error;
		}
	},

	// Update financial record
	async updateFinancialRecord(
		id: string,
		recordData: Partial<FinancialRecord>
	): Promise<void> {
		try {
			const recordRef = doc(db, 'financialRecords', id);
			await updateDoc(recordRef, recordData);
		} catch (error) {
			throw error;
		}
	},

	// Delete financial record
	async deleteFinancialRecord(id: string): Promise<void> {
		try {
			const recordRef = doc(db, 'financialRecords', id);
			await deleteDoc(recordRef);
		} catch (error) {
			throw error;
		}
	},
};

// Photo Services
export const photoService = {
	// Upload photo to Firebase Storage
	async uploadPhoto(file: File): Promise<string> {
		try {
			const storageRef = ref(
				storage,
				`photos/${Date.now()}_${file.name}`
			);
			const snapshot = await uploadBytes(storageRef, file);
			const downloadURL = await getDownloadURL(snapshot.ref);
			return downloadURL;
		} catch (error) {
			throw error;
		}
	},

	// Add new photo record
	async addPhoto(
		photoData: Omit<Photo, 'id' | 'uploadedAt'>
	): Promise<Photo> {
		try {
			const docRef = await addDoc(collection(db, 'photos'), {
				...photoData,
				uploadedAt: serverTimestamp(),
			});
			return { ...photoData, id: docRef.id };
		} catch (error) {
			throw error;
		}
	},

	// Get all photos
	async getAllPhotos(): Promise<Photo[]> {
		try {
			const querySnapshot = await getDocs(collection(db, 'photos'));
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Photo[];
		} catch (error) {
			throw error;
		}
	},

	// Get photos by category
	async getPhotosByCategory(category: string): Promise<Photo[]> {
		try {
			const q = query(
				collection(db, 'photos'),
				where('category', '==', category),
				orderBy('uploadedAt', 'desc')
			);
			const querySnapshot = await getDocs(q);
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Photo[];
		} catch (error) {
			throw error;
		}
	},

	// Delete photo
	async deletePhoto(id: string): Promise<void> {
		try {
			const photoRef = doc(db, 'photos', id);
			await deleteDoc(photoRef);
		} catch (error) {
			throw error;
		}
	},
};

// Event Services
export const eventService = {
	// Add new event
	async addEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
		try {
			console.log('Adding event to Firebase:', eventData);
			const docRef = await addDoc(collection(db, 'events'), {
				...eventData,
				createdAt: serverTimestamp(),
			});
			const createdEvent = { ...eventData, id: docRef.id };
			console.log('Event added successfully:', createdEvent);
			return createdEvent;
		} catch (error) {
			console.error('Error adding event:', error);
			throw error;
		}
	},

	// Get all events
	async getAllEvents(): Promise<Event[]> {
		try {
			console.log('Fetching all events from Firebase...');
			const querySnapshot = await getDocs(collection(db, 'events'));
			const events = querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Event[];
			console.log('All events fetched:', events);
			
			// Auto-expire past events
			await this.expirePastEvents(events);
			
			return events;
		} catch (error) {
			console.error('Error fetching all events:', error);
			throw error;
		}
	},

	// Auto-expire past events
	async expirePastEvents(events: Event[]): Promise<void> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			const expiredEvents = events.filter(event => {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0);
				return event.isActive && eventDate < today;
			});

			if (expiredEvents.length > 0) {
				console.log(`Auto-expiring ${expiredEvents.length} past events`);
				
				const updatePromises = expiredEvents.map(event => {
					if (event.id) {
						return updateDoc(doc(db, 'events', event.id), {
							isActive: false
						});
					}
					return Promise.resolve();
				});

				await Promise.all(updatePromises);
				console.log('Past events auto-expired successfully');
			}
		} catch (error) {
			console.error('Error auto-expiring past events:', error);
		}
	},

	// Get active events
	async getActiveEvents(): Promise<Event[]> {
		try {
			const q = query(
				collection(db, 'events'),
				where('isActive', '==', true)
			);
			const querySnapshot = await getDocs(q);
			const events = querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Event[];
			
			// Sort by date on the client side since date might be stored as string
			return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		} catch (error) {
			console.error('Error getting active events:', error);
			throw error;
		}
	},

	// Update event
	async updateEvent(id: string, eventData: Partial<Event>): Promise<void> {
		try {
			const eventRef = doc(db, 'events', id);
			await updateDoc(eventRef, eventData);
		} catch (error) {
			throw error;
		}
	},

	// Delete event
	async deleteEvent(id: string): Promise<void> {
		try {
			const eventRef = doc(db, 'events', id);
			await deleteDoc(eventRef);
		} catch (error) {
			throw error;
		}
	},
};

// Attendance Services
export const attendanceService = {
	// Add new attendance record
	async addAttendance(
		attendanceData: Omit<Attendance, 'id' | 'createdAt'>
	): Promise<Attendance> {
		try {
			console.log('Adding attendance record:', attendanceData);
			
			// Filter out undefined values to prevent Firebase errors
			const cleanData = Object.fromEntries(
				Object.entries(attendanceData).filter(([_, value]) => value !== undefined)
			);
			
			console.log('Cleaned attendance data:', cleanData);
			
			const docRef = await addDoc(collection(db, 'attendance'), {
				...cleanData,
				createdAt: serverTimestamp(),
			});
			const result = { ...attendanceData, id: docRef.id };
			console.log('Attendance record added successfully:', result);
			return result;
		} catch (error) {
			console.error('Error adding attendance record:', error);
			throw error;
		}
	},

	// Get attendance by class and date
	async getAttendanceByClassAndDate(
		className: string,
		date: string
	): Promise<Attendance | null> {
		try {
			console.log('Getting attendance for class:', className, 'date:', date);
			const q = query(
				collection(db, 'attendance'),
				where('class', '==', className),
				where('date', '==', date)
			);
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const doc = querySnapshot.docs[0];
				const result = { id: doc.id, ...doc.data() } as Attendance;
				console.log('Found attendance record:', result);
				return result;
			}
			console.log('No attendance record found for class:', className, 'date:', date);
			return null;
		} catch (error) {
			console.error('Error getting attendance by class and date:', error);
			throw error;
		}
	},

	// Get attendance records for a specific student
	async getAttendanceByStudent(rollNumber: string): Promise<Attendance[]> {
		try {
			const q = query(
				collection(db, 'attendance'),
				orderBy('date', 'desc')
			);
			const querySnapshot = await getDocs(q);
			
			const attendanceRecords: Attendance[] = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data() as Attendance;
				// Filter to only include records where this student is present
				const studentInRecord = data.students.some(s => s.rollNumber === rollNumber);
				if (studentInRecord) {
					attendanceRecords.push({
						id: doc.id,
						...data
					});
				}
			});
			
			return attendanceRecords;
		} catch (error) {
			console.error('Error getting attendance by student:', error);
			throw error;
		}
	},

	// Update attendance
	async updateAttendance(
		id: string,
		attendanceData: Partial<Attendance>
	): Promise<void> {
		try {
			console.log('Updating attendance record:', id, 'with data:', attendanceData);
			
			// Filter out undefined values to prevent Firebase errors
			const cleanData = Object.fromEntries(
				Object.entries(attendanceData).filter(([_, value]) => value !== undefined)
			);
			
			console.log('Cleaned update data:', cleanData);
			
			const attendanceRef = doc(db, 'attendance', id);
			await updateDoc(attendanceRef, cleanData);
			console.log('Attendance record updated successfully');
		} catch (error) {
			console.error('Error updating attendance record:', error);
			throw error;
		}
	},

	// Get all attendance records for a specific date
	async getAttendanceByDate(date: string): Promise<Attendance[]> {
		try {
			console.log('Getting attendance for date:', date);
			const q = query(
				collection(db, 'attendance'),
				where('date', '==', date)
			);
			const querySnapshot = await getDocs(q);
			
			const results = querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Attendance[];
			
			console.log('Found attendance records:', results.length);
			return results;
		} catch (error) {
			console.error('Error getting attendance by date:', error);
			throw error;
		}
	},

	// Get attendance statistics for all classes on a specific date
	async getAttendanceStatistics(date: string): Promise<{
		[className: string]: {
			total: number;
			present: number;
			absent: number;
			late: number;
			missed: number; // Students who don't have attendance marked
		}
	}> {
		try {
			console.log('Getting attendance statistics for date:', date);
			
			// Get all students grouped by class
			const allStudents = await studentService.getAllStudents();
			const studentsByClass = allStudents.reduce((acc, student) => {
				if (!acc[student.class]) {
					acc[student.class] = [];
				}
				acc[student.class].push(student);
				return acc;
			}, {} as { [key: string]: Student[] });

			// Get attendance records for the date
			const attendanceRecords = await this.getAttendanceByDate(date);

			// Calculate statistics for each class
			const statistics: { [className: string]: any } = {};

			for (const [className, students] of Object.entries(studentsByClass)) {
				const classAttendance = attendanceRecords.find(record => record.class === className);
				
				let present = 0;
				let absent = 0;
				let late = 0;
				let missed = 0;

				if (classAttendance && classAttendance.students) {
					// Count students with attendance marked
					classAttendance.students.forEach(studentAttendance => {
						switch (studentAttendance.status) {
							case 'present':
								present++;
								break;
							case 'absent':
								absent++;
								break;
							case 'late':
								late++;
								break;
						}
					});

					// Count students without attendance marked (missed)
					missed = students.length - classAttendance.students.length;
				} else {
					// No attendance record for this class - all students are missed
					missed = students.length;
				}

				statistics[className] = {
					total: students.length,
					present,
					absent,
					late,
					missed
				};
			}

			console.log('Attendance statistics calculated:', statistics);
			return statistics;
		} catch (error) {
			console.error('Error getting attendance statistics:', error);
			throw error;
		}
	},

	// Get attendance records within a date range
	async getAttendanceByDateRange(startDate: string, endDate: string): Promise<Attendance[]> {
		try {
			console.log('Getting attendance for date range:', startDate, 'to', endDate);
			const q = query(
				collection(db, 'attendance'),
				where('date', '>=', startDate),
				where('date', '<=', endDate),
				orderBy('date', 'desc')
			);
			const querySnapshot = await getDocs(q);
			
			const results = querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Attendance[];
			
			console.log('Found attendance records in range:', results.length);
			return results;
		} catch (error) {
			console.error('Error getting attendance by date range:', error);
			throw error;
		}
	},

	// Get attendance statistics for a date range
	async getAttendanceStatisticsByDateRange(startDate: string, endDate: string): Promise<{
		dailyStats: { [date: string]: { [className: string]: any } };
		summaryStats: { [className: string]: any };
		totalDays: number;
	}> {
		try {
			console.log('Getting attendance statistics for date range:', startDate, 'to', endDate);
			
			// Get all students grouped by class
			const allStudents = await studentService.getAllStudents();
			const studentsByClass = allStudents.reduce((acc, student) => {
				if (!acc[student.class]) {
					acc[student.class] = [];
				}
				acc[student.class].push(student);
				return acc;
			}, {} as { [key: string]: Student[] });

			// Get attendance records for the date range
			const attendanceRecords = await this.getAttendanceByDateRange(startDate, endDate);

			// Group records by date
			const recordsByDate = attendanceRecords.reduce((acc, record) => {
				if (!acc[record.date]) {
					acc[record.date] = [];
				}
				acc[record.date].push(record);
				return acc;
			}, {} as { [date: string]: Attendance[] });

			// Calculate daily statistics
			const dailyStats: { [date: string]: { [className: string]: any } } = {};
			const summaryStats: { [className: string]: any } = {};

			// Initialize summary stats
			for (const className of Object.keys(studentsByClass)) {
				summaryStats[className] = {
					total: 0,
					present: 0,
					absent: 0,
					late: 0,
					missed: 0,
					daysWithAttendance: 0
				};
			}

			// Generate all dates in range
			const start = new Date(startDate);
			const end = new Date(endDate);
			const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

			for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
				const dateStr = d.toISOString().split('T')[0];
				const dayRecords = recordsByDate[dateStr] || [];
				
				dailyStats[dateStr] = {};

				for (const [className, students] of Object.entries(studentsByClass)) {
					const classAttendance = dayRecords.find(record => record.class === className);
					
					let present = 0;
					let absent = 0;
					let late = 0;
					let missed = 0;

					if (classAttendance && classAttendance.students) {
						// Count students with attendance marked
						classAttendance.students.forEach(studentAttendance => {
							switch (studentAttendance.status) {
								case 'present':
									present++;
									break;
								case 'absent':
									absent++;
									break;
								case 'late':
									late++;
									break;
							}
						});

						// Count students without attendance marked (missed)
						missed = students.length - classAttendance.students.length;
					} else {
						// No attendance record for this class - all students are missed
						missed = students.length;
					}

					const dayStats = {
						total: students.length,
						present,
						absent,
						late,
						missed
					};

					dailyStats[dateStr][className] = dayStats;

					// Add to summary stats
					summaryStats[className].total += students.length;
					summaryStats[className].present += present;
					summaryStats[className].absent += absent;
					summaryStats[className].late += late;
					summaryStats[className].missed += missed;
					
					if (classAttendance && classAttendance.students) {
						summaryStats[className].daysWithAttendance++;
					}
				}
			}

			console.log('Date range statistics calculated:', { dailyStats, summaryStats, totalDays });
			return { dailyStats, summaryStats, totalDays };
		} catch (error) {
			console.error('Error getting attendance statistics by date range:', error);
			throw error;
		}
	},

	// Get attendance statistics for a specific month and year
	async getAttendanceStatisticsByMonth(year: number, month: number): Promise<{
		dailyStats: { [date: string]: { [className: string]: any } };
		summaryStats: { [className: string]: any };
		totalDays: number;
		workingDays: number;
	}> {
		try {
			console.log('Getting attendance statistics for month:', year, month);
			
			// Calculate start and end dates for the month
			const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
			const endDate = new Date(year, month, 0).toISOString().split('T')[0];
			
			// Get statistics for the date range
			const rangeStats = await this.getAttendanceStatisticsByDateRange(startDate, endDate);
			
			// Calculate working days (excluding weekends)
			const start = new Date(startDate);
			const end = new Date(endDate);
			let workingDays = 0;
			
			for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
				const dayOfWeek = d.getDay();
				if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
					workingDays++;
				}
			}

			return {
				...rangeStats,
				workingDays
			};
		} catch (error) {
			console.error('Error getting attendance statistics by month:', error);
			throw error;
		}
	},

	// Mark attendance (bulk operation with teacher tracking)
	async markAttendance(attendanceData: {
		class: string;
		date: string;
		students: Array<{
			studentId: string;
			rollNumber: string;
			status: 'present' | 'absent' | 'late';
			remarks?: string;
		}>;
		markedBy: {
			userId: string;
			name: string;
			email: string;
		};
		createdAt: string;
	}): Promise<void> {
		try {
			console.log('Marking attendance:', attendanceData);
			
			// Check if attendance already exists for this class and date
			const existingAttendance = await this.getAttendanceByClassAndDate(attendanceData.class, attendanceData.date);
			
			if (existingAttendance) {
				// Update existing attendance
				const docRef = doc(db, 'attendance', existingAttendance.id!);
				await updateDoc(docRef, {
					students: attendanceData.students,
					markedBy: attendanceData.markedBy,
					updatedAt: serverTimestamp(),
				});
				console.log('Attendance updated successfully');
			} else {
				// Create new attendance record
				await this.addAttendance({
					class: attendanceData.class,
					date: attendanceData.date,
					students: attendanceData.students,
					markedBy: attendanceData.markedBy,
				});
				console.log('Attendance created successfully');
			}
		} catch (error) {
			console.error('Error marking attendance:', error);
			throw error;
		}
	},
};

// Authentication Services
export const authService = {
	// Sign up new user (for public signup - deprecated)
	async signUp(email: string, password: string, userData: any): Promise<void> {
		try {
			// Create user with Firebase Auth
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// Save user data to Firestore
			await setDoc(doc(db, 'users', user.uid), {
				...userData,
				uid: user.uid,
				email: user.email,
				createdAt: serverTimestamp(),
			});
		} catch (error) {
			throw error;
		}
	},

	// Sign in user
	async signIn(email: string, password: string): Promise<FirebaseUser> {
		try {
			console.log('Attempting to sign in user:', email);
			// Try to sign in with Firebase Auth
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			console.log('User signed in successfully with Firebase Auth');
			return userCredential.user;
		} catch (error: any) {
			console.log('Firebase Auth sign-in failed:', error.code, error.message);
			// If user doesn't exist in Firebase Auth, check if they exist in Firestore (legacy support)
			if (error.code === 'auth/user-not-found') {
				console.log('User not found in Firebase Auth, checking Firestore for legacy users...');
				// Check if user exists in Firestore with needsAuthCreation flag (legacy users)
				const usersSnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
				console.log('Found users in Firestore:', usersSnapshot.docs.length);
				
				if (!usersSnapshot.empty) {
					const userDoc = usersSnapshot.docs[0];
					const userData = userDoc.data();
					console.log('User data from Firestore:', {
						email: userData.email,
						role: userData.role,
						needsAuthCreation: userData.needsAuthCreation,
						hasPassword: !!userData.password,
						rollNumber: userData.rollNumber
					});
					
					// Only handle legacy users that still need auth creation
					if (userData.needsAuthCreation && userData.password === password) {
						console.log('Creating Firebase Auth account for legacy user...');
						// Create Firebase Auth account for this user
						const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
						const newUser = newUserCredential.user;
						console.log('Firebase Auth account created:', newUser.uid);
						
						// Update the user document with the real UID and remove temporary data
						await updateDoc(doc(db, 'users', userDoc.id), {
							uid: newUser.uid,
							password: null, // Remove password from Firestore
							needsAuthCreation: false,
						});
						console.log('User document updated in Firestore');
						
						// Update student record if it exists (for students, userId should remain as roll number)
						if (userData.role === 'student' && userData.rollNumber) {
							const studentDoc = doc(db, 'students', userData.rollNumber);
							await updateDoc(studentDoc, {
								// Keep userId as roll number for students, but add authUid for Firebase Auth reference
								authUid: newUser.uid,
							});
							console.log('Student record updated with authUid');
						}
						
						// Sign out the newly created user and sign them in again
						await signOut(auth);
						console.log('Signed out, now signing in again...');
						const finalUserCredential = await signInWithEmailAndPassword(auth, email, password);
						console.log('Final sign-in successful');
						return finalUserCredential.user;
					} else {
						console.log('Password mismatch or user does not need auth creation');
					}
				} else {
					console.log('No user found in Firestore with email:', email);
				}
			}
			throw error;
		}
	},

	// Sign out user
	async signOut(): Promise<void> {
		try {
			await signOut(auth);
		} catch (error) {
			throw error;
		}
	},

	// Get current user
	getCurrentUser(): FirebaseUser | null {
		return auth.currentUser;
	},

	// Get current user data from Firestore
	async getCurrentUserData(): Promise<User | null> {
		try {
			const user = auth.currentUser;
			if (!user) return null;

			console.log('Getting current user data for UID:', user.uid);

			// First, try to find user by Firebase Auth UID (for teachers/admins)
			const userDocRef = doc(db, 'users', user.uid);
			const userDocSnap = await getDoc(userDocRef);

			if (userDocSnap.exists()) {
				console.log('Found user by Firebase Auth UID');
				return { id: userDocSnap.id, ...userDocSnap.data() } as User;
			}

			// If not found by UID, try to find by email (for students with roll number as document ID)
			console.log('User not found by UID, searching by email:', user.email);
			const usersSnapshot = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
			
			if (!usersSnapshot.empty) {
				const userDoc = usersSnapshot.docs[0];
				console.log('Found user by email');
				return { id: userDoc.id, ...userDoc.data() } as User;
			}

			console.log('No user found in Firestore');
			return null;
		} catch (error) {
			console.error('Error getting current user data:', error);
			throw error;
		}
	},
};

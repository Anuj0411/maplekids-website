import {
	collection,
	doc,
	addDoc,
	updateDoc,
	getDocs,
	query,
	where,
	orderBy,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { Attendance, Student } from '../types';
import { handleError } from '../utils/errorHandler';
import { studentService } from './student.service';

/**
 * Attendance Service
 * Handles student attendance tracking, statistics, and reporting
 */
export const attendanceService = {
	/**
	 * Add new attendance record
	 */
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
			throw handleError(error, 'Error adding attendance record');
		}
	},

	/**
	 * Get attendance by class and date
	 */
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
			throw handleError(error, `Error fetching attendance for ${className} on ${date}`);
		}
	},

	/**
	 * Get attendance records for a specific student
	 */
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
			throw handleError(error, `Error fetching attendance for student ${rollNumber}`);
		}
	},

	/**
	 * Update attendance record
	 */
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
			throw handleError(error, `Error updating attendance ${id}`);
		}
	},

	/**
	 * Get all attendance records for a specific date
	 */
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
			throw handleError(error, `Error fetching attendance for ${date}`);
		}
	},

	/**
	 * Get attendance statistics for all classes on a specific date
	 */
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
			throw handleError(error, `Error calculating attendance statistics for ${date}`);
		}
	},

	/**
	 * Get attendance records within a date range
	 */
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
			throw handleError(error, `Error fetching attendance from ${startDate} to ${endDate}`);
		}
	},

	/**
	 * Get attendance statistics for a date range
	 */
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
			throw handleError(error, `Error calculating statistics from ${startDate} to ${endDate}`);
		}
	},

	/**
	 * Get attendance statistics for a specific month and year
	 */
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
			throw handleError(error, `Error calculating statistics for ${year}-${month}`);
		}
	},

	/**
	 * Mark attendance (bulk operation with teacher tracking)
	 * Creates new record or updates existing one
	 */
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
					updatedBy: attendanceData.markedBy, // Track who updated
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
			throw handleError(error, 'Error marking attendance');
		}
	},
};

/**
 * Attendance-related type definitions
 */

/**
 * Attendance status enumeration
 */
export type AttendanceStatus = 'present' | 'absent' | 'late';

/**
 * Student attendance record within an attendance entry
 */
export interface StudentAttendanceRecord {
	/** Student's unique identifier */
	studentId: string;
	
	/** Student's roll number */
	rollNumber: string;
	
	/** Student's full name (optional) */
	studentName?: string;
	
	/** Attendance status */
	status: AttendanceStatus;
	
	/** Additional remarks */
	remarks?: string;
}

/**
 * User who marked the attendance
 */
export interface AttendanceMarker {
	/** User ID who marked attendance */
	userId: string;
	
	/** Name of the user */
	name: string;
	
	/** Email of the user */
	email: string;
}

/**
 * Attendance interface representing class attendance for a specific date
 */
export interface Attendance {
	/** Unique identifier (Firestore document ID) */
	id?: string;
	
	/** Class name */
	class: string;
	
	/** Attendance date (ISO string) */
	date: string;
	
	/** Array of student attendance records */
	students: StudentAttendanceRecord[];
	
	/** User who marked the attendance */
	markedBy?: AttendanceMarker;
	
	/** User who last updated the attendance */
	updatedBy?: AttendanceMarker;
	
	/** Timestamp when attendance was created */
	createdAt?: any;
	
	/** Timestamp when attendance was last updated */
	updatedAt?: any;
}

/**
 * Attendance statistics
 */
export interface AttendanceStats {
	/** Total number of students */
	totalStudents: number;
	
	/** Number of present students */
	presentCount: number;
	
	/** Number of absent students */
	absentCount: number;
	
	/** Number of late students */
	lateCount: number;
	
	/** Attendance percentage */
	attendancePercentage: number;
}

/**
 * Date range for attendance queries
 */
export interface AttendanceDateRange {
	/** Start date (ISO string) */
	startDate: string;
	
	/** End date (ISO string) */
	endDate: string;
}

/**
 * Bulk attendance data for multiple students
 */
export interface BulkAttendanceData {
	/** Class name */
	class: string;
	
	/** Attendance date */
	date: string;
	
	/** Array of student attendance records */
	students: StudentAttendanceRecord[];
	
	/** User who marked the attendance */
	markedBy?: AttendanceMarker;
}

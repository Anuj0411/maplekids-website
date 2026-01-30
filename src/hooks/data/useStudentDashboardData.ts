import { useState, useEffect, useCallback } from 'react';
import { studentService, attendanceService, Student, Attendance } from '@/firebase/services';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface SubjectResult {
  subject: string;
  marks: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

export interface AuditInfo {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  timestamp: any;
}

export interface AcademicReport {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  subjects: SubjectResult[];
  term: string;
  createdAt: any;
  createdBy: string;
  createdByInfo?: AuditInfo;
  updatedBy?: string;
  updatedByInfo?: AuditInfo;
  updatedAt?: any;
}

export interface StudentRemark {
  id?: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  remark: string;
  type: 'positive' | 'negative' | 'neutral';
  date: string;
  createdAt: any;
  createdBy: string;
  createdByInfo?: AuditInfo;
  updatedBy?: string;
  updatedByInfo?: AuditInfo;
  updatedAt?: any;
}

interface UseStudentDashboardDataOptions {
  authUid?: string; // Firebase Auth UID
  autoLoad?: boolean;
}

/**
 * Student Dashboard Data Management Hook
 * 
 * Centralized data fetching for student dashboard.
 * Loads student info, attendance, academic reports, and remarks.
 * 
 * @param options - Configuration options
 * @param options.authUid - Firebase Auth UID of the student
 * @param options.autoLoad - Whether to automatically fetch on mount (default: true)
 * 
 * @returns Student dashboard data and control functions
 * 
 * @example
 * const { student, attendance, academicReports, remarks, loading } = useStudentDashboardData({
 *   authUid: currentUser?.uid
 * });
 */
export const useStudentDashboardData = (options: UseStudentDashboardDataOptions = {}) => {
  const { authUid, autoLoad = true } = options;

  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [academicReports, setAcademicReports] = useState<AcademicReport[]>([]);
  const [remarks, setRemarks] = useState<StudentRemark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load academic reports for the student
   */
  const loadAcademicReports = useCallback(async (studentRecord: Student) => {
    try {
      console.log('useStudentDashboardData: Loading academic reports for studentId:', studentRecord.rollNumber);
      const reportsQuery = query(
        collection(db, 'academicReports'),
        where('studentId', '==', studentRecord.rollNumber)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      console.log('useStudentDashboardData: Academic reports query result:', reportsSnapshot.docs.length, 'documents');
      
      const reportsData = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AcademicReport[];
      
      // Sort by createdAt in descending order (newest first)
      reportsData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      });
      
      setAcademicReports(reportsData);
      console.log('useStudentDashboardData: Set academic reports:', reportsData.length);
      return reportsData;
    } catch (err) {
      console.error('Error loading academic reports:', err);
      return [];
    }
  }, []);

  /**
   * Load remarks for the student
   */
  const loadRemarks = useCallback(async (studentRecord: Student) => {
    try {
      console.log('useStudentDashboardData: Loading remarks for studentId:', studentRecord.rollNumber);
      const remarksQuery = query(
        collection(db, 'remarks'),
        where('studentId', '==', studentRecord.rollNumber)
      );
      const remarksSnapshot = await getDocs(remarksQuery);
      console.log('useStudentDashboardData: Remarks query result:', remarksSnapshot.docs.length, 'documents');
      
      const remarksData = remarksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudentRemark[];
      
      // Sort by createdAt in descending order (newest first)
      remarksData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      });
      
      setRemarks(remarksData);
      console.log('useStudentDashboardData: Set remarks:', remarksData.length);
      return remarksData;
    } catch (err) {
      console.error('Error loading remarks:', err);
      return [];
    }
  }, []);

  /**
   * Load all student dashboard data
   */
  const loadAllData = useCallback(async (uid?: string) => {
    const studentAuthUid = uid || authUid;
    
    if (!studentAuthUid) {
      console.log('useStudentDashboardData: No auth UID available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('useStudentDashboardData: Loading student data for user:', studentAuthUid);
      
      // Find student record by authUid (Firebase Auth UID)
      const studentRecord = await studentService.getStudentByAuthUid(studentAuthUid);
      console.log('useStudentDashboardData: Found student record:', studentRecord);
      
      if (studentRecord) {
        setStudent(studentRecord);
        console.log('useStudentDashboardData: Student roll number:', studentRecord.rollNumber);
        
        // Load all related data in parallel
        const [attendanceData] = await Promise.all([
          attendanceService.getAttendanceByStudent(studentRecord.rollNumber),
          loadAcademicReports(studentRecord),
          loadRemarks(studentRecord)
        ]);
        
        console.log('useStudentDashboardData: Loaded attendance data:', attendanceData.length, 'records');
        setAttendance(attendanceData);
      } else {
        console.log('useStudentDashboardData: No student record found for user:', studentAuthUid);
        setError('Student record not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading student data';
      setError(errorMessage);
      console.error('Error loading student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [authUid, loadAcademicReports, loadRemarks]);

  /**
   * Refetch all student data
   */
  const refetch = useCallback(() => {
    return loadAllData();
  }, [loadAllData]);

  /**
   * Refetch only academic reports
   */
  const refetchReports = useCallback(async () => {
    if (student) {
      await loadAcademicReports(student);
    }
  }, [student, loadAcademicReports]);

  /**
   * Refetch only remarks
   */
  const refetchRemarks = useCallback(async () => {
    if (student) {
      await loadRemarks(student);
    }
  }, [student, loadRemarks]);

  // Auto-load data when authUid changes
  useEffect(() => {
    if (autoLoad && authUid) {
      loadAllData(authUid);
    }
  }, [autoLoad, authUid, loadAllData]);

  return {
    // Data
    student,
    attendance,
    academicReports,
    remarks,
    
    // State
    loading,
    error,
    
    // Actions
    refetch,
    loadAllData,
    refetchReports,
    refetchRemarks,
  };
};

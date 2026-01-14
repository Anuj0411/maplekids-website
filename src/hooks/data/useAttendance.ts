import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Attendance } from '@/firebase/types';

/**
 * Attendance statistics interface
 */
export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  missed: number; // Students who don't have attendance marked
}

/**
 * Date range statistics interface
 */
export interface DateRangeStats {
  dailyStats: { [date: string]: { [className: string]: AttendanceStats } };
  summaryStats: { [className: string]: AttendanceStats };
  totalDays: number;
  workingDays?: number;
}

/**
 * Hook options interface
 */
interface UseAttendanceOptions {
  /** Whether to automatically fetch attendance on mount */
  autoFetch?: boolean;
  /** Filter by specific class */
  filterByClass?: string;
  /** Filter by specific date */
  filterByDate?: string;
  /** Filter by student roll number */
  filterByStudent?: string;
}

/**
 * Hook return type
 */
interface UseAttendanceReturn {
  // Data
  attendance: Attendance[];
  loading: boolean;
  error: string | null;
  
  // CRUD Operations
  addAttendance: (attendanceData: Omit<Attendance, 'id' | 'createdAt'>) => Promise<Attendance>;
  updateAttendance: (id: string, attendanceData: Partial<Attendance>) => Promise<void>;
  markAttendance: (data: {
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
  }) => Promise<void>;
  
  // Query Functions
  getAttendanceByClassAndDate: (className: string, date: string) => Promise<Attendance | null>;
  getAttendanceByStudent: (rollNumber: string) => Promise<Attendance[]>;
  getAttendanceByDate: (date: string) => Promise<Attendance[]>;
  getAttendanceByDateRange: (startDate: string, endDate: string) => Promise<Attendance[]>;
  
  // Statistics Functions
  getAttendanceStatistics: (date: string) => Promise<{ [className: string]: AttendanceStats }>;
  getAttendanceStatisticsByDateRange: (startDate: string, endDate: string) => Promise<DateRangeStats>;
  getAttendanceStatisticsByMonth: (year: number, month: number) => Promise<DateRangeStats & { workingDays: number }>;
  
  // Utility
  refetch: () => void;
}

/**
 * Custom hook for managing attendance
 * Provides real-time attendance data with CRUD operations and statistics
 * 
 * @param options - Configuration options
 * @returns Attendance management functions and data
 * 
 * @example
 * ```tsx
 * const { attendance, markAttendance, getAttendanceStatistics, loading } = useAttendance();
 * ```
 */
export const useAttendance = (options: UseAttendanceOptions = {}): UseAttendanceReturn => {
  const {
    autoFetch = true,
    filterByClass,
    filterByDate,
    filterByStudent,
  } = options;

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch attendance from Firestore with real-time updates
   */
  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Build query based on filters
    let q = query(collection(db, 'attendance'), orderBy('date', 'desc'));

    if (filterByClass) {
      q = query(collection(db, 'attendance'), where('class', '==', filterByClass), orderBy('date', 'desc'));
    } else if (filterByDate) {
      q = query(collection(db, 'attendance'), where('date', '==', filterByDate));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let fetchedAttendance = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Attendance[];

        // Filter by student if specified
        if (filterByStudent) {
          fetchedAttendance = fetchedAttendance.filter((record) =>
            record.students.some((s) => s.rollNumber === filterByStudent)
          );
        }

        setAttendance(fetchedAttendance);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching attendance:', err);
        setError(err.message || 'Failed to fetch attendance');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [autoFetch, filterByClass, filterByDate, filterByStudent]);

  /**
   * Add a new attendance record
   */
  const addAttendance = useCallback(async (attendanceData: Omit<Attendance, 'id' | 'createdAt'>): Promise<Attendance> => {
    try {
      setError(null);

      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(attendanceData).filter(([_, value]) => value !== undefined)
      );

      const docRef = await addDoc(collection(db, 'attendance'), {
        ...cleanData,
        createdAt: serverTimestamp(),
      });

      const result = { ...attendanceData, id: docRef.id } as Attendance;

      // Optimistically add to local state
      setAttendance((prev) => [result, ...prev]);

      return result;
    } catch (err: any) {
      console.error('Error adding attendance:', err);
      setError(err.message || 'Failed to add attendance');
      throw err;
    }
  }, []);

  /**
   * Update an existing attendance record
   */
  const updateAttendance = useCallback(async (id: string, attendanceData: Partial<Attendance>): Promise<void> => {
    try {
      setError(null);

      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(attendanceData).filter(([_, value]) => value !== undefined)
      );

      // Optimistically update local state
      setAttendance((prev) =>
        prev.map((record) =>
          record.id === id ? { ...record, ...cleanData } : record
        )
      );

      const attendanceRef = doc(db, 'attendance', id);
      await updateDoc(attendanceRef, cleanData);
    } catch (err: any) {
      console.error('Error updating attendance:', err);
      setError(err.message || 'Failed to update attendance');
      // Revert optimistic update on error
      setAttendance((prev) => prev);
      throw err;
    }
  }, []);

  /**
   * Get attendance by class and date
   */
  const getAttendanceByClassAndDate = useCallback(async (className: string, date: string): Promise<Attendance | null> => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('class', '==', className),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Attendance;
      }
      return null;
    } catch (err: any) {
      console.error('Error getting attendance by class and date:', err);
      throw err;
    }
  }, []);

  /**
   * Mark attendance (bulk operation with teacher tracking)
   */
  const markAttendance = useCallback(async (data: {
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
  }): Promise<void> => {
    try {
      setError(null);

      // Check if attendance already exists for this class and date
      const existingAttendance = await getAttendanceByClassAndDate(data.class, data.date);

      if (existingAttendance && existingAttendance.id) {
        // Update existing attendance
        await updateAttendance(existingAttendance.id, {
          students: data.students,
          markedBy: data.markedBy,
        });
      } else {
        // Create new attendance
        await addAttendance({
          class: data.class,
          date: data.date,
          students: data.students,
          markedBy: data.markedBy,
        });
      }
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      setError(err.message || 'Failed to mark attendance');
      throw err;
    }
  }, [addAttendance, updateAttendance, getAttendanceByClassAndDate]);

  /**
   * Get attendance records for a specific student
   */
  const getAttendanceByStudent = useCallback(async (rollNumber: string): Promise<Attendance[]> => {
    try {
      const q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const attendanceRecords: Attendance[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Attendance;
        const studentInRecord = data.students.some((s) => s.rollNumber === rollNumber);
        if (studentInRecord) {
          attendanceRecords.push({
            id: doc.id,
            ...data,
          });
        }
      });

      return attendanceRecords;
    } catch (err: any) {
      console.error('Error getting attendance by student:', err);
      throw err;
    }
  }, []);

  /**
   * Get all attendance records for a specific date
   */
  const getAttendanceByDate = useCallback(async (date: string): Promise<Attendance[]> => {
    try {
      const q = query(collection(db, 'attendance'), where('date', '==', date));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Attendance[];
    } catch (err: any) {
      console.error('Error getting attendance by date:', err);
      throw err;
    }
  }, []);

  /**
   * Get attendance records within a date range
   */
  const getAttendanceByDateRange = useCallback(async (startDate: string, endDate: string): Promise<Attendance[]> => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Attendance[];
    } catch (err: any) {
      console.error('Error getting attendance by date range:', err);
      throw err;
    }
  }, []);

  /**
   * Get attendance statistics for a specific date
   */
  const getAttendanceStatistics = useCallback(async (date: string): Promise<{ [className: string]: AttendanceStats }> => {
    try {
      // Import studentService dynamically to avoid circular dependency
      const { studentService } = await import('@/firebase/services');

      // Get all students grouped by class
      const allStudents = await studentService.getAllStudents();
      const studentsByClass = allStudents.reduce((acc, student) => {
        if (!acc[student.class]) {
          acc[student.class] = [];
        }
        acc[student.class].push(student);
        return acc;
      }, {} as { [key: string]: any[] });

      // Get attendance records for the date
      const attendanceRecords = await getAttendanceByDate(date);

      // Calculate statistics for each class
      const statistics: { [className: string]: AttendanceStats } = {};

      for (const [className, students] of Object.entries(studentsByClass)) {
        const classAttendance = attendanceRecords.find((record) => record.class === className);

        let present = 0;
        let absent = 0;
        let late = 0;
        let missed = 0;

        if (classAttendance && classAttendance.students) {
          classAttendance.students.forEach((studentAttendance) => {
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

          missed = students.length - classAttendance.students.length;
        } else {
          missed = students.length;
        }

        statistics[className] = {
          total: students.length,
          present,
          absent,
          late,
          missed,
        };
      }

      return statistics;
    } catch (err: any) {
      console.error('Error getting attendance statistics:', err);
      throw err;
    }
  }, [getAttendanceByDate]);

  /**
   * Get attendance statistics for a date range
   */
  const getAttendanceStatisticsByDateRange = useCallback(async (startDate: string, endDate: string): Promise<DateRangeStats> => {
    try {
      const { studentService } = await import('@/firebase/services');

      const allStudents = await studentService.getAllStudents();
      const studentsByClass = allStudents.reduce((acc, student) => {
        if (!acc[student.class]) {
          acc[student.class] = [];
        }
        acc[student.class].push(student);
        return acc;
      }, {} as { [key: string]: any[] });

      const attendanceRecords = await getAttendanceByDateRange(startDate, endDate);

      const recordsByDate = attendanceRecords.reduce((acc, record) => {
        if (!acc[record.date]) {
          acc[record.date] = [];
        }
        acc[record.date].push(record);
        return acc;
      }, {} as { [key: string]: Attendance[] });

      const dailyStats: { [date: string]: { [className: string]: AttendanceStats } } = {};
      const summaryStats: { [className: string]: AttendanceStats } = {};

      // Initialize summary stats
      for (const className of Object.keys(studentsByClass)) {
        summaryStats[className] = { total: 0, present: 0, absent: 0, late: 0, missed: 0 };
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayRecords = recordsByDate[dateStr] || [];

        dailyStats[dateStr] = {};

        for (const [className, students] of Object.entries(studentsByClass)) {
          const classAttendance = dayRecords.find((record) => record.class === className);

          let present = 0;
          let absent = 0;
          let late = 0;
          let missed = 0;

          if (classAttendance && classAttendance.students) {
            classAttendance.students.forEach((studentAttendance) => {
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
            missed = students.length - classAttendance.students.length;
          } else {
            missed = students.length;
          }

          dailyStats[dateStr][className] = {
            total: students.length,
            present,
            absent,
            late,
            missed,
          };

          // Update summary
          summaryStats[className].total += students.length;
          summaryStats[className].present += present;
          summaryStats[className].absent += absent;
          summaryStats[className].late += late;
          summaryStats[className].missed += missed;
        }
      }

      return {
        dailyStats,
        summaryStats,
        totalDays,
      };
    } catch (err: any) {
      console.error('Error getting attendance statistics by date range:', err);
      throw err;
    }
  }, [getAttendanceByDateRange]);

  /**
   * Get attendance statistics for a specific month
   */
  const getAttendanceStatisticsByMonth = useCallback(async (year: number, month: number): Promise<DateRangeStats & { workingDays: number }> => {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const rangeStats = await getAttendanceStatisticsByDateRange(startDate, endDate);

      // Calculate working days (excluding weekends)
      const start = new Date(startDate);
      const end = new Date(endDate);
      let workingDays = 0;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
      }

      return {
        ...rangeStats,
        workingDays,
      };
    } catch (err: any) {
      console.error('Error getting attendance statistics by month:', err);
      throw err;
    }
  }, [getAttendanceStatisticsByDateRange]);

  /**
   * Manually refetch attendance
   */
  const refetch = useCallback(() => {
    setLoading(true);
  }, []);

  return {
    attendance,
    loading,
    error,
    addAttendance,
    updateAttendance,
    markAttendance,
    getAttendanceByClassAndDate,
    getAttendanceByStudent,
    getAttendanceByDate,
    getAttendanceByDateRange,
    getAttendanceStatistics,
    getAttendanceStatisticsByDateRange,
    getAttendanceStatisticsByMonth,
    refetch,
  };
};

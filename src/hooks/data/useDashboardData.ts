import { useState, useEffect, useCallback } from 'react';
import { 
  studentService, 
  financialService, 
  eventService, 
  userService,
  Student 
} from '@/firebase/services';

export interface DashboardUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface DashboardFinancialRecord {
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
}

export interface DashboardEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isActive: boolean;
  createdAt?: any;
}

export interface DashboardStats {
  totalUsers: number;
  students: number;
  admins: number;
  teachers: number;
  totalStudents: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface UseDashboardDataOptions {
  loadUsers?: boolean;
  loadStudents?: boolean;
  loadFinancials?: boolean;
  loadEvents?: boolean;
  autoLoad?: boolean;
}

/**
 * Dashboard Data Management Hook
 * 
 * Centralized data fetching for dashboard components.
 * Handles loading users, students, financial records, and events.
 * Calculates dashboard statistics automatically.
 * 
 * @param options - Configuration options
 * @param options.loadUsers - Whether to load users data (default: true)
 * @param options.loadStudents - Whether to load students data (default: true)
 * @param options.loadFinancials - Whether to load financial records (default: true)
 * @param options.loadEvents - Whether to load events (default: true)
 * @param options.autoLoad - Whether to automatically fetch on mount (default: true)
 * 
 * @returns Dashboard data and control functions
 * 
 * @example
 * // Load all dashboard data
 * const { students, users, stats, loading, refetch } = useDashboardData();
 * 
 * @example
 * // Load only students and events
 * const { students, events } = useDashboardData({
 *   loadUsers: false,
 *   loadFinancials: false
 * });
 */
export const useDashboardData = (options: UseDashboardDataOptions = {}) => {
  const {
    loadUsers = true,
    loadStudents = true,
    loadFinancials = true,
    loadEvents = true,
    autoLoad = true,
  } = options;

  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [financialRecords, setFinancialRecords] = useState<DashboardFinancialRecord[]>([]);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    students: 0,
    admins: 0,
    teachers: 0,
    totalStudents: 0,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate dashboard statistics
   */
  const calculateStats = useCallback((
    usersData: DashboardUser[],
    studentsData: Student[],
    financialData: DashboardFinancialRecord[]
  ) => {
    const totalIncome = financialData
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + (record.amount || 0), 0);
    
    const totalExpense = financialData
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + (record.amount || 0), 0);
    
    const studentCount = studentsData.length;
    const adminCount = usersData.filter(u => u.role === 'admin').length;
    const teacherCount = usersData.filter(u => u.role === 'teacher').length;

    return {
      totalUsers: usersData.length,
      students: studentCount,
      admins: adminCount,
      teachers: teacherCount,
      totalStudents: studentsData.length,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, []);

  /**
   * Load all dashboard data
   */
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const promises: Promise<any>[] = [];
      
      if (loadStudents) promises.push(studentService.getAllStudents());
      if (loadFinancials) promises.push(financialService.getAllFinancialRecords());
      if (loadEvents) promises.push(eventService.getAllEvents());
      if (loadUsers) promises.push(userService.getAllUsers());

      const results = await Promise.all(promises);
      
      let studentsData: Student[] = [];
      let financialData: DashboardFinancialRecord[] = [];
      let eventsData: DashboardEvent[] = [];
      let usersData: DashboardUser[] = [];

      let resultIndex = 0;
      if (loadStudents) studentsData = results[resultIndex++];
      if (loadFinancials) financialData = results[resultIndex++];
      if (loadEvents) eventsData = results[resultIndex++];
      if (loadUsers) usersData = results[resultIndex++];

      // Filter students to only show those who exist in the users collection (if both are loaded)
      if (loadStudents && loadUsers) {
        const activeStudents = studentsData.filter(student =>
          usersData.some(user => 
            user.role === 'student' && 
            user.email === student.email
          )
        );
        setStudents(activeStudents);
      } else if (loadStudents) {
        setStudents(studentsData);
      }

      if (loadFinancials) setFinancialRecords(financialData);
      if (loadEvents) setEvents(eventsData);
      if (loadUsers) setUsers(usersData);

      // Calculate and set statistics
      const calculatedStats = calculateStats(usersData, studentsData, financialData);
      setStats(calculatedStats);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading dashboard data';
      setError(errorMessage);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadStudents, loadFinancials, loadEvents, loadUsers, calculateStats]);

  /**
   * Refetch all data
   */
  const refetch = useCallback(() => {
    return loadAllData();
  }, [loadAllData]);

  /**
   * Filter students by class
   */
  const filterStudentsByClass = useCallback((className: string) => {
    if (className === 'all') return students;
    return students.filter(s => s.class === className);
  }, [students]);

  /**
   * Filter financial records by class
   */
  const filterFinancialsByClass = useCallback((className: string) => {
    if (className === 'all') return financialRecords;
    return financialRecords.filter(r => r.studentClass === className);
  }, [financialRecords]);

  /**
   * Get active events
   */
  const getActiveEvents = useCallback(() => {
    return events.filter(event => event.isActive);
  }, [events]);

  /**
   * Get upcoming events (future dates)
   */
  const getUpcomingEvents = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => event.isActive && new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadAllData();
    }
  }, [autoLoad, loadAllData]);

  return {
    // Data
    users,
    students,
    financialRecords,
    events,
    stats,
    
    // State
    loading,
    error,
    
    // Actions
    refetch,
    loadAllData,
    
    // Filters/Helpers
    filterStudentsByClass,
    filterFinancialsByClass,
    getActiveEvents,
    getUpcomingEvents,
  };
};

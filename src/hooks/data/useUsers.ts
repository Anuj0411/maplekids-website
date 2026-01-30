import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '@/firebase/config';
import type { User } from '@/firebase/types';

/**
 * User statistics interface
 */
export interface UserStats {
  totalUsers: number;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  activeCount: number;
  inactiveCount: number;
}

/**
 * Hook options interface
 */
interface UseUsersOptions {
  /** Whether to automatically fetch users on mount */
  autoFetch?: boolean;
  /** Filter by specific role */
  filterByRole?: 'student' | 'teacher' | 'admin';
  /** Filter by class (for students) */
  filterByClass?: string;
  /** Include only active users */
  activeOnly?: boolean;
}

/**
 * Hook return type
 */
interface UseUsersReturn {
  // Data
  users: User[];
  loading: boolean;
  error: string | null;
  
  // CRUD Operations
  addUser: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: 'student' | 'teacher' | 'admin') => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  
  // Filtering Functions
  getUsersByRole: (role: 'student' | 'teacher' | 'admin') => User[];
  getUsersByClass: (className: string) => User[];
  getActiveUsers: () => User[];
  searchUsers: (query: string) => User[];
  
  // Computed Properties
  students: User[];
  teachers: User[];
  admins: User[];
  activeUsers: User[];
  stats: UserStats;
  
  // Utility
  refetch: () => void;
}

/**
 * Custom hook for managing users
 * Provides real-time user data with CRUD operations and filtering
 * 
 * @param options - Configuration options
 * @returns User management functions and data
 * 
 * @example
 * ```tsx
 * const { users, students, addUser, loading } = useUsers({ autoFetch: true });
 * ```
 */
export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const {
    autoFetch = true,
    filterByRole,
    filterByClass,
    activeOnly = false,
  } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch users from Firestore with real-time updates
   */
  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(fetchedUsers);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to fetch users');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [autoFetch]);

  /**
   * Add a new user (creates both Auth and Firestore record)
   * Note: Creating a user will log out the current admin due to Firebase Auth limitations.
   * The admin will need to log back in after creating a user.
   */
  const addUser = useCallback(async (email: string, password: string, userData: Partial<User>): Promise<void> => {
    try {
      setError(null);

      // Get current admin UID before creating new user
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error('No admin user is currently signed in');
      }
      const adminUid = currentAdmin.uid;

      // Create Firebase Auth account (this will automatically log in the new user)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // For students, use roll number as document ID if available
      // For other users, use Firebase Auth UID
      const documentId = userData.role === 'student' && (userData as any).rollNumber
        ? (userData as any).rollNumber
        : firebaseUser.uid;

      // Prepare user document data
      const userDocData = {
        ...userData,
        uid: firebaseUser.uid,
        email: email,
        createdAt: serverTimestamp(),
        createdBy: adminUid,
        needsAuthCreation: false,
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', documentId), userDocData);

      // If it's a student, also create a student record
      if (userData.role === 'student' && (userData as any).class && (userData as any).rollNumber) {
        const studentData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: email,
          phone: userData.phone,
          address: userData.address,
          class: (userData as any).class,
          rollNumber: (userData as any).rollNumber,
          userId: (userData as any).rollNumber,
          authUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          createdBy: adminUid,
        };
        await setDoc(doc(db, 'students', (userData as any).rollNumber), studentData);
      }

      // Sign out the newly created user (which logs out everyone)
      await signOut(auth);

      // Optimistically add to local state
      setUsers((prev) => [...prev, { id: documentId, ...userData, email } as User]);
    } catch (err: any) {
      console.error('Error adding user:', err);
      setError(err.message || 'Failed to add user');
      throw err;
    }
  }, []);

  /**
   * Update an existing user
   */
  const updateUser = useCallback(async (userId: string, userData: Partial<User>): Promise<void> => {
    try {
      setError(null);

      // Optimistically update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...userData } : user
        )
      );

      // Update in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, userData);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
      // Revert optimistic update on error
      setUsers((prev) => prev);
      throw err;
    }
  }, []);

  /**
   * Delete a user completely from all collections
   * - Deletes from users collection
   * - Deletes from students collection (if student)
   * - Note: Does NOT delete from Firebase Auth (requires admin privileges)
   */
  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    try {
      setError(null);

      // Get user data before deletion
      const userToDelete = users.find((u) => u.id === userId);

      if (!userToDelete) {
        throw new Error('User not found');
      }

      console.log('Deleting user:', {
        userId,
        role: userToDelete.role,
        rollNumber: (userToDelete as any).rollNumber,
        email: userToDelete.email
      });

      // Optimistically remove from local state
      setUsers((prev) => prev.filter((user) => user.id !== userId));

      // Delete from Firestore users collection
      await deleteDoc(doc(db, 'users', userId));
      console.log(`✅ Deleted from users/${userId}`);

      // If it's a student, also delete from students collection
      // For students, the document ID in both collections is the rollNumber
      if (userToDelete.role === 'student') {
        try {
          // Try to delete using the rollNumber (which should be the same as userId for students)
          await deleteDoc(doc(db, 'students', userId));
          console.log(`✅ Deleted from students/${userId}`);
        } catch (studentError: any) {
          console.warn('Could not delete from students collection:', studentError);
          
          // If rollNumber is stored separately, try that
          if ((userToDelete as any).rollNumber && (userToDelete as any).rollNumber !== userId) {
            try {
              await deleteDoc(doc(db, 'students', (userToDelete as any).rollNumber));
              console.log(`✅ Deleted from students/${(userToDelete as any).rollNumber}`);
            } catch (fallbackError) {
              console.error('Failed to delete student record with rollNumber:', fallbackError);
            }
          }
        }
      }

      console.log('✅ User deletion complete');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
      // Revert optimistic update on error
      setUsers((prev) => prev);
      throw err;
    }
  }, [users]);

  /**
   * Update user role
   */
  const updateUserRole = useCallback(async (userId: string, newRole: 'student' | 'teacher' | 'admin'): Promise<void> => {
    try {
      await updateUser(userId, { role: newRole });
    } catch (err) {
      console.error('Error updating user role:', err);
      throw err;
    }
  }, [updateUser]);

  /**
   * Toggle user active status
   */
  const toggleUserStatus = useCallback(async (userId: string): Promise<void> => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newStatus = !(user as any).isActive;
      await updateUser(userId, { isActive: newStatus } as any);
    } catch (err) {
      console.error('Error toggling user status:', err);
      throw err;
    }
  }, [users, updateUser]);

  /**
   * Get users by role
   */
  const getUsersByRole = useCallback((role: 'student' | 'teacher' | 'admin'): User[] => {
    return users.filter((user) => user.role === role);
  }, [users]);

  /**
   * Get users by class (for students)
   */
  const getUsersByClass = useCallback((className: string): User[] => {
    return users.filter((user) => user.role === 'student' && (user as any).class === className);
  }, [users]);

  /**
   * Get only active users
   */
  const getActiveUsers = useCallback((): User[] => {
    return users.filter((user) => (user as any).isActive !== false);
  }, [users]);

  /**
   * Search users by name or email
   */
  const searchUsers = useCallback((query: string): User[] => {
    const lowercaseQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(lowercaseQuery) ||
        user.lastName?.toLowerCase().includes(lowercaseQuery) ||
        user.email?.toLowerCase().includes(lowercaseQuery)
    );
  }, [users]);

  /**
   * Computed: All students
   */
  const students = useMemo(() => getUsersByRole('student'), [getUsersByRole]);

  /**
   * Computed: All teachers
   */
  const teachers = useMemo(() => getUsersByRole('teacher'), [getUsersByRole]);

  /**
   * Computed: All admins
   */
  const admins = useMemo(() => getUsersByRole('admin'), [getUsersByRole]);

  /**
   * Computed: All active users
   */
  const activeUsers = useMemo(() => getActiveUsers(), [getActiveUsers]);

  /**
   * Computed: User statistics
   */
  const stats = useMemo((): UserStats => {
    return {
      totalUsers: users.length,
      studentCount: students.length,
      teacherCount: teachers.length,
      adminCount: admins.length,
      activeCount: activeUsers.length,
      inactiveCount: users.length - activeUsers.length,
    };
  }, [users, students, teachers, admins, activeUsers]);

  /**
   * Manually refetch users
   */
  const refetch = useCallback(() => {
    setLoading(true);
    // The useEffect will handle refetching via the snapshot listener
  }, []);

  // Apply filters
  const filteredUsers = useMemo(() => {
    let result = users;

    if (filterByRole) {
      result = result.filter((user) => user.role === filterByRole);
    }

    if (filterByClass) {
      result = result.filter((user) => (user as any).class === filterByClass);
    }

    if (activeOnly) {
      result = result.filter((user) => (user as any).isActive !== false);
    }

    return result;
  }, [users, filterByRole, filterByClass, activeOnly]);

  return {
    users: filteredUsers,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    updateUserRole,
    toggleUserStatus,
    getUsersByRole,
    getUsersByClass,
    getActiveUsers,
    searchUsers,
    students,
    teachers,
    admins,
    activeUsers,
    stats,
    refetch,
  };
};

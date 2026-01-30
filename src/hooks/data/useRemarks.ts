import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

export interface AuditInfo {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  timestamp: any;
}

export interface Remark {
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

interface UseRemarksOptions {
  classFilter?: string;
  autoLoad?: boolean;
}

export const useRemarks = (options: UseRemarksOptions = {}) => {
  const { classFilter, autoLoad = true } = options;
  
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRemarks = useCallback(async (classParam?: string) => {
    try {
      setLoading(true);
      setError(null);

      const classToFilter = classParam || classFilter;
      
      const remarksQuery = !classToFilter || classToFilter === 'all'
        ? query(collection(db, 'remarks'))
        : query(collection(db, 'remarks'), where('class', '==', classToFilter));
      
      const remarksSnapshot = await getDocs(remarksQuery);
      const remarksData = remarksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Remark[];
      
      // Sort by date (newest first)
      remarksData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRemarks(remarksData);
      return remarksData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading remarks';
      setError(errorMessage);
      console.error('Error loading remarks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [classFilter]);

  const addRemark = useCallback(async (remarkData: Omit<Remark, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      const newRemark = {
        ...remarkData,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'remarks'), newRemark);
      
      // Reload remarks to get the updated list
      await loadRemarks();
      
      return docRef.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding remark';
      setError(errorMessage);
      console.error('Error adding remark:', err);
      throw err;
    }
  }, [loadRemarks]);

  const updateRemark = useCallback(async (id: string, remarkData: Partial<Remark>) => {
    try {
      setError(null);
      
      await updateDoc(doc(db, 'remarks', id), remarkData);
      
      // Reload remarks to get the updated list
      await loadRemarks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating remark';
      setError(errorMessage);
      console.error('Error updating remark:', err);
      throw err;
    }
  }, [loadRemarks]);

  const deleteRemark = useCallback(async (id: string) => {
    try {
      setError(null);
      
      await deleteDoc(doc(db, 'remarks', id));
      
      // Reload remarks to get the updated list
      await loadRemarks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting remark';
      setError(errorMessage);
      console.error('Error deleting remark:', err);
      throw err;
    }
  }, [loadRemarks]);

  useEffect(() => {
    if (autoLoad) {
      loadRemarks();
    }
  }, [autoLoad, loadRemarks]);

  return {
    remarks,
    loading,
    error,
    loadRemarks,
    addRemark,
    updateRemark,
    deleteRemark,
  };
};

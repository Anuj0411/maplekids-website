/**
 * Announcement Service - Firebase Implementation
 * Manages flash announcements with real-time sync
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  setDoc,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config';

// Announcement interface
export interface Announcement {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  displayDuration: number; // in seconds
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// Firestore format (with Timestamps)
interface AnnouncementDoc {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isActive: boolean;
  startDate: Timestamp;
  endDate: Timestamp;
  displayDuration: number;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// User preferences interface
export interface UserAnnouncementPreferences {
  dismissedAt: Date;
  viewCount: number;
  lastViewed: Date;
}

class AnnouncementService {
  private readonly COLLECTION = 'announcements';
  private readonly USERS_COLLECTION = 'users';
  private readonly PREFERENCES_SUBCOLLECTION = 'announcementPreferences';

  /**
   * Convert Firestore document to Announcement
   */
  private docToAnnouncement(id: string, data: AnnouncementDoc): Announcement {
    return {
      id,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      isActive: data.isActive,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      displayDuration: data.displayDuration,
      createdAt: data.createdAt.toDate(),
      createdBy: data.createdBy,
      updatedAt: data.updatedAt?.toDate(),
      updatedBy: data.updatedBy
    };
  }

  /**
   * Convert Announcement to Firestore document
   */
  private announcementToDoc(announcement: Omit<Announcement, 'id'>): Omit<AnnouncementDoc, 'createdAt'> & { createdAt?: any } {
    const doc: any = {
      mediaUrl: announcement.mediaUrl,
      mediaType: announcement.mediaType,
      isActive: announcement.isActive,
      startDate: Timestamp.fromDate(announcement.startDate),
      endDate: Timestamp.fromDate(announcement.endDate),
      displayDuration: announcement.displayDuration,
      createdBy: announcement.createdBy,
      createdAt: announcement.createdAt ? Timestamp.fromDate(announcement.createdAt) : serverTimestamp()
    };

    // Only add updatedAt and updatedBy if they exist (don't set undefined)
    if (announcement.updatedAt) {
      doc.updatedAt = Timestamp.fromDate(announcement.updatedAt);
    }
    if (announcement.updatedBy) {
      doc.updatedBy = announcement.updatedBy;
    }

    return doc;
  }

  /**
   * Get all announcements (one-time fetch)
   */
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, this.COLLECTION),
          orderBy('createdAt', 'desc')
        )
      );

      return querySnapshot.docs.map(doc => 
        this.docToAnnouncement(doc.id, doc.data() as AnnouncementDoc)
      );
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw new Error('Failed to fetch announcements');
    }
  }

  /**
   * Get active announcements (currently valid)
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    try {
      const now = Timestamp.now();
      const querySnapshot = await getDocs(
        query(
          collection(db, this.COLLECTION),
          where('isActive', '==', true),
          where('startDate', '<=', now),
          where('endDate', '>=', now),
          orderBy('startDate', 'desc')
        )
      );

      return querySnapshot.docs.map(doc => 
        this.docToAnnouncement(doc.id, doc.data() as AnnouncementDoc)
      );
    } catch (error) {
      console.error('Error fetching active announcements:', error);
      // Fallback: get all and filter client-side if compound query fails
      const allAnnouncements = await this.getAnnouncements();
      const now = new Date();
      return allAnnouncements.filter(announcement => 
        announcement.isActive && 
        announcement.startDate <= now && 
        announcement.endDate >= now
      );
    }
  }

  /**
   * Subscribe to announcements (real-time)
   */
  subscribeToAnnouncements(
    callback: (announcements: Announcement[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const announcements = snapshot.docs.map(doc =>
            this.docToAnnouncement(doc.id, doc.data() as AnnouncementDoc)
          );
          callback(announcements);
        },
        (error) => {
          console.error('Error in announcements subscription:', error);
          if (onError) {
            onError(new Error('Failed to subscribe to announcements'));
          }
        }
      );
    } catch (error) {
      console.error('Error setting up announcements subscription:', error);
      if (onError) {
        onError(error as Error);
      }
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Subscribe to active announcements (real-time)
   */
  subscribeToActiveAnnouncements(
    callback: (announcements: Announcement[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      // Subscribe to all announcements and filter client-side
      // This is more reliable than complex Firestore queries
      return this.subscribeToAnnouncements(
        (announcements) => {
          const now = new Date();
          const active = announcements.filter(announcement => 
            announcement.isActive && 
            announcement.startDate <= now && 
            announcement.endDate >= now
          );
          callback(active);
        },
        onError
      );
    } catch (error) {
      console.error('Error setting up active announcements subscription:', error);
      if (onError) {
        onError(error as Error);
      }
      return () => {};
    }
  }

  /**
   * Add new announcement
   */
  async addAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('Creating announcement with data:', announcement);
      
      const announcementData = this.announcementToDoc({
        ...announcement,
        createdAt: new Date()
      });

      console.log('Converted announcement data:', announcementData);

      const docRef = await addDoc(
        collection(db, this.COLLECTION),
        announcementData
      );

      console.log('Announcement created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding announcement:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error; // Throw the original error for better debugging
    }
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(
    id: string,
    updates: Partial<Omit<Announcement, 'id' | 'createdAt' | 'createdBy'>>,
    updatedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      
      // Convert Date fields to Timestamps
      const updateData: any = { ...updates };
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
        updatedBy
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw new Error('Failed to update announcement');
    }
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw new Error('Failed to delete announcement');
    }
  }

  /**
   * Get user's dismissed announcements
   */
  async getUserPreferences(userId: string): Promise<string[]> {
    try {
      const prefsSnapshot = await getDocs(
        collection(db, this.USERS_COLLECTION, userId, this.PREFERENCES_SUBCOLLECTION)
      );

      return prefsSnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return [];
    }
  }

  /**
   * Get announcements that user hasn't dismissed
   */
  async getUnseenAnnouncements(userId: string): Promise<Announcement[]> {
    try {
      const [activeAnnouncements, dismissedIds] = await Promise.all([
        this.getActiveAnnouncements(),
        this.getUserPreferences(userId)
      ]);

      return activeAnnouncements.filter(
        announcement => !dismissedIds.includes(announcement.id)
      );
    } catch (error) {
      console.error('Error fetching unseen announcements:', error);
      throw new Error('Failed to fetch unseen announcements');
    }
  }

  /**
   * Dismiss announcement for a user
   */
  async dismissAnnouncement(userId: string, announcementId: string): Promise<void> {
    try {
      const prefRef = doc(
        db,
        this.USERS_COLLECTION,
        userId,
        this.PREFERENCES_SUBCOLLECTION,
        announcementId
      );

      await setDoc(
        prefRef,
        {
          dismissedAt: serverTimestamp(),
          viewCount: increment(1),
          lastViewed: serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error dismissing announcement:', error);
      throw new Error('Failed to dismiss announcement');
    }
  }

  /**
   * Clear all dismissed announcements for a user (testing/reset)
   */
  async clearDismissedAnnouncements(userId: string): Promise<void> {
    try {
      const prefsSnapshot = await getDocs(
        collection(db, this.USERS_COLLECTION, userId, this.PREFERENCES_SUBCOLLECTION)
      );

      const deletePromises = prefsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing dismissed announcements:', error);
      throw new Error('Failed to clear dismissed announcements');
    }
  }

  /**
   * Get announcement statistics
   */
  async getAnnouncementStats(): Promise<{
    total: number;
    active: number;
    scheduled: number;
    expired: number;
    current: number;
  }> {
    try {
      const announcements = await this.getAnnouncements();
      const now = new Date();

      return {
        total: announcements.length,
        active: announcements.filter(a => a.isActive).length,
        scheduled: announcements.filter(a => a.startDate > now).length,
        expired: announcements.filter(a => a.endDate < now).length,
        current: announcements.filter(
          a => a.isActive && a.startDate <= now && a.endDate >= now
        ).length
      };
    } catch (error) {
      console.error('Error fetching announcement stats:', error);
      return {
        total: 0,
        active: 0,
        scheduled: 0,
        expired: 0,
        current: 0
      };
    }
  }

  /**
   * Get specific announcement by ID
   */
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    try {
      const docSnap = await getDoc(doc(db, this.COLLECTION, id));
      
      if (docSnap.exists()) {
        return this.docToAnnouncement(docSnap.id, docSnap.data() as AnnouncementDoc);
      }
      return null;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw new Error('Failed to fetch announcement');
    }
  }
}

// Export singleton instance
export const announcementService = new AnnouncementService();

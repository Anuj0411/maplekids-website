// Announcement Service for managing flash announcements
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
}

export interface UserPreferences {
  userId: string;
  dismissedAnnouncements: string[];
  lastSeen: Date;
}

class AnnouncementService {
  private readonly ANNOUNCEMENTS_KEY = 'announcements';
  private readonly USER_PREFERENCES_KEY = 'userAnnouncementPreferences';

  // Get all announcements
  getAnnouncements(): Announcement[] {
    try {
      const announcements = localStorage.getItem(this.ANNOUNCEMENTS_KEY);
      if (announcements) {
        const parsed = JSON.parse(announcements).map((ann: any) => {
          // Migrate old announcements to new format
          const migratedAnn = {
            ...ann,
            startDate: new Date(ann.startDate),
            endDate: new Date(ann.endDate),
            createdAt: new Date(ann.createdAt),
            // Handle migration from old format
            mediaUrl: ann.mediaUrl || ann.imageUrl || '',
            mediaType: ann.mediaType || 'image'
          };
          return migratedAnn;
        });
        
        // Save migrated announcements back to localStorage
        localStorage.setItem(this.ANNOUNCEMENTS_KEY, JSON.stringify(parsed));
        return parsed;
      }
      return [];
    } catch (error) {
      console.error('Error loading announcements:', error);
      return [];
    }
  }

  // Get active announcements that should be shown to user
  getActiveAnnouncements(): Announcement[] {
    const now = new Date();
    const announcements = this.getAnnouncements();
    
    return announcements.filter(announcement => 
      announcement.isActive && 
      announcement.startDate <= now && 
      announcement.endDate >= now
    );
  }

  // Get announcements that user hasn't dismissed
  getUnseenAnnouncements(): Announcement[] {
    const activeAnnouncements = this.getActiveAnnouncements();
    const userPrefs = this.getUserPreferences();
    
    return activeAnnouncements.filter(announcement => 
      !userPrefs.dismissedAnnouncements.includes(announcement.id)
    );
  }

  // Save announcements
  saveAnnouncements(announcements: Announcement[]): void {
    try {
      localStorage.setItem(this.ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    } catch (error) {
      console.error('Error saving announcements:', error);
    }
  }

  // Add new announcement
  addAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): string {
    const announcements = this.getAnnouncements();
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const updatedAnnouncements = [...announcements, newAnnouncement];
    this.saveAnnouncements(updatedAnnouncements);
    return newAnnouncement.id;
  }

  // Update announcement
  updateAnnouncement(id: string, updates: Partial<Announcement>): boolean {
    const announcements = this.getAnnouncements();
    const index = announcements.findIndex(a => a.id === id);
    
    if (index !== -1) {
      announcements[index] = { ...announcements[index], ...updates };
      this.saveAnnouncements(announcements);
      return true;
    }
    return false;
  }

  // Delete announcement
  deleteAnnouncement(id: string): boolean {
    const announcements = this.getAnnouncements();
    const filtered = announcements.filter(a => a.id !== id);
    
    if (filtered.length !== announcements.length) {
      this.saveAnnouncements(filtered);
      return true;
    }
    return false;
  }

  // Get user preferences
  getUserPreferences(): UserPreferences {
    try {
      const prefs = localStorage.getItem(this.USER_PREFERENCES_KEY);
      if (prefs) {
        const parsed = JSON.parse(prefs);
        return {
          ...parsed,
          lastSeen: new Date(parsed.lastSeen)
        };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
    
    return {
      userId: 'anonymous',
      dismissedAnnouncements: [],
      lastSeen: new Date()
    };
  }

  // Save user preferences
  saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  // Mark announcement as dismissed
  dismissAnnouncement(announcementId: string): void {
    const prefs = this.getUserPreferences();
    if (!prefs.dismissedAnnouncements.includes(announcementId)) {
      prefs.dismissedAnnouncements.push(announcementId);
      prefs.lastSeen = new Date();
      this.saveUserPreferences(prefs);
    }
  }

  // Clear all dismissed announcements (useful for testing)
  clearDismissedAnnouncements(): void {
    const prefs = this.getUserPreferences();
    prefs.dismissedAnnouncements = [];
    prefs.lastSeen = new Date();
    this.saveUserPreferences(prefs);
  }

  // Get announcement statistics
  getAnnouncementStats() {
    const announcements = this.getAnnouncements();
    const now = new Date();
    
    return {
      total: announcements.length,
      active: announcements.filter(a => a.isActive).length,
      scheduled: announcements.filter(a => a.startDate > now).length,
      expired: announcements.filter(a => a.endDate < now).length,
      current: announcements.filter(a => a.isActive && a.startDate <= now && a.endDate >= now).length
    };
  }

  // Clear all announcements (useful for testing or reset)
  clearAllAnnouncements(): void {
    localStorage.removeItem(this.ANNOUNCEMENTS_KEY);
    localStorage.removeItem(this.USER_PREFERENCES_KEY);
  }

  // Force migration of old data
  migrateOldData(): void {
    const announcements = localStorage.getItem(this.ANNOUNCEMENTS_KEY);
    if (announcements) {
      try {
        const parsed = JSON.parse(announcements);
        const migrated = parsed.map((ann: any) => ({
          ...ann,
          startDate: new Date(ann.startDate),
          endDate: new Date(ann.endDate),
          createdAt: new Date(ann.createdAt),
          mediaUrl: ann.mediaUrl || ann.imageUrl || '',
          mediaType: ann.mediaType || 'image'
        }));
        localStorage.setItem(this.ANNOUNCEMENTS_KEY, JSON.stringify(migrated));
        console.log('Data migration completed successfully');
      } catch (error) {
        console.error('Error during migration:', error);
      }
    }
  }
}

export const announcementService = new AnnouncementService();

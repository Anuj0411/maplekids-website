import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { announcementService, type Announcement } from '@/firebase/services/announcement.service';
import { useAuth } from '@/hooks/auth';

interface AnnouncementContextType {
  announcements: Announcement[];
  loading: boolean;
  announcementDismissed: boolean;
  handleAnnouncementDismiss: (announcementId: string) => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

interface AnnouncementProviderProps {
  children: ReactNode;
}

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const { user } = useAuth();

  // Subscribe to active announcements in real-time
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setAnnouncementDismissed(true); // Allow language popup if not logged in
      return;
    }

    const unsubscribe = announcementService.subscribeToActiveAnnouncements(
      async (activeAnnouncements) => {
        try {
          // Filter out dismissed announcements for this user
          const dismissedIds = await announcementService.getUserPreferences(user.uid);
          const unseenAnnouncements = activeAnnouncements.filter(
            ann => !dismissedIds.includes(ann.id)
          );
          
          setAnnouncements(unseenAnnouncements);
          setLoading(false);
          
          // If no unseen announcements, allow language popup
          if (unseenAnnouncements.length === 0) {
            setAnnouncementDismissed(true);
          }
        } catch (error) {
          console.error('Error loading announcements:', error);
          setAnnouncements(activeAnnouncements);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error subscribing to announcements:', error);
        setLoading(false);
        setAnnouncementDismissed(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleAnnouncementDismiss = async (announcementId: string) => {
    if (!user) return;

    try {
      await announcementService.dismissAnnouncement(user.uid, announcementId);
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
      
      // Allow language timer to start after announcement is dismissed
      setAnnouncementDismissed(true);
    } catch (error) {
      console.error('Error dismissing announcement:', error);
      // Still update UI even if Firebase update fails
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
      setAnnouncementDismissed(true);
    }
  };

  return (
    <AnnouncementContext.Provider value={{
      announcements,
      loading,
      announcementDismissed,
      handleAnnouncementDismiss
    }}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  return context;
};

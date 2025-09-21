import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { announcementService, Announcement } from '../services/announcementService';

interface AnnouncementContextType {
  announcements: Announcement[];
  announcementDismissed: boolean;
  handleAnnouncementDismiss: (announcementId: string) => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

interface AnnouncementProviderProps {
  children: ReactNode;
}

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    const loadAnnouncements = () => {
      const activeAnnouncements = announcementService.getActiveAnnouncements();
      setAnnouncements(activeAnnouncements);
      
      // If no active announcements, allow language timer to start immediately
      if (activeAnnouncements.length === 0) {
        setAnnouncementDismissed(true);
      }
    };

    loadAnnouncements();
  }, []);

  const handleAnnouncementDismiss = (announcementId: string) => {
    announcementService.dismissAnnouncement(announcementId);
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
    
    // Allow language timer to start after announcement is dismissed
    setAnnouncementDismissed(true);
  };

  return (
    <AnnouncementContext.Provider value={{
      announcements,
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

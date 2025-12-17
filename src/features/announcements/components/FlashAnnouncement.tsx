import React, { useState, useEffect, useCallback } from 'react';
import './FlashAnnouncement.css';

interface Announcement {
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

interface FlashAnnouncementProps {
  announcements: Announcement[];
  onDismiss: (announcementId: string) => void;
}

const FlashAnnouncement: React.FC<FlashAnnouncementProps> = ({ announcements, onDismiss }) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      if (currentAnnouncement) {
        onDismiss(currentAnnouncement.id);
        setIsVisible(false);
        setCurrentAnnouncement(null);
      }
    }, 300); // Match animation duration
  }, [currentAnnouncement, onDismiss]);

  useEffect(() => {
    // Find the first active announcement that should be shown
    const now = new Date();
    const activeAnnouncement = announcements.find(announcement => 
      announcement.isActive && 
      announcement.startDate <= now && 
      announcement.endDate >= now
    );

    if (activeAnnouncement) {
      setCurrentAnnouncement(activeAnnouncement);
      setIsVisible(true);
      setIsAnimating(true);

      // Auto-dismiss after display duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, activeAnnouncement.displayDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [announcements, handleDismiss]);

  // Auto-delete expired announcements
  useEffect(() => {
    const now = new Date();
    const expiredAnnouncements = announcements.filter(announcement => 
      announcement.endDate < now
    );
    
    if (expiredAnnouncements.length > 0) {
      // Remove expired announcements from storage
      const validAnnouncements = announcements.filter(announcement => 
        announcement.endDate >= now
      );
      localStorage.setItem('announcements', JSON.stringify(validAnnouncements));
    }
  }, [announcements]);

  if (!isVisible || !currentAnnouncement) {
    return null;
  }

  return (
    <div className={`flash-announcement-overlay ${isAnimating ? 'show' : 'hide'}`}>
      <div className="flash-announcement-container">
        <div className="flash-announcement-content">
          <div className="announcement-media">
            {(currentAnnouncement.mediaType || 'image') === 'video' ? (
              <video 
                src={currentAnnouncement.mediaUrl}
                className="announcement-video"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img 
                src={currentAnnouncement.mediaUrl} 
                alt="Announcement"
                className="announcement-img"
              />
            )}
          </div>
          
          <button 
            className="announcement-close-btn"
            onClick={handleDismiss}
            aria-label="Close announcement"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashAnnouncement;

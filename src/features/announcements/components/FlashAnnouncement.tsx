import React, { useState, useEffect, useCallback } from 'react';
import { announcementService, type Announcement } from '@/firebase/services/announcement.service';
import { useAuth } from '@/hooks/auth';
import './FlashAnnouncement.css';

interface FlashAnnouncementProps {
  onAnnouncementShown?: () => void;
  onAnnouncementDismissed?: () => void;
}

const FlashAnnouncement: React.FC<FlashAnnouncementProps> = ({ 
  onAnnouncementShown,
  onAnnouncementDismissed 
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Subscribe to active announcements in real-time
  useEffect(() => {
    const unsubscribe = announcementService.subscribeToActiveAnnouncements(
      async (activeAnnouncements) => {
        // Filter out dismissed announcements
        if (user) {
          try {
            const dismissedIds = await announcementService.getUserPreferences(user.uid);
            const unseenAnnouncements = activeAnnouncements.filter(
              ann => !dismissedIds.includes(ann.id)
            );
            setAnnouncements(unseenAnnouncements);
            setLoading(false);
          } catch (error) {
            console.error('Error filtering announcements:', error);
            setAnnouncements(activeAnnouncements);
            setLoading(false);
          }
        } else {
          // Anonymous users - localStorage
          const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
          const unseenAnnouncements = activeAnnouncements.filter(
            ann => !dismissedIds.includes(ann.id)
          );
          setAnnouncements(unseenAnnouncements);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error subscribing to announcements:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDismiss = useCallback(async () => {
    if (!currentAnnouncement) return;

    setIsVisible(false);
    setIsExpanded(false);
    
    try {
      // Save dismissal
      if (user) {
        await announcementService.dismissAnnouncement(user.uid, currentAnnouncement.id);
      } else {
        const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
        if (!dismissedIds.includes(currentAnnouncement.id)) {
          dismissedIds.push(currentAnnouncement.id);
          localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedIds));
        }
      }
      
      setTimeout(() => {
        setCurrentAnnouncement(null);
        setAnnouncements(prev => prev.filter(ann => ann.id !== currentAnnouncement.id));
        onAnnouncementDismissed?.();
      }, 300);
    } catch (error) {
      console.error('Error dismissing announcement:', error);
      setTimeout(() => {
        setCurrentAnnouncement(null);
        setAnnouncements(prev => prev.filter(ann => ann.id !== currentAnnouncement.id));
        onAnnouncementDismissed?.();
      }, 300);
    }
  }, [currentAnnouncement, user, onAnnouncementDismissed]);

  // Show the first unseen announcement
  useEffect(() => {
    if (loading || announcements.length === 0 || currentAnnouncement) {
      return;
    }

    const firstAnnouncement = announcements[0];
    setCurrentAnnouncement(firstAnnouncement);
    setIsVisible(true);
    
    onAnnouncementShown?.();

    // Auto-dismiss after display duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, firstAnnouncement.displayDuration * 1000);

    return () => clearTimeout(timer);
  }, [announcements, handleDismiss, currentAnnouncement, loading, onAnnouncementShown]);

  if (!isVisible || !currentAnnouncement) {
    return null;
  }

  return (
    <>
      {/* Toast Notification - Bottom Right */}
      <div className={`announcement-toast ${isVisible ? 'show' : ''} ${isExpanded ? 'expanded' : ''}`}>
        <div className="toast-header">
          <span className="toast-icon">🎉</span>
          <span className="toast-title">New Announcement</span>
          <button 
            className="toast-close-btn"
            onClick={handleDismiss}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <div className="toast-content" onClick={() => setIsExpanded(!isExpanded)}>
          {currentAnnouncement.mediaType === 'video' ? (
            <video 
              src={currentAnnouncement.mediaUrl}
              className={`toast-media ${isExpanded ? 'expanded' : ''}`}
              controls={isExpanded}
              autoPlay={isExpanded}
              muted
              loop
              playsInline
            />
          ) : (
            <img 
              src={currentAnnouncement.mediaUrl} 
              alt="Announcement"
              className={`toast-media ${isExpanded ? 'expanded' : ''}`}
            />
          )}
          <span className="toast-expand-hint">
            {isExpanded ? '▼ Click to collapse' : '▲ Click to view full'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="toast-progress-bar">
          <div 
            className="toast-progress-fill"
            style={{ 
              '--duration': `${currentAnnouncement.displayDuration}s` 
            } as React.CSSProperties}
          />
        </div>
      </div>
    </>
  );
};

export default FlashAnnouncement;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '@/hooks/data/useEvents';
import { usePhotos } from '@/hooks/data/usePhotos';
import './GuestDashboard.css';

const GuestDashboard: React.FC = () => {
  const { t } = useTranslation();
  
  // Use custom hooks for data fetching
  const { events, loading: eventsLoading } = useEvents();
  const { photos, loading: photosLoading } = usePhotos();
  
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Show loading state while either is loading
  const loading = eventsLoading || photosLoading;

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % displayPhotos.length);
  };

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  };

  // Limit the number of events and photos displayed
  const displayEvents = events.slice(0, 6); // Show only 6 events
  const displayPhotos = photos.slice(0, 8); // Show only 8 photos

  if (loading) {
    return (
      <div className="guest-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{t('dashboard.guest.title')}</h1>
          <p>{t('dashboard.guest.subtitle')}</p>
        </div>
        <div className="header-visual">
          <div className="floating-shapes">
            <div className="shape shape-1">🌟</div>
            <div className="shape shape-2">🎨</div>
            <div className="shape shape-3">📚</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{displayEvents.length}</h3>
              <p>{t('dashboard.guest.stats.totalEvents')}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🖼️</div>
            <div className="stat-content">
              <h3>{displayPhotos.length}</h3>
              <p>{t('dashboard.guest.stats.totalPhotos')}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏫</div>
            <div className="stat-content">
              <h3>Maplekids</h3>
              <p>{t('dashboard.guest.stats.schoolInfo')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="events-section">
        <div className="section-header">
          <h2>📅 {t('home.events.title')}</h2>
          <p>{t('home.events.subtitle')}</p>
        </div>
        
        <div className="events-grid">
          {displayEvents.map((event, index) => (
            <div key={event.id || index} className="event-card">
              <div className="event-icon">🎉</div>
              <div className="event-content">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-meta">
                  <span className="event-date">📅 {event.date}</span>
                  <span className="event-location">📍 {event.location}</span>
                  <span className="event-time">⏰ {event.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="gallery-section">
        <div className="section-header">
          <h2>🖼️ {t('home.gallery.title')}</h2>
          <p>{t('home.gallery.subtitle')}</p>
        </div>
        
        <div className="gallery-container">
          <div className="main-photo">
            {displayPhotos.length > 0 && (
              <img 
                src={displayPhotos[activePhotoIndex]?.imageUrl} 
                alt="School"
                className="main-photo-img"
              />
            )}
            <div className="photo-navigation">
              <button onClick={prevPhoto} className="nav-btn prev-btn">‹</button>
              <button onClick={nextPhoto} className="nav-btn next-btn">›</button>
            </div>
          </div>
          
          <div className="photo-thumbnails">
            {displayPhotos.map((photo, index) => (
              <div 
                key={photo.id || index}
                className={`thumbnail ${index === activePhotoIndex ? 'active' : ''}`}
                onClick={() => setActivePhotoIndex(index)}
              >
                <img src={photo.imageUrl} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>🚀 {t('home.cta.title')}</h2>
          <p>{t('home.cta.description')}</p>
          <div className="cta-features">
            <span>🎯 {t('home.cta.features.trial')}</span>
            <span>⏰ {t('home.cta.features.timing')}</span>
            <span>👥 {t('home.cta.features.size')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;

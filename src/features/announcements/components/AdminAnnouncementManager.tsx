import React, { useState, useEffect } from 'react';
import { announcementService, type Announcement } from '@/firebase/services/announcement.service';
import { useCurrentUser } from '@/hooks/auth';
import './AdminAnnouncementManager.css';

interface AdminAnnouncementManagerProps {
  onAnnouncementChange: (announcements: Announcement[]) => void;
}

const AdminAnnouncementManager: React.FC<AdminAnnouncementManagerProps> = ({ onAnnouncementChange }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { userData } = useCurrentUser();
  
  // Helper function to get default form data with current date/time
  const getDefaultFormData = () => ({
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video',
    isActive: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: 10
  });
  
  const [formData, setFormData] = useState(getDefaultFormData());
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Subscribe to announcements in real-time
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = announcementService.subscribeToAnnouncements(
      (fetchedAnnouncements) => {
        setAnnouncements(fetchedAnnouncements);
        onAnnouncementChange(fetchedAnnouncements);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading announcements:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [onAnnouncementChange]);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Determine media type
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) {
        alert('Please upload an image or video file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ 
          ...prev, 
          mediaUrl: result,
          mediaType: isVideo ? 'video' : 'image'
        }));
        setMediaPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mediaUrl) {
      alert('Please upload an image or video');
      return;
    }

    if (!userData?.id) {
      alert('You must be logged in to manage announcements');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing announcement
        await announcementService.updateAnnouncement(
          editingId,
          {
            mediaUrl: formData.mediaUrl,
            mediaType: formData.mediaType,
            isActive: formData.isActive,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            displayDuration: formData.displayDuration
          },
          userData.id
        );
      } else {
        // Create new announcement
        await announcementService.addAnnouncement({
          mediaUrl: formData.mediaUrl,
          mediaType: formData.mediaType,
          isActive: formData.isActive,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          displayDuration: formData.displayDuration,
          createdBy: userData.id
        });
      }

      resetForm();
    } catch (err) {
      console.error('Error saving announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
      alert('Failed to save announcement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setMediaPreview(null);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      mediaUrl: announcement.mediaUrl,
      mediaType: announcement.mediaType,
      isActive: announcement.isActive,
      startDate: announcement.startDate.toISOString().slice(0, 16),
      endDate: announcement.endDate.toISOString().slice(0, 16),
      displayDuration: announcement.displayDuration
    });
    setMediaPreview(announcement.mediaUrl);
    setEditingId(announcement.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setSaving(true);
      try {
        await announcementService.deleteAnnouncement(id);
      } catch (err) {
        console.error('Error deleting announcement:', err);
        alert('Failed to delete announcement. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleActive = async (id: string) => {
    if (!userData?.id) {
      alert('You must be logged in');
      return;
    }

    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return;

    setSaving(true);
    try {
      await announcementService.updateAnnouncement(
        id,
        { isActive: !announcement.isActive },
        userData.id
      );
    } catch (err) {
      console.error('Error toggling announcement:', err);
      alert('Failed to update announcement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-announcement-manager">
      {error && (
        <div className="error-message" style={{
          padding: '10px',
          background: '#fee',
          color: '#c00',
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div className="announcement-header">
        <h2>📢 Flash Announcements</h2>
        <button 
          className="create-announcement-btn"
          onClick={() => {
            // Reset form with current date/time when opening
            setFormData(getDefaultFormData());
            setMediaPreview(null);
            setIsCreating(true);
          }}
          disabled={saving || loading}
        >
          + Create New Announcement
        </button>
      </div>

      {isCreating && (
        <div className="announcement-form-container">
          <form onSubmit={handleSubmit} className="announcement-form">
            <div className="form-header">
              <h3>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
              <button type="button" onClick={resetForm} className="close-form-btn">✕</button>
            </div>

            <div className="form-group">
              <label>Media (Image or Video) *</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                required
              />
              {mediaPreview && (
                <div className="media-preview">
                  {formData.mediaType === 'video' ? (
                    <video 
                      src={mediaPreview} 
                      controls 
                      style={{ width: '100%', maxHeight: '200px' }}
                    />
                  ) : (
                    <img src={mediaPreview} alt="Preview" />
                  )}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Display Duration (seconds)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={formData.displayDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayDuration: parseInt(e.target.value) }))}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={resetForm} 
                className="cancel-btn"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={saving}
              >
                {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')} Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="announcements-list">
        {loading ? (
          <div className="loading-message" style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="no-announcements">
            <p>No announcements created yet.</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div key={announcement.id} className={`announcement-card ${announcement.isActive ? 'active' : 'inactive'}`}>
              <div className="announcement-preview">
                {announcement.mediaType === 'video' ? (
                  <video 
                    src={announcement.mediaUrl} 
                    style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                    muted
                  />
                ) : (
                  <img src={announcement.mediaUrl} alt="Announcement" />
                )}
                <div className="announcement-info">
                  <div className="announcement-meta">
                    <span>Type: {(announcement.mediaType || 'image').toUpperCase()}</span>
                    <span>Start: {announcement.startDate.toLocaleString()}</span>
                    <span>End: {announcement.endDate.toLocaleString()}</span>
                    <span>Duration: {announcement.displayDuration}s</span>
                  </div>
                </div>
              </div>
              
              <div className="announcement-actions">
                <button
                  className={`toggle-btn ${announcement.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => toggleActive(announcement.id)}
                  disabled={saving}
                >
                  {announcement.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(announcement)}
                  disabled={saving}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(announcement.id)}
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncementManager;

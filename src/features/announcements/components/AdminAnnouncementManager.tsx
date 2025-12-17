import React, { useState, useEffect } from 'react';
import './AdminAnnouncementManager.css';

interface Announcement {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  displayDuration: number;
  createdAt: Date;
  createdBy: string;
}

interface AdminAnnouncementManagerProps {
  onAnnouncementChange: (announcements: Announcement[]) => void;
}

const AdminAnnouncementManager: React.FC<AdminAnnouncementManagerProps> = ({ onAnnouncementChange }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video',
    isActive: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: 10
  });
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  useEffect(() => {
    // Load announcements from localStorage (in real app, this would be from Firebase)
    const savedAnnouncements = localStorage.getItem('announcements');
    if (savedAnnouncements) {
      const parsed = JSON.parse(savedAnnouncements).map((ann: any) => {
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
      setAnnouncements(parsed);
      onAnnouncementChange(parsed);
      
      // Save migrated announcements back to localStorage
      localStorage.setItem('announcements', JSON.stringify(parsed));
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mediaUrl) {
      alert('Please upload an image or video');
      return;
    }

    const newAnnouncement: Announcement = {
      id: editingId || Date.now().toString(),
      mediaUrl: formData.mediaUrl,
      mediaType: formData.mediaType,
      isActive: formData.isActive,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      displayDuration: formData.displayDuration,
      createdAt: editingId ? announcements.find(a => a.id === editingId)?.createdAt || new Date() : new Date(),
      createdBy: 'admin' // In real app, get from auth context
    };

    let updatedAnnouncements;
    if (editingId) {
      updatedAnnouncements = announcements.map(a => a.id === editingId ? newAnnouncement : a);
    } else {
      updatedAnnouncements = [...announcements, newAnnouncement];
    }

    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    onAnnouncementChange(updatedAnnouncements);
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      mediaUrl: '',
      mediaType: 'image',
      isActive: true,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      displayDuration: 10
    });
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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      const updatedAnnouncements = announcements.filter(a => a.id !== id);
      setAnnouncements(updatedAnnouncements);
      localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
      onAnnouncementChange(updatedAnnouncements);
    }
  };

  const toggleActive = (id: string) => {
    const updatedAnnouncements = announcements.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    onAnnouncementChange(updatedAnnouncements);
  };

  return (
    <div className="admin-announcement-manager">
      <div className="announcement-header">
        <h2>📢 Flash Announcements</h2>
        <button 
          className="create-announcement-btn"
          onClick={() => setIsCreating(true)}
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
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingId ? 'Update' : 'Create'} Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="announcements-list">
        {announcements.length === 0 ? (
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
                >
                  {announcement.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(announcement)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(announcement.id)}
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

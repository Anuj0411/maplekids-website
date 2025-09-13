import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Forms.css';
import { FormField, Button } from '../common';
import { eventService } from '../../firebase/services';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isActive: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
}

const EditEventForm: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setErrorMessage('Event ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const events = await eventService.getAllEvents();
        const event = events.find(e => e.id === eventId);
        
        if (event) {
          setFormData({
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            isActive: event.isActive
          });
        } else {
          setErrorMessage('Event not found');
        }
      } catch (error) {
        console.error('Error loading event:', error);
        setErrorMessage('Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Event title must be at least 3 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Event description must be at least 10 characters long';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Event time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      await eventService.updateEvent(eventId, {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        isActive: formData.isActive
      });

      setSuccessMessage(`Event "${formData.title}" updated successfully.`);
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error updating event:', error);
      setErrorMessage('Failed to update event. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  if (isLoading) {
    return (
      <div className="form-container">
        <div className="form-card">
          <div className="loading-message">Loading event data...</div>
        </div>
      </div>
    );
  }

  if (errorMessage && !formData.title) {
    return (
      <div className="form-container">
        <div className="form-card">
          <div className="error-message">{errorMessage}</div>
          <Button variant="secondary" onClick={handleCancel}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>✏️ Edit Event</h1>
          <p>Update event information for: <strong>{formData.title}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <div className="form-section">
            <h3>📝 Event Details</h3>
            
            <FormField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter event title"
              error={errors.title}
              required
            />

            <FormField
              label="Event Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              as="textarea"
              placeholder="Describe the event details, activities, and what participants can expect"
              rows={4}
              error={errors.description}
              required
            />
            <small className="help-text">Minimum 10 characters</small>
          </div>

          <div className="form-section">
            <h3>📅 Event Schedule</h3>
            
            <div className="form-row">
              <FormField
                label="Event Date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                error={errors.date}
                required
              />

              <FormField
                label="Event Time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                type="time"
                error={errors.time}
                required
              />
            </div>

            <FormField
              label="Event Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              type="text"
              placeholder="e.g., School Auditorium, Playground, Classroom 1A"
              error={errors.location}
              required
            />
          </div>

          <div className="form-section">
            <h3>⚙️ Event Settings</h3>
            
            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Make this event active and visible on the home page
              </label>
              <small className="help-text">
                Active events will be displayed as a banner on the school's home page
              </small>
            </div>
          </div>

          <div className="form-summary">
            <h3>📋 Event Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Title:</span>
                <span className="summary-value">{formData.title || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">
                  {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Time:</span>
                <span className="summary-value">{formData.time || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Location:</span>
                <span className="summary-value">{formData.location || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Status:</span>
                <span className="summary-value">
                  {formData.isActive ? '🟢 Active' : '🔴 Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Updating Event...' : 'Update Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventForm;

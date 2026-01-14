import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '@/styles/Forms.css';
import { FormField, Button } from '@/components/common';
import { useEvents } from '@/hooks/data/useEvents';
import { useForm } from '@/hooks/form/useForm';
import { useFormValidation } from '@/hooks/form/useFormValidation';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isActive: boolean;
}

const EditEventForm: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events, updateEvent, loading } = useEvents();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Custom validator for future dates
  const validateFutureDate = (dateValue: string): string | undefined => {
    if (!dateValue) return 'Event date is required';
    const selectedDate = new Date(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return 'Event date cannot be in the past';
    }
    return undefined;
  };

  const validation = useFormValidation();

  const { values, errors, handleChange, setFieldValue, handleSubmit, isSubmitting } = useForm<EventFormData>({
    initialValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      isActive: true
    },
    validate: (values) => ({
      title: validation.rules.required('Event title is required')(values.title) ||
             validation.rules.minLength(3, 'Event title must be at least 3 characters long')(values.title),
      description: validation.rules.required('Event description is required')(values.description) ||
                  validation.rules.minLength(10, 'Event description must be at least 10 characters long')(values.description),
      date: validateFutureDate(values.date),
      time: validation.rules.required('Event time is required')(values.time),
      location: validation.rules.required('Event location is required')(values.location),
    }),
    onSubmit: async (values) => {
      try {
        if (!eventId) {
          throw new Error('Event ID is required');
        }

        await updateEvent(eventId, {
          title: values.title,
          description: values.description,
          date: values.date,
          time: values.time,
          location: values.location,
          isActive: values.isActive
        });

        setSuccessMessage(`Event "${values.title}" updated successfully.`);
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error updating event:', error);
        setErrorMessage('Failed to update event. Please try again.');
        setTimeout(() => setErrorMessage(''), 5000);
        throw error;
      }
    }
  });

  // Load event data from hook when available
  useEffect(() => {
    if (!eventId) {
      setErrorMessage('Event ID is required');
      return;
    }

    if (events.length === 0) return;

    const event = events.find(e => e.id === eventId);
    
    if (event) {
      // Use setFieldValue to populate form
      setFieldValue('title', event.title);
      setFieldValue('description', event.description);
      setFieldValue('date', event.date);
      setFieldValue('time', event.time);
      setFieldValue('location', event.location);
      setFieldValue('isActive', event.isActive);
    } else {
      setErrorMessage('Event not found');
    }
  }, [eventId, events, setFieldValue]);

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  if (loading) {
    return (
      <div className="form-container">
        <div className="form-card">
          <div className="loading-message">Loading event data...</div>
        </div>
      </div>
    );
  }

  if (errorMessage && !values.title) {
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
          <p>Update event information for: <strong>{values.title}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <div className="form-section">
            <h3>📝 Event Details</h3>
            
            <FormField
              label="Event Title"
              name="title"
              value={values.title}
              onChange={handleChange}
              type="text"
              placeholder="Enter event title"
              error={errors.title}
              required
            />

            <FormField
              label="Event Description"
              name="description"
              value={values.description}
              onChange={handleChange}
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
                value={values.date}
                onChange={handleChange}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                error={errors.date}
                required
              />

              <FormField
                label="Event Time"
                name="time"
                value={values.time}
                onChange={handleChange}
                type="time"
                error={errors.time}
                required
              />
            </div>

            <FormField
              label="Event Location"
              name="location"
              value={values.location}
              onChange={handleChange}
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
                  checked={values.isActive}
                  onChange={handleChange}
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
                <span className="summary-value">{values.title || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">
                  {values.date ? new Date(values.date).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Time:</span>
                <span className="summary-value">{values.time || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Location:</span>
                <span className="summary-value">{values.location || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Status:</span>
                <span className="summary-value">
                  {values.isActive ? '🟢 Active' : '🔴 Inactive'}
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

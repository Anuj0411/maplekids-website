import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/Forms.css';
import { FormField, Button } from '@/components/common';
import { eventService } from '@/firebase/services';
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

const AddEventForm: React.FC = () => {
  const navigate = useNavigate();
  const validation = useFormValidation();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  // Custom date validator to check if date is not in the past
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

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm<EventFormData>({
    initialValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      isActive: true
    },
    validate: (values) => ({
      title: validation.composeValidators(
        validation.rules.required('Event title is required'),
        validation.rules.minLength(3, 'Event title must be at least 3 characters long')
      )(values.title),
      description: validation.composeValidators(
        validation.rules.required('Event description is required'),
        validation.rules.minLength(10, 'Event description must be at least 10 characters long')
      )(values.description),
      date: validateFutureDate(values.date),
      time: validation.rules.required('Event time is required')(values.time),
      location: validation.rules.required('Event location is required')(values.location),
    }),
    onSubmit: async (values) => {
      try {
        console.log('Creating event with data:', values);
        
        // Save to Firebase using eventService
        const createdEvent = await eventService.addEvent({
          title: values.title,
          description: values.description,
          date: values.date,
          time: values.time,
          location: values.location,
          isActive: values.isActive
        });

        console.log('Event created successfully:', createdEvent);
        setSubmitSuccess(true);
        setGeneralError('');
        
        // Redirect back to admin dashboard after 3 seconds
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 3000);

      } catch (error: any) {
        console.error('Error creating event:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to create event. Please try again.';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'Permission denied. Please make sure you are logged in as an admin.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setGeneralError(errorMessage);
      }
    }
  });

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>🎉 Create New Event</h1>
          <p>Add a new event to the school calendar</p>
        </div>

        {!submitSuccess ? (
          <form onSubmit={handleSubmit} className="form">
            {generalError && (
              <div className="form-error-message" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
                {generalError}
              </div>
            )}
            
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
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="form-success">
            <div className="success-content">
              <div className="success-icon">🎉</div>
              <h2>Event Created Successfully!</h2>
              <p>Your new event has been added to the school calendar.</p>
              
              <div className="success-details">
                <h4>Event Details:</h4>
                <p><strong>Title:</strong> {values.title}</p>
                <p><strong>Date:</strong> {new Date(values.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {values.time}</p>
                <p><strong>Location:</strong> {values.location}</p>
                <p><strong>Status:</strong> {values.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              
              <div className="redirect-message">
                <p>Redirecting back to Admin Dashboard...</p>
                <div className="redirect-spinner"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEventForm;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Forms.css';
import { photoService } from '../firebase/services';

interface PhotoFormData {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddPhotoForm: React.FC = () => {
  const [formData, setFormData] = useState<PhotoFormData>({
    title: '',
    description: '',
    category: '',
    imageUrl: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const photoCategories = [
    'School Events',
    'Student Activities',
    'Classroom',
    'Sports',
    'Arts & Crafts',
    'Field Trips',
    'Celebrations',
    'Infrastructure',
    'Staff',
    'Other'
  ];

  const initialFormData = {
    title: '',
    description: '',
    category: '',
    imageUrl: ''
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Photo title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert('Image size should be less than 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreview(result);
          setFormData(prev => ({ ...prev, imageUrl: result }));
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload an image file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Firebase instead of localStorage
      await photoService.addPhoto({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        imageUrl: formData.imageUrl
      });

      setSuccessMessage('Photo added successfully!');
      setFormData(initialFormData);
      setImagePreview('');
      
      // Clear success message after 3 seconds and redirect
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/admin-dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error adding photo:', error);
      setErrorMessage('Failed to add photo. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  if (submitSuccess) {
    return (
      <div className="form-success">
        <div className="success-content">
          <div className="success-icon">📸</div>
          <h2>Photo Uploaded Successfully!</h2>
          <p>New photo "{formData.title}" has been added to the gallery.</p>
          <div className="success-details">
            <span>🏷️ Category: {formData.category}</span>
            <span>📝 Description: {formData.description}</span>
            <span>📅 Uploaded: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="success-preview">
            <img src={formData.imageUrl} alt={formData.title} />
          </div>
          <p className="redirect-message">Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>📸 Add Photo to Gallery</h1>
          <p>Upload and organize photos for the school gallery</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h3>📝 Photo Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Photo Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'error' : ''}
                  placeholder="Enter a descriptive title"
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select Category</option>
                  {photoCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? 'error' : ''}
                placeholder="Describe the photo content, event, or activity"
                rows={3}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>🖼️ Photo Upload</h3>
            <div className="photo-upload-container">
              <div 
                className={`drag-drop-area ${dragActive ? 'drag-active' : ''} ${imagePreview ? 'has-image' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <div className="image-overlay">
                      <button
                        type="button"
                        className="change-image-btn"
                        onClick={() => document.getElementById('imageInput')?.click()}
                      >
                        📁 Change Image
                      </button>
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <div className="upload-icon">📁</div>
                    <h4>Drag & Drop Image Here</h4>
                    <p>or</p>
                    <label htmlFor="imageInput" className="upload-btn">
                      Choose File
                    </label>
                    <p className="upload-hint">
                      Supported formats: JPG, PNG, GIF<br />
                      Maximum size: 5MB
                    </p>
                  </div>
                )}
                
                <input
                  type="file"
                  id="imageInput"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-input"
                />
              </div>
              
              {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
            </div>
          </div>

          <div className="form-summary">
            <h3>📋 Photo Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Title:</span>
                <span className="summary-value">{formData.title || 'Not entered'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Category:</span>
                <span className="summary-value">{formData.category || 'Not selected'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Description:</span>
                <span className="summary-value description">
                  {formData.description || 'Not entered'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Image:</span>
                <span className="summary-value">
                  {imagePreview ? '✅ Selected' : '❌ Not selected'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Uploading Photo...
                </>
              ) : (
                'Upload Photo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPhotoForm;

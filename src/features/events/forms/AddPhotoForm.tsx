
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/Forms.css';
import { usePhotos } from '@/hooks/data/usePhotos';
import { FormField, Button } from '@/components/common';

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
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();
  const { uploadPhotoWithMetadata } = usePhotos({ autoFetch: false });

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
      // Validate data URL format
      if (!formData.imageUrl.startsWith('data:image/')) {
        console.error('Invalid image data URL');
        alert('Invalid image selected. Please choose a valid image file.');
        return;
      }

      // Derive filename from MIME type
      const mimeMatch = formData.imageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
      const mimeType = mimeMatch?.[1] || 'image/jpeg';
      const extension = mimeType.split('/')[1] || 'jpg';
      const filename = `photo_${Date.now()}.${extension}`;

      // Convert data URL to File using direct base64 method
      const file = (() => {
        try {
          const arr = formData.imageUrl.split(',');
          if (arr.length !== 2) {
            throw new Error('Invalid data URL format');
          }
          
          const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType;
          const base64Data = arr[1];
          
          if (!base64Data || base64Data.length === 0) {
            throw new Error('Empty base64 data');
          }
          
          // Use a more robust base64 conversion
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          return new File([bytes], filename, { type: mime });
        } catch (error: any) {
          console.error('Error converting data URL to File:', error);
          throw new Error(`Failed to convert image: ${error.message || 'Unknown error'}`);
        }
      })();

      console.log('File created successfully:', { name: file.name, type: file.type, size: file.size });
      console.log('Uploading file to Firebase Storage...', { name: file.name, type: file.type, size: file.size });

      // Upload the image and save metadata to Firestore using hook
      try {
        await uploadPhotoWithMetadata(file, {
          title: formData.title,
          description: formData.description,
          category: formData.category
        });
        console.log('Photo uploaded and saved successfully.');
        
        setFormData(initialFormData);
        setImagePreview('');
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 800);
      } catch (uploadError: any) {
        console.error('Firebase upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message || 'Unknown upload error'}`);
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  // ...existing code...

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
              <FormField
                label="Photo Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter a descriptive title"
                error={errors.title}
                className={errors.title ? 'error' : ''}
              />
              <FormField
                label="Category *"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                as="select"
                options={[{ value: '', label: 'Select Category' }, ...photoCategories.map(cat => ({ value: cat, label: cat }))]}
                error={errors.category}
                className={errors.category ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <FormField
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                as="textarea"
                placeholder="Describe the photo content, event, or activity"
                rows={3}
                error={errors.description}
                className={errors.description ? 'error' : ''}
              />
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
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Uploading Photo...
                </>
              ) : (
                'Upload Photo'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPhotoForm;

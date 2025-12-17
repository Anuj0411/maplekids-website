import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../../styles/Forms.css';
import { FormField, Button } from '../../../components/common';
import { studentService, photoService } from '../../../firebase/services';

interface StudentFormData {
  firstName: string;
  lastName: string;
  class: 'play' | 'nursery' | 'lkg' | 'ukg' | '1st';
  age: number;
  parentName: string;
  parentPhone: string;
  address: string;
  admissionDate: string;
  photo?: string;
  rollNumber?: string;
}

interface FormErrors {
  [key: string]: string;
}

const EditStudentForm: React.FC = () => {
  const { rollNumber } = useParams<{ rollNumber: string }>();
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    class: 'play',
    age: 3,
    parentName: '',
    parentPhone: '',
    address: '',
    admissionDate: new Date().toISOString().split('T')[0],
    photo: '',
    rollNumber: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadStudent = async () => {
      if (!rollNumber) {
        setErrorMessage('Roll number is required');
        setIsLoading(false);
        return;
      }

      try {
        const student = await studentService.getStudentByRollNumber(rollNumber);
        if (student) {
          setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            class: student.class,
            age: student.age,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
            address: student.address,
            admissionDate: student.admissionDate,
            photo: student.photo || '',
            rollNumber: student.rollNumber
          });
          if (student.photo) {
            setPhotoPreview(student.photo);
          }
        } else {
          setErrorMessage('Student not found');
        }
      } catch (error) {
        console.error('Error loading student:', error);
        setErrorMessage('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudent();
  }, [rollNumber]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.age < 2 || formData.age > 8) {
      newErrors.age = 'Age must be between 2 and 8 years';
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Parent/Guardian name is required';
    }

    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.parentPhone.replace(/\D/g, ''))) {
      newErrors.parentPhone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    if (!formData.admissionDate) {
      newErrors.admissionDate = 'Admission date is required';
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!rollNumber) {
        throw new Error('Roll number is required');
      }

      let photoUrl = formData.photo;
      
      // If a new photo is selected (starts with data:), upload it to Firebase Storage
      if (formData.photo && formData.photo.startsWith('data:')) {
        const file = dataURLtoFile(formData.photo, 'student-photo.jpg');
        photoUrl = await photoService.uploadPhoto(file);
      }

      // Update student using roll number
      await studentService.updateStudentByRollNumber(rollNumber, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        class: formData.class,
        age: formData.age,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        address: formData.address,
        admissionDate: formData.admissionDate,
        photo: photoUrl
      });

      setSuccessMessage(`Student "${formData.firstName} ${formData.lastName}" updated successfully.`);
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error updating student:', error);
      setErrorMessage('Failed to update student. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  if (isLoading) {
    return (
      <div className="form-container">
        <div className="form-card">
          <div className="loading-message">Loading student data...</div>
        </div>
      </div>
    );
  }

  if (errorMessage && !formData.firstName) {
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
          <h1>✏️ Edit Student</h1>
          <p>Update student information for roll number: <strong>{rollNumber}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <div className="form-section">
            <h3>📝 Student Information</h3>
            <div className="form-row">
              <FormField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter first name"
                error={errors.firstName}
                required
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter last name"
                error={errors.lastName}
                required
              />
            </div>

            <div className="form-row">
              <FormField
                label="Class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                as="select"
                options={[
                  { value: 'play', label: 'Play Group' }, 
                  { value: 'nursery', label: 'Nursery' }, 
                  { value: 'lkg', label: 'LKG' }, 
                  { value: 'ukg', label: 'UKG' }, 
                  { value: '1st', label: '1st Standard' }
                ]}
                required
              />
              <FormField
                label="Age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                type="number"
                min="2"
                max="8"
                placeholder="Enter age"
                error={errors.age}
                required
              />
            </div>

            <div className="form-field">
              <FormField
                label="Admission Date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleInputChange}
                type="date"
                max={new Date().toISOString().split('T')[0]}
                error={errors.admissionDate}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>👨‍👩‍👧‍👦 Parent/Guardian Information</h3>
            <div className="form-row">
              <FormField
                label="Parent/Guardian Name"
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter parent/guardian name"
                error={errors.parentName}
                required
              />
              <FormField
                label="Phone Number"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                type="tel"
                placeholder="Enter 10-digit phone number"
                error={errors.parentPhone}
                required
              />
            </div>

            <div className="form-field">
              <FormField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                as="textarea"
                placeholder="Enter complete address"
                rows={3}
                error={errors.address}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>📸 Student Photo (Optional)</h3>
            <div className="photo-upload">
              <div className="photo-input">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="file-input"
                />
                <label htmlFor="photo" className="file-label">
                  <span className="upload-icon">📁</span>
                  Choose Photo
                </label>
              </div>
              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={() => {
                      setPhotoPreview('');
                      setFormData(prev => ({ ...prev, photo: '' }));
                    }}
                  >
                    ❌ Remove
                  </button>
                </div>
              )}
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
              {isSubmitting ? 'Updating Student...' : 'Update Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentForm;

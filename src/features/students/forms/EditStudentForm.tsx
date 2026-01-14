import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '@/styles/Forms.css';
import { FormField, Button } from '@/components/common';
import { studentService, photoService } from '@/firebase/services';
import { useForm } from '@/hooks/form';
import { useFormValidation } from '@/hooks/form/useFormValidation';

interface StudentFormData {
  firstName: string;
  lastName: string;
  class: 'play' | 'nursery' | 'lkg' | 'ukg' | '1st';
  age: number;
  parentName: string;
  parentPhone: string;
  address: string;
  admissionDate: string;
}

// Custom age validator
const validateAge = (ageValue: any): string | undefined => {
  const age = Number(ageValue);
  if (age < 2 || age > 8) {
    return 'Age must be between 2 and 8 years';
  }
  return undefined;
};

const EditStudentForm: React.FC = () => {
  const { rollNumber } = useParams<{ rollNumber: string }>();
  const validation = useFormValidation();
  
  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    handleSubmit: formHandleSubmit
  } = useForm<StudentFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      class: 'play',
      age: 3,
      parentName: '',
      parentPhone: '',
      address: '',
      admissionDate: new Date().toISOString().split('T')[0]
    },
    validate: (values) => ({
      firstName: validation.composeValidators(
        validation.rules.required('First name is required'),
        validation.rules.minLength(2, 'First name must be at least 2 characters')
      )(values.firstName),
      lastName: validation.composeValidators(
        validation.rules.required('Last name is required'),
        validation.rules.minLength(2, 'Last name must be at least 2 characters')
      )(values.lastName),
      age: validateAge(values.age),
      parentName: validation.rules.required('Parent/Guardian name is required')(values.parentName),
      parentPhone: validation.composeValidators(
        validation.rules.required('Phone number is required'),
        validation.rules.phone('Please enter a valid 10-digit phone number')
      )(values.parentPhone),
      address: validation.composeValidators(
        validation.rules.required('Address is required'),
        validation.rules.minLength(10, 'Address must be at least 10 characters')
      )(values.address),
      admissionDate: validation.rules.required('Admission date is required')(values.admissionDate)
    }),
    onSubmit: async (values) => {
      if (!rollNumber) {
        throw new Error('Roll number is required');
      }

      let photoUrl = photoData;
      
      // If a new photo is selected (starts with data:), upload it to Firebase Storage
      if (photoData && photoData.startsWith('data:')) {
        const file = dataURLtoFile(photoData, 'student-photo.jpg');
        photoUrl = await photoService.uploadPhoto(file);
      }

      // Update student using roll number
      await studentService.updateStudentByRollNumber(rollNumber, {
        ...values,
        photo: photoUrl
      });

      setSuccessMessage(`Student "${values.firstName} ${values.lastName}" updated successfully.`);
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoData, setPhotoData] = useState<string>('');
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
          // Load all form fields using setFieldValue
          setFieldValue('firstName', student.firstName);
          setFieldValue('lastName', student.lastName);
          setFieldValue('class', student.class);
          setFieldValue('age', student.age);
          setFieldValue('parentName', student.parentName);
          setFieldValue('parentPhone', student.parentPhone);
          setFieldValue('address', student.address);
          setFieldValue('admissionDate', student.admissionDate);
          
          if (student.photo) {
            setPhotoPreview(student.photo);
            setPhotoData(student.photo);
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
  }, [rollNumber, setFieldValue]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        setPhotoData(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await formHandleSubmit();
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

  if (errorMessage && !values.firstName) {
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
                value={values.firstName}
                onChange={handleChange}
                type="text"
                placeholder="Enter first name"
                error={errors.firstName}
                required
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
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
                value={values.class}
                onChange={handleChange}
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
                value={values.age}
                onChange={handleChange}
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
                value={values.admissionDate}
                onChange={handleChange}
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
                value={values.parentName}
                onChange={handleChange}
                type="text"
                placeholder="Enter parent/guardian name"
                error={errors.parentName}
                required
              />
              <FormField
                label="Phone Number"
                name="parentPhone"
                value={values.parentPhone}
                onChange={handleChange}
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
                value={values.address}
                onChange={handleChange}
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
                      setPhotoData('');
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

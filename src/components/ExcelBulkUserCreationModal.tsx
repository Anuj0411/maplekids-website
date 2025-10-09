import React, { useState, useRef } from 'react';
import { Button, Card, Modal } from './common';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './ExcelBulkUserCreationModal.css';

interface ExcelUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  class?: string;
  rollNumber?: string;
  age?: number;
  fatherName?: string;
  motherName?: string;
  admissionDate?: string;
  isValid: boolean;
  errors: string[];
  rowNumber: number;
}

interface ExcelBulkUserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersCreated: () => void;
}

const ExcelBulkUserCreationModal: React.FC<ExcelBulkUserCreationModalProps> = ({ isOpen, onClose, onUsersCreated }) => {
  const [step, setStep] = useState<'type' | 'download' | 'upload' | 'review' | 'creating' | 'success'>('type');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [users, setUsers] = useState<ExcelUser[]>([]);
  const [creationResults, setCreationResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  }>({ successful: 0, failed: 0, errors: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const classes = ['play', 'nursery', 'lkg', 'ukg', '1st'];

  // Convert MM/DD/YYYY to ISO date string for database storage
  const convertDateFormat = (dateString: string): string => {
    if (!dateString) return '';
    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  // Format date for display (ensures proper MM/DD/YYYY format)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    // If it's already in MM/DD/YYYY format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    // If it's in YYYY-MM-DD format, convert to MM/DD/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${month}/${day}/${year}`;
    }
    return dateString;
  };

  const generateExcelTemplate = () => {
    const headers = userType === 'student' 
      ? ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Password', 'Class', 'Roll Number', 'Age', 'Father Name', 'Mother Name', 'Admission Date']
      : ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Password'];

    // Create sample data
    const sampleData = [];
    for (let i = 1; i <= 5; i++) {
      const row = userType === 'student'
        ? [
            `Student${i}`, // First Name
            'Example', // Last Name
            `student${i.toString().padStart(2, '0')}@maplekids.com`, // Email
            `987654321${i}`, // Phone
            `Sample Address ${i}`, // Address
            'password123', // Password
            'play', // Class
            `PLAY${i.toString().padStart(2, '0')}`, // Roll Number
            4 + i, // Age
            `Father${i}`, // Father Name
            `Mother${i}`, // Mother Name
            '01/15/2024' // Admission Date
          ]
        : [
            `Teacher${i}`, // First Name
            'Example', // Last Name
            `teacher${i.toString().padStart(2, '0')}@maplekids.com`, // Email
            `987654321${i}`, // Phone
            `Sample Address ${i}`, // Address
            'password123' // Password
          ];
      sampleData.push(row);
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

    // Set column widths
    const colWidths = userType === 'student'
      ? [
          { wch: 15 }, // First Name
          { wch: 15 }, // Last Name
          { wch: 30 }, // Email
          { wch: 15 }, // Phone
          { wch: 30 }, // Address
          { wch: 15 }, // Password
          { wch: 10 }, // Class
          { wch: 15 }, // Roll Number
          { wch: 8 },  // Age
          { wch: 20 }, // Father Name
          { wch: 20 }, // Mother Name
          { wch: 15 }  // Admission Date
        ]
      : [
          { wch: 15 }, // First Name
          { wch: 15 }, // Last Name
          { wch: 30 }, // Email
          { wch: 15 }, // Phone
          { wch: 30 }, // Address
          { wch: 15 }  // Password
        ];
    ws['!cols'] = colWidths;

    // Add data validation for student template
    if (userType === 'student') {
      // Add dropdown for Class column (column G, index 6)
      const classValidation = {
        type: 'list',
        allowBlank: false,
        showDropDown: true,
        formula1: `"${classes.join(',')}"`
      };
      
      // Apply validation to all data rows (skip header)
      for (let row = 2; row <= sampleData.length + 1; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: 6 }); // Column G
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        ws[cellRef].dv = classValidation;
      }

      // Add date validation for Admission Date column (column L, index 11)
      const dateValidation = {
        type: 'date',
        operator: 'between',
        formula1: '01/01/2020',
        formula2: '12/31/2030',
        showDropDown: true
      };

      // Apply date validation to all data rows
      for (let row = 2; row <= sampleData.length + 1; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: 11 }); // Column L
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        ws[cellRef].dv = dateValidation;
      }

      // Add number validation for Age column (column I, index 8)
      const ageValidation = {
        type: 'whole',
        operator: 'between',
        formula1: 1,
        formula2: 18,
        showDropDown: false
      };

      // Apply age validation to all data rows
      for (let row = 2; row <= sampleData.length + 1; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: 8 }); // Column I
        if (!ws[cellRef]) ws[cellRef] = { t: 'n', v: '' };
        ws[cellRef].dv = ageValidation;
      }
    }

    // Add a note about date format for student template
    if (userType === 'student') {
      // Add a note in the first column of the last row
      const noteRow = sampleData.length + 2; // After headers and data
      const noteCell = XLSX.utils.encode_cell({ r: noteRow, c: 0 });
      ws[noteCell] = { t: 's', v: 'Note: Admission Date should be in MM/DD/YYYY format (e.g., 01/15/2024)' };
      ws[noteCell].s = { font: { bold: true, color: { rgb: "FF0000" } } };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = userType === 'student' 
      ? 'Student_Bulk_Creation_Template.xlsx'
      : 'Teacher_Bulk_Creation_Template.xlsx';
    
    saveAs(data, fileName);
  };

  // Helper function to clean and normalize data
  const cleanData = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value.trim();
    return String(value).trim();
  };

  // Helper function to normalize headers (case-insensitive, trim whitespace)
  const normalizeHeader = (header: string): string => {
    return header.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  // Helper function to find column index by flexible header matching
  const findColumnIndex = (headers: string[], targetHeader: string): number => {
    const normalizedTarget = normalizeHeader(targetHeader);
    
    // First try exact match
    let index = headers.findIndex(header => normalizeHeader(header) === normalizedTarget);
    if (index !== -1) return index;
    
    // Then try partial matches for common variations
    const variations = [
      targetHeader.toLowerCase(),
      targetHeader.toLowerCase().replace(/\s+/g, ''),
      targetHeader.toLowerCase().replace(/\s+/g, '_'),
      targetHeader.toLowerCase().replace(/\s+/g, '-')
    ];
    
    for (const variation of variations) {
      index = headers.findIndex(header => 
        normalizeHeader(header).includes(variation) || 
        variation.includes(normalizeHeader(header))
      );
      if (index !== -1) return index;
    }
    
    return -1;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Use raw option to preserve data types and handle empty cells better
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          raw: false,
          defval: '',
          blankrows: false
        });

        if (jsonData.length < 2) {
          alert('Excel file must have at least a header row and one data row.');
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];

        // Clean headers
        const cleanedHeaders = headers.map(header => cleanData(header));

        const expectedHeaders = userType === 'student'
          ? ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Password', 'Class', 'Roll Number', 'Age', 'Father Name', 'Mother Name', 'Admission Date']
          : ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Password'];

        // Find column indices using flexible matching
        const columnIndices: { [key: string]: number } = {};
        const missingHeaders: string[] = [];

        for (const expectedHeader of expectedHeaders) {
          const index = findColumnIndex(cleanedHeaders, expectedHeader);
          if (index !== -1) {
            columnIndices[expectedHeader] = index;
          } else {
            missingHeaders.push(expectedHeader);
          }
        }

        // If critical headers are missing, show error with suggestions
        const criticalHeaders = userType === 'student' 
          ? ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Password', 'Class', 'Roll Number']
          : ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Password'];

        const missingCritical = missingHeaders.filter(header => criticalHeaders.includes(header));
        
        if (missingCritical.length > 0) {
          alert(`Missing critical headers: ${missingCritical.join(', ')}\n\nFound headers: ${cleanedHeaders.join(', ')}\n\nPlease check your Excel file and try again.`);
          return;
        }

        // Parse users with flexible column mapping
        const parsedUsers: ExcelUser[] = rows.map((row, index) => {
          const rowNumber = index + 2; // +2 because Excel is 1-indexed and we skip header
          
          // Clean and normalize row data
          const cleanedRow = row.map(cell => cleanData(cell));
          
          const user: ExcelUser = {
            id: `user-${index + 1}`,
            firstName: cleanedRow[columnIndices['First Name']] || '',
            lastName: cleanedRow[columnIndices['Last Name']] || '',
            email: cleanedRow[columnIndices['Email']] || '',
            phone: cleanedRow[columnIndices['Phone']] || '',
            address: cleanedRow[columnIndices['Address']] || '',
            password: cleanedRow[columnIndices['Password']] || '',
            class: userType === 'student' ? (cleanedRow[columnIndices['Class']] || '') : undefined,
            rollNumber: userType === 'student' ? (cleanedRow[columnIndices['Roll Number']] || '') : undefined,
            age: userType === 'student' ? (parseInt(cleanedRow[columnIndices['Age']]) || 0) : undefined,
            fatherName: userType === 'student' ? (cleanedRow[columnIndices['Father Name']] || '') : undefined,
            motherName: userType === 'student' ? (cleanedRow[columnIndices['Mother Name']] || '') : undefined,
            admissionDate: userType === 'student' ? (cleanedRow[columnIndices['Admission Date']] || '') : undefined,
            isValid: true,
            errors: [],
            rowNumber
          };

          return validateUser(user);
        });

        setUsers(parsedUsers);
        setStep('review');
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert(`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease make sure it's a valid Excel file and try again.`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validateUser = (user: ExcelUser): ExcelUser => {
    const errors: string[] = [];
    
    // Clean and normalize all string fields
    const cleanString = (str: any): string => {
      if (!str) return '';
      return String(str).trim();
    };
    
    const cleanNumber = (num: any): number => {
      if (typeof num === 'number') return num;
      if (typeof num === 'string') {
        const cleaned = num.replace(/[^\d]/g, '');
        return cleaned ? parseInt(cleaned, 10) : 0;
      }
      return 0;
    };
    
    // Clean all user data
    user.firstName = cleanString(user.firstName);
    user.lastName = cleanString(user.lastName);
    user.email = cleanString(user.email);
    user.phone = cleanString(user.phone);
    user.address = cleanString(user.address);
    user.password = cleanString(user.password);
    
    if (userType === 'student') {
      user.class = cleanString(user.class);
      user.rollNumber = cleanString(user.rollNumber);
      user.age = cleanNumber(user.age);
      user.fatherName = cleanString(user.fatherName);
      user.motherName = cleanString(user.motherName);
      user.admissionDate = cleanString(user.admissionDate);
    }
    
    // Required field validation
    if (!user.firstName) errors.push('First name is required');
    if (!user.lastName) errors.push('Last name is required');
    if (!user.email) errors.push('Email is required');
    if (!user.phone) errors.push('Phone is required');
    if (!user.address) errors.push('Address is required');
    if (!user.password) errors.push('Password is required');
    
    if (userType === 'student') {
      if (!user.class) errors.push('Class is required');
      if (!user.rollNumber) errors.push('Roll number is required');
      if (!user.age || user.age <= 0) errors.push('Age must be a positive number');
      if (!user.fatherName) errors.push('Father name is required');
      if (!user.motherName) errors.push('Mother name is required');
      if (!user.admissionDate) errors.push('Admission date is required');
    }
    
    // Email format validation (more flexible)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user.email && !emailRegex.test(user.email)) {
      errors.push('Invalid email format');
    }
    
    // Phone number validation (more flexible - accepts various formats)
    const phoneDigits = user.phone.replace(/\D/g, '');
    if (user.phone && phoneDigits.length !== 10) {
      errors.push('Phone must contain exactly 10 digits');
    }
    
    // Age validation for students
    if (userType === 'student' && user.age && (user.age < 3 || user.age > 18)) {
      errors.push('Age must be between 3 and 18');
    }
    
    // Class validation for students
    if (userType === 'student' && user.class) {
      const validClasses = ['play', 'nursery', 'lkg', 'ukg', '1st'];
      if (!validClasses.includes(user.class.toLowerCase())) {
        errors.push(`Class must be one of: ${validClasses.join(', ')}`);
      }
    }
    
    // Date validation for admission date
    if (userType === 'student' && user.admissionDate) {
      const dateStr = user.admissionDate;
      // Try to parse various date formats
      let parsedDate: Date | null = null;
      
      // Try MM/DD/YYYY format
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [month, day, year] = dateStr.split('/').map(Number);
        parsedDate = new Date(year, month - 1, day);
      }
      // Try YYYY-MM-DD format
      else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
        parsedDate = new Date(dateStr);
      }
      // Try DD-MM-YYYY format
      else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-').map(Number);
        parsedDate = new Date(year, month - 1, day);
      }
      
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        errors.push('Admission date must be in MM/DD/YYYY, YYYY-MM-DD, or DD-MM-YYYY format');
      } else {
        // Update the admission date to ISO format for consistency
        user.admissionDate = parsedDate.toISOString().split('T')[0];
      }
    }

    // Set validation status
    user.isValid = errors.length === 0;
    user.errors = errors;
    
    return user;
  };

  const updateUser = (userId: string, field: keyof ExcelUser, value: string | number) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const updatedUser = { ...user, [field]: value };
        return validateUser(updatedUser);
      }
      return user;
    }));
  };

  const createUserForBulk = async (email: string, password: string, userData: any) => {
    const { auth, db } = await import('../firebase/config');
    const { createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    try {
      console.log('Creating user with data:', { email, role: userData.role, rollNumber: userData.rollNumber });
      
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error('No admin user is currently signed in');
      }
      const adminUid = currentAdmin.uid;

      console.log('Creating Firebase Auth account...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Firebase Auth account created:', firebaseUser.uid);

      const documentId = userData.role === 'student' && userData.rollNumber 
        ? userData.rollNumber 
        : firebaseUser.uid;

      const userDocData = {
        ...userData,
        uid: firebaseUser.uid,
        email: email,
        createdAt: serverTimestamp(),
        createdBy: adminUid,
        needsAuthCreation: false,
      };
      
      console.log('Saving user document to Firestore:', {
        ...userDocData,
        password: '[HIDDEN]'
      });
      await setDoc(doc(db, 'users', documentId), userDocData);
      console.log('User document saved successfully');

      if (userData.role === 'student' && userData.class && userData.rollNumber) {
        const studentData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: email,
          phone: userData.phone,
          address: userData.address,
          class: userData.class,
          rollNumber: userData.rollNumber,
          age: userData.age,
          fatherName: userData.fatherName,
          motherName: userData.motherName,
          admissionDate: convertDateFormat(userData.admissionDate), // Convert to YYYY-MM-DD format
          userId: userData.rollNumber,
          authUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          createdBy: adminUid,
        };
        console.log('Saving student document to Firestore:', studentData);
        await setDoc(doc(db, 'students', userData.rollNumber), studentData);
        console.log('Student document saved successfully');
      }

      // Sign out the newly created user
      await signOut(auth);
      console.log('Signed out newly created user');
      
      console.log('User created successfully with Firebase Auth account and Firestore records.');
      
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const handleCreateUsers = async () => {
    const allValid = users.every(user => user.isValid);
    if (!allValid) {
      alert('Please fix all validation errors before creating users.');
      return;
    }

    setStep('creating');
    
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      console.log(`Starting bulk creation of ${users.length} ${userType}s...`);
      
      // Get admin credentials before starting
      const { auth } = await import('../firebase/config');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error('No admin user is currently signed in');
      }
      
      const adminEmail = currentAdmin.email;
      const adminPassword = prompt(`Enter your admin password to continue bulk creation of ${users.length} ${userType}s:`);
      
      if (!adminPassword) {
        throw new Error('Admin password required for bulk creation');
      }
      
      console.log('Admin credentials stored for bulk creation');
      
      for (const user of users) {
        try {
          console.log(`Creating ${userType}: ${user.email} (Row ${user.rowNumber})`);
          
          const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: userType,
            ...(userType === 'student' && {
              class: user.class,
              rollNumber: user.rollNumber,
              age: user.age,
              fatherName: user.fatherName,
              motherName: user.motherName,
              admissionDate: user.admissionDate
            })
          };

          console.log('User data being sent:', { ...userData, password: '[HIDDEN]' });
          await createUserForBulk(user.email, user.password, userData);
          console.log(`✅ Successfully created ${userType}: ${user.email}`);
          results.successful++;
          
          // Re-sign in admin after each user creation (except the last one)
          if (results.successful < users.length) {
            console.log('Re-signing in admin for next user...');
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            console.log('Admin re-signed in successfully');
          }
          
        } catch (error: any) {
          console.error(`❌ Failed to create ${userType}: ${user.email}`, error);
          results.failed++;
          results.errors.push(`Row ${user.rowNumber} (${user.email}): ${error.message}`);
          
          // Try to re-sign in admin even after failure
          try {
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            console.log('Admin re-signed in after error');
          } catch (signInError) {
            console.error('Failed to re-sign in admin:', signInError);
            // If we can't re-sign in admin, break the loop
            results.errors.push('Admin session lost. Stopping bulk creation.');
            break;
          }
        }
      }
      
      console.log(`Bulk creation completed. Success: ${results.successful}, Failed: ${results.failed}`);

      setCreationResults(results);
      setStep('success');
      onUsersCreated();
    } catch (error) {
      console.error('Bulk creation error:', error);
      results.errors.push(`General error: ${error}`);
      setCreationResults(results);
      setStep('success');
    }
  };

  const resetModal = () => {
    setStep('type');
    setUserType('student');
    setUsers([]);
    setCreationResults({ successful: 0, failed: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'type':
        return (
          <div className="step-content">
            <h3>Select User Type</h3>
            <div className="type-selection">
              <div className="type-option">
                <input
                  type="radio"
                  id="student"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={(e) => setUserType(e.target.value as 'student' | 'teacher')}
                />
                <label htmlFor="student" className="type-card">
                  <div className="type-icon">🎓</div>
                  <div className="type-info">
                    <h4>Students</h4>
                    <p>Create multiple student accounts with class assignments</p>
                  </div>
                </label>
              </div>
              <div className="type-option">
                <input
                  type="radio"
                  id="teacher"
                  name="userType"
                  value="teacher"
                  checked={userType === 'teacher'}
                  onChange={(e) => setUserType(e.target.value as 'student' | 'teacher')}
                />
                <label htmlFor="teacher" className="type-card">
                  <div className="type-icon">👨‍🏫</div>
                  <div className="type-info">
                    <h4>Teachers</h4>
                    <p>Create multiple teacher accounts</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'download':
        return (
          <div className="step-content">
            <h3>Download Excel Template</h3>
            <p className="step-description">
              Download the Excel template with the correct format and sample data for {userType}s.
            </p>
            
            <div className="download-section">
              <div className="template-info">
                <h4>📋 Template includes:</h4>
                <ul>
                  {userType === 'student' ? (
                    <>
                      <li>First Name, Last Name</li>
                      <li>Email, Phone (10 digits), Address</li>
                      <li>Password, Class (dropdown), Roll Number</li>
                      <li>Age, Father Name, Mother Name</li>
                      <li>Admission Date (MM/DD/YYYY format)</li>
                      <li>Sample data for 5 students</li>
                    </>
                  ) : (
                    <>
                      <li>First Name, Last Name</li>
                      <li>Email, Phone (10 digits), Address</li>
                      <li>Password</li>
                      <li>Sample data for 5 teachers</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="download-actions">
                <Button variant="primary" onClick={generateExcelTemplate}>
                  📥 Download {userType === 'student' ? 'Student' : 'Teacher'} Template
                </Button>
                <p className="download-note">
                  Fill in the template with your user data, then upload it in the next step.
                </p>
              </div>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="step-content">
            <h3>Upload Filled Excel File</h3>
            <p className="step-description">
              Upload the Excel file you filled with user data.
            </p>
            
            <div className="upload-section">
              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button 
                  variant="primary" 
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-button"
                >
                  📁 Choose Excel File
                </Button>
                <p className="upload-note">
                  Supported formats: .xlsx, .xls
                </p>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="step-content">
            <h3>Review User Data</h3>
            <p className="step-description">
              Review the data from your Excel file. You can edit any field before creating users.
            </p>
            <div className="users-list">
              {users.map((user, index) => (
                <Card key={user.id} className={`user-card ${!user.isValid ? 'invalid' : ''}`}>
                  <div className="user-header">
                    <h4>Row {user.rowNumber} - User #{index + 1}</h4>
                    {!user.isValid && <span className="error-badge">Has Errors</span>}
                  </div>
                  <div className="user-fields">
                    <div className="field-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={user.firstName}
                        onChange={(e) => updateUser(user.id, 'firstName', e.target.value)}
                        className={user.errors.includes('First name is required') ? 'error' : ''}
                      />
                    </div>
                    <div className="field-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={user.lastName}
                        onChange={(e) => updateUser(user.id, 'lastName', e.target.value)}
                        className={user.errors.includes('Last name is required') ? 'error' : ''}
                      />
                    </div>
                    <div className="field-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={user.email}
                        onChange={(e) => updateUser(user.id, 'email', e.target.value)}
                        className={user.errors.some(e => e.includes('email')) ? 'error' : ''}
                      />
                    </div>
                    <div className="field-group">
                      <label>Phone</label>
                      <input
                        type="text"
                        value={user.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 10) {
                            updateUser(user.id, 'phone', value);
                          }
                        }}
                        className={user.errors.some(e => e.includes('Phone')) ? 'error' : ''}
                        placeholder="10 digit number"
                      />
                    </div>
                    <div className="field-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={user.address}
                        onChange={(e) => updateUser(user.id, 'address', e.target.value)}
                        className={user.errors.includes('Address is required') ? 'error' : ''}
                      />
                    </div>
                    <div className="field-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={user.password}
                        onChange={(e) => updateUser(user.id, 'password', e.target.value)}
                        className={user.errors.includes('Password is required') ? 'error' : ''}
                      />
                    </div>
                    {userType === 'student' && (
                      <>
                        <div className="field-group">
                          <label>Class</label>
                          <select
                            value={user.class || ''}
                            onChange={(e) => updateUser(user.id, 'class', e.target.value)}
                          >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                              <option key={cls} value={cls}>{cls.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field-group">
                          <label>Roll Number</label>
                          <input
                            type="text"
                            value={user.rollNumber || ''}
                            onChange={(e) => updateUser(user.id, 'rollNumber', e.target.value)}
                            className={user.errors.includes('Roll number is required') ? 'error' : ''}
                          />
                        </div>
                        <div className="field-group">
                          <label>Age</label>
                          <input
                            type="number"
                            min="1"
                            max="18"
                            value={user.age || ''}
                            onChange={(e) => updateUser(user.id, 'age', parseInt(e.target.value) || 0)}
                            className={user.errors.includes('Age is required') || user.errors.some(e => e.includes('Age')) ? 'error' : ''}
                          />
                        </div>
                        <div className="field-group">
                          <label>Father Name</label>
                          <input
                            type="text"
                            value={user.fatherName || ''}
                            onChange={(e) => updateUser(user.id, 'fatherName', e.target.value)}
                            className={user.errors.includes('Father name is required') ? 'error' : ''}
                          />
                        </div>
                        <div className="field-group">
                          <label>Mother Name</label>
                          <input
                            type="text"
                            value={user.motherName || ''}
                            onChange={(e) => updateUser(user.id, 'motherName', e.target.value)}
                            className={user.errors.includes('Mother name is required') ? 'error' : ''}
                          />
                        </div>
                        <div className="field-group">
                          <label>Admission Date (MM/DD/YYYY)</label>
                          <input
                            type="text"
                            value={formatDateForDisplay(user.admissionDate || '')}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                              if (value.length >= 2) {
                                value = value.substring(0, 2) + '/' + value.substring(2);
                              }
                              if (value.length >= 5) {
                                value = value.substring(0, 5) + '/' + value.substring(5, 9);
                              }
                              updateUser(user.id, 'admissionDate', value);
                            }}
                            placeholder="MM/DD/YYYY"
                            maxLength={10}
                            className={user.errors.includes('Admission date is required') || user.errors.some(e => e.includes('Admission date')) ? 'error' : ''}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {user.errors.length > 0 && (
                    <div className="user-errors">
                      {user.errors.map((error, idx) => (
                        <span key={idx} className="error-message">{error}</span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case 'creating':
        return (
          <div className="step-content creating">
            <div className="creating-animation">
              <div className="spinner"></div>
              <h3>Creating Users...</h3>
              <p>Please wait while we create {users.length} {userType}s. This may take a moment.</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="step-content success">
            <div className="success-icon">✅</div>
            <h3>Bulk User Creation Complete!</h3>
            <div className="results-summary">
              <div className="result-item success">
                <span className="result-number">{creationResults.successful}</span>
                <span className="result-label">Users Created Successfully</span>
              </div>
              {creationResults.failed > 0 && (
                <div className="result-item error">
                  <span className="result-number">{creationResults.failed}</span>
                  <span className="result-label">Failed to Create</span>
                </div>
              )}
            </div>
            {creationResults.errors.length > 0 && (
              <div className="error-details">
                <h4>Errors:</h4>
                <ul>
                  {creationResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'type': return 'Excel Bulk User Creation - Step 1';
      case 'download': return 'Excel Bulk User Creation - Step 2';
      case 'upload': return 'Excel Bulk User Creation - Step 3';
      case 'review': return 'Excel Bulk User Creation - Step 4';
      case 'creating': return 'Creating Users...';
      case 'success': return 'Creation Complete';
      default: return 'Excel Bulk User Creation';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'type':
        return userType;
      case 'download':
        return true;
      case 'upload':
        return users.length > 0;
      case 'review':
        return users.length > 0 && users.every(user => user.isValid);
      default:
        return false;
    }
  };

  const getNextButtonText = () => {
    switch (step) {
      case 'type': return 'Next: Download Template';
      case 'download': return 'Next: Upload File';
      case 'upload': return 'Next: Review Data';
      case 'review': return 'Create Users';
      default: return 'Next';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getStepTitle()}>
      <div className="excel-bulk-user-creation-modal">
        <div className="step-indicator">
          <div className={`step ${step === 'type' ? 'active' : ['download', 'upload', 'review', 'creating', 'success'].includes(step) ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Select Type</span>
          </div>
          <div className={`step ${step === 'download' ? 'active' : ['upload', 'review', 'creating', 'success'].includes(step) ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Download</span>
          </div>
          <div className={`step ${step === 'upload' ? 'active' : ['review', 'creating', 'success'].includes(step) ? 'completed' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Upload</span>
          </div>
          <div className={`step ${step === 'review' ? 'active' : ['creating', 'success'].includes(step) ? 'completed' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Review</span>
          </div>
          <div className={`step ${step === 'creating' ? 'active' : step === 'success' ? 'completed' : ''}`}>
            <span className="step-number">5</span>
            <span className="step-label">Create</span>
          </div>
        </div>

        {renderStepContent()}

        <div className="modal-actions">
          {step !== 'creating' && step !== 'success' && (
            <>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              {step !== 'type' && (
                <Button variant="secondary" onClick={() => {
                  if (step === 'download') setStep('type');
                  else if (step === 'upload') setStep('download');
                  else if (step === 'review') setStep('upload');
                }}>
                  Previous
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => {
                  if (step === 'type') setStep('download');
                  else if (step === 'download') setStep('upload');
                  else if (step === 'upload') setStep('review');
                  else if (step === 'review') handleCreateUsers();
                }}
                disabled={!canProceed()}
              >
                {getNextButtonText()}
              </Button>
            </>
          )}
          {step === 'success' && (
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ExcelBulkUserCreationModal;

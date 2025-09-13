// Demo script to test Firebase integration
// Run this in your browser console after setting up Firebase

import { 
  studentService, 
  financialService, 
  photoService, 
  eventService,
  attendanceService 
} from './services';

export const runFirebaseDemo = async () => {
  console.log('🚀 Starting Firebase Demo...');
  
  try {
    // Test adding a sample student
    console.log('📚 Adding sample student...');
    const sampleStudent = await studentService.addStudent({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main Street, City, State 12345',
      class: 'lkg',
      userId: 'demo-user-id',
      age: 5,
      parentName: 'Jane Doe',
      parentPhone: '1234567890',
      admissionDate: '2024-01-15',
      rollNumber: '123'
    });
    console.log('✅ Student added:', sampleStudent);

    // Test adding a financial record
    console.log('💰 Adding sample financial record...');
    const sampleFinancial = await financialService.addFinancialRecord({
      type: 'income',
      category: 'tuition',
      amount: 5000,
      description: 'Monthly tuition fee for John Doe',
      date: '2024-01-15',
      receiptNumber: 'RCP001'
    });
    console.log('✅ Financial record added:', sampleFinancial);

    // Test adding a sample event
    console.log('🎉 Adding sample event...');
    const sampleEvent = await eventService.addEvent({
      title: 'Annual Sports Day',
      description: 'A fun-filled day of sports activities for all students',
      date: '2024-03-15',
      time: '09:00 AM',
      location: 'School Ground',
      isActive: true
    });
    console.log('✅ Event added:', sampleEvent);

    // Test fetching data
    console.log('📊 Fetching all students...');
    const students = await studentService.getAllStudents();
    console.log('✅ Students:', students);

    console.log('📊 Fetching all financial records...');
    const financialRecords = await financialService.getAllFinancialRecords();
    console.log('✅ Financial records:', financialRecords);

    console.log('📊 Fetching all events...');
    const events = await eventService.getAllEvents();
    console.log('✅ Events:', events);

    console.log('🎉 Firebase Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
};

// Usage instructions:
// 1. Make sure Firebase is configured in config.ts
// 2. Open browser console
// 3. Import and run: runFirebaseDemo()
// 4. Check Firebase Console to see the data

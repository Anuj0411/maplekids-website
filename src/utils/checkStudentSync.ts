/**
 * Utility function to check if students are properly synced between
 * users and students collections
 * 
 * Run this in browser console:
 * import { checkStudentSync } from './utils/checkStudentSync';
 * checkStudentSync();
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function checkStudentSync() {
  try {
    console.log('🔍 Checking student sync between users and students collections...\n');
    
    // Get all users with role 'student'
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log(`📊 Found ${usersSnapshot.size} student users in 'users' collection`);
    
    // Get all documents from students collection
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    console.log(`📊 Found ${studentsSnapshot.size} records in 'students' collection\n`);
    
    // Collect data
    const studentUsers: Array<{
      id: string;
      rollNumber: string;
      name: string;
      class: string;
      email: string;
    }> = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      studentUsers.push({
        id: doc.id,
        rollNumber: data.rollNumber || 'N/A',
        name: `${data.firstName} ${data.lastName}`,
        class: data.class || 'N/A',
        email: data.email
      });
    });
    
    const students: Array<{
      id: string;
      rollNumber: string;
      name: string;
      class: string;
      email: string;
    }> = [];
    
    studentsSnapshot.forEach(doc => {
      const data = doc.data();
      students.push({
        id: doc.id,
        rollNumber: data.rollNumber || 'N/A',
        name: `${data.firstName} ${data.lastName}`,
        class: data.class || 'N/A',
        email: data.email
      });
    });
    
    console.log('👥 Student Users (from users collection):');
    console.table(studentUsers);
    
    console.log('\n📚 Students (from students collection):');
    console.table(students);
    
    // Find any students in users but not in students collection
    const missingFromStudents = studentUsers.filter(su => 
      !students.find(s => s.rollNumber === su.rollNumber)
    );
    
    // Find any students in students but not in users collection
    const missingFromUsers = students.filter(s => 
      !studentUsers.find(su => su.rollNumber === s.rollNumber)
    );
    
    console.log('\n📋 SYNC REPORT:');
    console.log('─'.repeat(60));
    
    if (missingFromStudents.length > 0) {
      console.log('\n⚠️  WARNING: These students are in USERS collection but NOT in STUDENTS collection:');
      console.table(missingFromStudents);
    }
    
    if (missingFromUsers.length > 0) {
      console.log('\n⚠️  WARNING: These records are in STUDENTS collection but NOT in USERS collection:');
      console.table(missingFromUsers);
    }
    
    if (missingFromStudents.length === 0 && missingFromUsers.length === 0) {
      console.log('\n✅ SUCCESS: All student users are properly synced!');
      console.log(`   - ${studentUsers.length} students in users collection`);
      console.log(`   - ${students.length} students in students collection`);
      console.log('   - All records match perfectly! 🎉');
    } else {
      console.log('\n❌ SYNC ISSUES DETECTED:');
      console.log(`   - ${missingFromStudents.length} students missing from students collection`);
      console.log(`   - ${missingFromUsers.length} students missing from users collection`);
    }
    
    console.log('─'.repeat(60));
    
    return {
      usersCount: studentUsers.length,
      studentsCount: students.length,
      missingFromStudents,
      missingFromUsers,
      isSync: missingFromStudents.length === 0 && missingFromUsers.length === 0
    };
    
  } catch (error) {
    console.error('❌ Error checking sync:', error);
    throw error;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).checkStudentSync = checkStudentSync;
  console.log('✅ checkStudentSync() function is now available in browser console!');
}

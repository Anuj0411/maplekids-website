/**
 * Utility to find and cleanup orphaned student records
 * Run this in browser console to identify students that exist in 'students' collection
 * but don't have corresponding entries in 'users' collection
 */

import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function findOrphanedStudents() {
  try {
    console.log('🔍 Searching for orphaned student records...\n');
    
    // Get all students from students collection
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    console.log(`📊 Found ${studentsSnapshot.size} records in 'students' collection`);
    
    // Get all users with role 'student'
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    );
    const usersSnapshot = await getDocs(usersQuery);
    console.log(`📊 Found ${usersSnapshot.size} student users in 'users' collection\n`);
    
    // Create a set of valid student IDs from users collection
    const validStudentIds = new Set<string>();
    const validRollNumbers = new Set<string>();
    
    usersSnapshot.forEach(doc => {
      validStudentIds.add(doc.id);
      const data = doc.data();
      if (data.rollNumber) {
        validRollNumbers.add(data.rollNumber);
      }
    });
    
    console.log('Valid student IDs from users collection:', Array.from(validStudentIds));
    console.log('Valid roll numbers from users collection:', Array.from(validRollNumbers));
    
    // Find orphaned students
    const orphanedStudents: Array<{
      id: string;
      rollNumber: string;
      name: string;
      email: string;
      class: string;
    }> = [];
    
    studentsSnapshot.forEach(doc => {
      const data = doc.data();
      const studentId = doc.id;
      const rollNumber = data.rollNumber;
      
      // Check if this student exists in users collection
      // Students can be identified either by document ID or rollNumber
      const existsInUsers = validStudentIds.has(studentId) || validRollNumbers.has(rollNumber);
      
      if (!existsInUsers) {
        orphanedStudents.push({
          id: studentId,
          rollNumber: rollNumber || 'N/A',
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email || 'N/A',
          class: data.class || 'N/A'
        });
      }
    });
    
    if (orphanedStudents.length === 0) {
      console.log('✅ No orphaned students found! All student records are in sync.');
      return [];
    }
    
    console.log(`\n⚠️ Found ${orphanedStudents.length} orphaned student record(s):`);
    console.table(orphanedStudents);
    
    console.log('\n💡 To delete these orphaned records, run:');
    console.log('   await window.cleanupOrphanedStudents()');
    
    return orphanedStudents;
  } catch (error) {
    console.error('❌ Error finding orphaned students:', error);
    throw error;
  }
}

export async function cleanupOrphanedStudents() {
  try {
    const orphaned = await findOrphanedStudents();
    
    if (orphaned.length === 0) {
      console.log('✅ Nothing to cleanup!');
      return;
    }
    
    console.log(`\n🗑️ Deleting ${orphaned.length} orphaned student record(s)...`);
    
    let deletedCount = 0;
    for (const student of orphaned) {
      try {
        await deleteDoc(doc(db, 'students', student.id));
        console.log(`✅ Deleted: ${student.name} (${student.id})`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Failed to delete ${student.name}:`, error);
      }
    }
    
    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} out of ${orphaned.length} orphaned records.`);
    console.log('🔄 Refresh the page to see updated student list.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).findOrphanedStudents = findOrphanedStudents;
  (window as any).cleanupOrphanedStudents = cleanupOrphanedStudents;
  console.log('✅ Cleanup utilities available:');
  console.log('   - window.findOrphanedStudents() - Find orphaned records');
  console.log('   - window.cleanupOrphanedStudents() - Delete orphaned records');
}

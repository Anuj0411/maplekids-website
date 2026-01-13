// Simple script to check if students are synced between users and students collections
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./path-to-service-account-key.json'); // You'll need to update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkStudentSync() {
  try {
    // Get all users with role 'student'
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'student')
      .get();
    
    console.log(`Found ${usersSnapshot.size} student users in 'users' collection`);
    
    // Get all documents from students collection
    const studentsSnapshot = await db.collection('students').get();
    console.log(`Found ${studentsSnapshot.size} records in 'students' collection`);
    
    // Check if they match
    const studentUsers = [];
    usersSnapshot.forEach(doc => {
      studentUsers.push({
        id: doc.id,
        rollNumber: doc.data().rollNumber,
        name: `${doc.data().firstName} ${doc.data().lastName}`
      });
    });
    
    const students = [];
    studentsSnapshot.forEach(doc => {
      students.push({
        id: doc.id,
        rollNumber: doc.data().rollNumber,
        name: `${doc.data().firstName} ${doc.data().lastName}`
      });
    });
    
    console.log('\nStudent Users:', studentUsers);
    console.log('\nStudents Collection:', students);
    
    // Find any students in users but not in students collection
    const missingFromStudents = studentUsers.filter(su => 
      !students.find(s => s.rollNumber === su.rollNumber)
    );
    
    if (missingFromStudents.length > 0) {
      console.log('\n⚠️  WARNING: These students are in users collection but NOT in students collection:');
      console.log(missingFromStudents);
    } else {
      console.log('\n✅ All student users are properly synced to students collection!');
    }
    
  } catch (error) {
    console.error('Error checking sync:', error);
  }
  
  process.exit(0);
}

checkStudentSync();

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

function getFirebaseConfig() {
  if (process.env.NODE_ENV === 'test') {
    return {
      apiKey: 'test-api-key-not-used-for-network',
      authDomain: 'unit-test.firebaseapp.com',
      projectId: 'unit-test',
      storageBucket: 'unit-test.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000',
    };
  }

  const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
  const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.REACT_APP_FIREBASE_APP_ID;

  const missing = [
    ['REACT_APP_FIREBASE_API_KEY', apiKey],
    ['REACT_APP_FIREBASE_AUTH_DOMAIN', authDomain],
    ['REACT_APP_FIREBASE_PROJECT_ID', projectId],
    ['REACT_APP_FIREBASE_STORAGE_BUCKET', storageBucket],
    ['REACT_APP_FIREBASE_MESSAGING_SENDER_ID', messagingSenderId],
    ['REACT_APP_FIREBASE_APP_ID', appId],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env in the project root and add values from Firebase Console → Project settings → Your apps.'
    );
  }

  return {
    apiKey: apiKey!,
    authDomain: authDomain!,
    projectId: projectId!,
    storageBucket: storageBucket!,
    messagingSenderId: messagingSenderId!,
    appId: appId!,
  };
}

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

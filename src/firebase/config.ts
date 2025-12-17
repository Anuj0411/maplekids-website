// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7iQcoEFTvm7ORT73vT4fwuje6aszCGP4",
  authDomain: "maplekids-213fe.firebaseapp.com",
  projectId: "maplekids-213fe",
  storageBucket: "maplekids-213fe.firebasestorage.app",
  messagingSenderId: "255472940985",
  appId: "1:255472940985:web:b00e42624673326f116868"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
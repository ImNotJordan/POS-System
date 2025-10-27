import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC38z1sH7gRmA9XOAn0T6EZSy-ywCayrQs",
  authDomain: "pos-system-66bb0.firebaseapp.com",
  projectId: "pos-system-66bb0",
  storageBucket: "pos-system-66bb0.firebasestorage.app",
  messagingSenderId: "876391301239",
  appId: "1:876391301239:web:aa71ce82f155daebff0672"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;

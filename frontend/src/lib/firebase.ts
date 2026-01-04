import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for National Hospital
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCII0CHeL36WmarxGZJc7wEs-gt-MRZ6ME",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medihub-20cde.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medihub-20cde",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medihub-20cde.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "688531961914",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:688531961914:web:1892bd0e1d24a6dfe45d03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

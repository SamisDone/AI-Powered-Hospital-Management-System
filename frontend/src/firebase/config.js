import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for MediHub
// Backend services (Firestore, Auth, Storage) are configured here
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC7PtMT5lmw0LT5QGpOZKZwLL0S7vHnFKA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "medihub-d29f1.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "medihub-d29f1",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "medihub-d29f1.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "761244640914",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:761244640914:web:753f640c06f6ae57dc684b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;


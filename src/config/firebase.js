import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration for InfratechAI QA Manager
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAVl9-QBWETr_uHnjdR2MsQes3lXsXbs_4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "infratechaiqamanager.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "infratechaiqamanager",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "infratechaiqamanager.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "672954202375",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:672954202375:web:b6c7ad8180cb16c5a6eda2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RMWFMLLENJ"
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your-api-key-here' &&
  !firebaseConfig.apiKey.includes('placeholder')
);

let app = null;
let firestore = null;
let auth = null;
let analytics = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestore = getFirestore(app);
    auth = getAuth(app);
    
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }

    console.info('[Firebase] Connected successfully to project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('[Firebase] Initialization error. Falling back to local storage:', error.message);
  }
} else {
  console.info('[QA Manager] Running in Local Storage mode.');
}

export { app, firestore, auth, analytics, firebaseConfig };

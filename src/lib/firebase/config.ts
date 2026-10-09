import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] || "AIzaSyBR3tGoA6ZL5GcQRomEGPtIvZqevAUBfuo",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] || "smart-atd-411e8.firebaseapp.com",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] || "smart-atd-411e8",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] || "smart-atd-411e8.firebasestorage.app",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "507490418223",
  appId: env["VITE_FIREBASE_APP_ID"] || "1:507490418223:web:14a7c58b08862b8ad190da",
  measurementId: env["VITE_FIREBASE_MEASUREMENT_ID"] || "G-XGEBRKJHQF",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Initialize analytics safely on client side
  if (typeof window !== "undefined") {
    isSupported()
      .then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      })
      .catch(() => {});
  }
} catch (error) {
  console.warn("Firebase initialization notice:", error);
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db, analytics, onAuthStateChanged };

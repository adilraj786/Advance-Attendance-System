import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] || "ADD_YOUR_OWN_FIREBASE_API_KEY",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] || "ADD_YOUR_OWN_FIREBASE_AUTH_DOMAIN",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] || "ADD_YOUR_OWN_FIREBASE_PROJECT_ID",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] || "ADD_YOUR_OWN_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "ADD_YOUR_OWN_FIREBASE_MESSAGING_SENDER_ID",
  appId: env["VITE_FIREBASE_APP_ID"] || "ADD_YOUR_OWN_FIREBASE_APP_ID",
  measurementId: env["VITE_FIREBASE_MEASUREMENT_ID"] || "ADD_YOUR_OWN_FIREBASE_MEASUREMENT_ID",
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
  console.warn("Firebase initialization notice (placeholders or offline mode):", error);
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch {
    // Ignore fallback errors if running in mock/demo mode without Firebase keys
  }
}

export { app, auth, db, analytics, onAuthStateChanged };

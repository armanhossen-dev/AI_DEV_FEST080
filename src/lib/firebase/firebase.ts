import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAVwEtoWKdp9NarJYPbtnK84FLCdJRDAwU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "phase-2-6def1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "phase-2-6def1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "phase-2-6def1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "10025565327",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:10025565327:web:527350a203c208fbae44fa",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RHKQSGN8LD",
};

// Initialize Firebase safely (avoid re-initialization during HMR)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

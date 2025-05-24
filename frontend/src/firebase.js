import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDcunepln_fvK_tedBLTZRPbcPRlV--1wY",
  authDomain: "test-app-bd9a9.firebaseapp.com",
  projectId: "test-app-bd9a9",
  storageBucket: "test-app-bd9a9.firebasestorage.app",
  messagingSenderId: "790085495352",
  appId: "1:790085495352:web:3eeda384798dca57b794cd",
  measurementId: "G-NCFX251CR4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
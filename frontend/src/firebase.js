import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyDOPnQvhSAFHpdvLx9N9-5FwaddimN8k",
  authDomain: "autha-cbc91.firebaseapp.com",
  projectId: "autha-cbc91",
  storageBucket: "autha-cbc91.firebasestorage.app",
  messagingSenderId: "748252340482",
  appId: "1:748252340482:web:3ff6144b56626fb8e4a21b",
  measurementId: "G-LKDHZRW3SP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, analytics };

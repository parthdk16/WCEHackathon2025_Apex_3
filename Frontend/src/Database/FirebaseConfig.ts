// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRzBGpu8fBkV7PN9cDzdehoukrdLVLoY8",
  authDomain: "medical-inventory-manage-5292e.firebaseapp.com",
  projectId: "medical-inventory-manage-5292e",
  storageBucket: "medical-inventory-manage-5292e.firebasestorage.app",
  messagingSenderId: "504410710305",
  appId: "1:504410710305:web:da5cb363e324f0b494de60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance
export const db = getFirestore(app);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// Export the Google Auth provider
export const googleProvider = new GoogleAuthProvider();

export const imgDB = getStorage(app);
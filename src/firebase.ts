import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDUIzS08hArjRZGSh9pRvzTFsr64HaspmE",
  authDomain: "hybrid-ceiling-777bw.firebaseapp.com",
  projectId: "hybrid-ceiling-777bw",
  storageBucket: "hybrid-ceiling-777bw.firebasestorage.app",
  messagingSenderId: "348663665788",
  appId: "1:348663665788:web:e3f6f4b0cd95b46c1c25f9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-filloryvault-50d61b50-0365-48a9-bb37-fc3d296385ec");

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logoutWithGoogle() {
  return signOut(auth);
}

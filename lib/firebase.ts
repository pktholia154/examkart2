import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAPmXpFwtvc4mkCjYAkH1JIj3XVQc7-B_c",
  authDomain: "current-affairs-ea519.firebaseapp.com",
  projectId: "current-affairs-ea519",
  storageBucket: "current-affairs-ea519.firebasestorage.app",
  messagingSenderId: "1002123868550",
  appId: "1:1002123868550:web:509b697a4f619f2f395407"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore for database 'examkart'
let firestoreDb: Firestore;
try {
  firestoreDb = getFirestore(app, "examkart");
} catch (err) {
  console.warn("Failed to initialize 'examkart' database, falling back to default:", err);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.warn("Anonymous sign-in skipped or failed:", err);
    }
  }
  return auth.currentUser;
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.error("Google Sign-In failed:", err);
    throw err;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign out failed:", err);
    throw err;
  }
}

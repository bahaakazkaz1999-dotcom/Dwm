import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Check if config is actually meaningful (not just placeholders)
const isConfigValid = firebaseConfig && 
                     firebaseConfig.apiKey && 
                     firebaseConfig.apiKey !== 'YOUR_API_KEY' && 
                     firebaseConfig.apiKey !== 'PENDING';

let app;
let auth: any = null;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error("Error initializing Firebase Auth:", error);
  }
}

export { auth, isConfigValid };
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  if (!auth) throw new Error("Firebase Auth is not initialized or configuration is pending.");
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logout() {
  if (!auth) return;
  await signOut(auth);
}

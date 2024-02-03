import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Please change to your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDJA_j0k_8ZuKtqIjo7RJ7lr9zzQr6h9PY',
  authDomain: 'peemtanapat--clone.firebaseapp.com',
  projectId: 'peemtanapat-youtube-clone',
  appId: '1:1070041746619:web:84f51ba710689f63446d9e',
};

const MY_REGION = 'asia-southeast1';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// for firebase-functions
export const firebaseFunctions = getFunctions(app, MY_REGION);

export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOut() {
  return auth.signOut();
}

export function onAuthStateChangedHelper(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

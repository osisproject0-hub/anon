import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDeWkdRVzu6apx4OxOGjQKALxRB3_Mrkhw",
  authDomain: "anonymous-d9b02.firebaseapp.com",
  databaseURL: "https://anonymous-d9b02-default-rtdb.firebaseio.com",
  projectId: "anonymous-d9b02",
  storageBucket: "anonymous-d9b02.firebasestorage.app",
  messagingSenderId: "960243050344",
  appId: "1:960243050344:web:accba842fac8228ac258dd",
  measurementId: "G-H1H84NHRCJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();

export const signInAnon = () => signInAnonymously(auth);

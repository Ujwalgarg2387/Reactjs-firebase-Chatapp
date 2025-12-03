import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { getStorage } from "firebase/storage";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAytch-71RVN1olRDHivmpqpY0nLFJbLdI",
  authDomain: "chat-21c80.firebaseapp.com",
  projectId: "chat-21c80",
  storageBucket: "chat-21c80.appspot.com",
  messagingSenderId: "707381422053",
  appId: "1:707381422053:web:f094e2c4251b120f1b310c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app); 

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch
};

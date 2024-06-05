import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  //here paste the firebase code you will get it in the starting when you first create a project in firebase console
  //got to firebase cosole by sigining in
  //create a project/ register an app inside it(there will be option) / you will get the firebase code to add below
  apiKey: "YOUR_API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID", //project id like chat-21c80
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SOME ID",
  appId: "SOME ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage();
export const db = getFirestore();

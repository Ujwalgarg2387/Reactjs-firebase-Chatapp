import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  //here instead of using below code, paste your firebase code you will get it in the starting when you first create a project in firebase console
  //got to firebase cosole by sigining in
  //create a project/ register an app inside it(there will be option) / you will get the firebase code to add below
  apiKey: "AIzaSyAytch-71RVN1olRDHivmpqpY0nLFJbLdI",
  authDomain: "chat-21c80.firebaseapp.com",
  projectId: "chat-21c80",
  storageBucket: "chat-21c80.appspot.com",
  messagingSenderId: "707381422053",
  appId: "1:707381422053:web:f094e2c4251b120f1b310c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage();
export const db = getFirestore();

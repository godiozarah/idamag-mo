// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB34GPA1xt9xgIOC4y6fbNQNkKnsxehpdQ",
  authDomain: "idamag-mo-339eb.firebaseapp.com",
  projectId: "idamag-mo-339eb",
  storageBucket: "idamag-mo-339eb.firebasestorage.app",
  messagingSenderId: "853630938340",
  appId: "1:853630938340:web:4842efeb53ed78e79190f1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Explicitly initialize Storage with the bucket
export const storage = getStorage(
  app,
  "gs://idamag-mo-339eb.firebasestorage.app"
);

export default app;
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBXKxN0DhhEPYA4UxoXUnFqCPjsWX87UDc",
  authDomain: "perfect-haircut-fima.firebaseapp.com",
  projectId: "perfect-haircut-fima",
  storageBucket: "perfect-haircut-fima.firebasestorage.app",
  messagingSenderId: "510287109250",
  appId: "1:510287109250:web:b6bc4db78adb1e10b6e89b",
};

// Initialize Firebase securely (avoiding re-initialization in Next.js development)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

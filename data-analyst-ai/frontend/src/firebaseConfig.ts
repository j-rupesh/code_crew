// firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// ✅ Firebase configuration (copy from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBxGAHVk9H0_TJRHtxbH3tiuxNsonJrcsU",
  authDomain: "codecrew-6960b.firebaseapp.com",
  projectId: "codecrew-6960b",
  storageBucket: "codecrew-6960b.appspot.com",
  messagingSenderId: "687133979880",
  appId: "1:687133979880:web:1cef3f2492d4d17d73055d",
  measurementId: "G-SDNMVSZ38N",
};

// ✅ Prevent multiple initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Analytics (optional - only client side)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

export { app, auth, db, storage, analytics };

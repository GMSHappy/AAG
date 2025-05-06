import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage"; // ✅

const firebaseConfig = {
  apiKey: "AIzaSyBwvnVw0IeBkVl_08ZoIjNMW_JPKFuNrS0",
  authDomain: "mycampus-1489b.firebaseapp.com",
  projectId: "mycampus-1489b",
  storageBucket: "gs://mycampus-1489b.firebasestorage.app", // ✅ Correct default bucket
  messagingSenderId: "427991580336",
  appId: "1:427991580336:web:0dceece6d2cd47ba81c575",
  measurementId: "G-CZB0PR3DZN",
};

// ✅ Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Storage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db, storage }; // ✅ Ready to use everywhere

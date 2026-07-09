import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCr-IyfXGkX7JZRvnmjaBPlkdbAUsS7rok",
  authDomain: "universo-reativo.firebaseapp.com",
  projectId: "universo-reativo",
  storageBucket: "universo-reativo.firebasestorage.app",
  messagingSenderId: "743892806079",
  appId: "1:743892806079:web:ac13674c9b3fb639db190a",
  measurementId: "G-4G41RBP7MX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMgaR9IXPYD5_lWCBpasYqA6RcUjiidUY",
  authDomain: "buybox-mafia.firebaseapp.com",
  projectId: "buybox-mafia",
  storageBucket: "buybox-mafia.appspot.com",
  messagingSenderId: "103940119521362793560",
  appId: "1:103940119521362793560:web:0000000000000000000000",
  measurementId: "G-0000000000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export authentication methods
export { 
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// Optional: Export other Firebase services you might need
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// export const db = getFirestore(app);
// export const storage = getStorage(app);
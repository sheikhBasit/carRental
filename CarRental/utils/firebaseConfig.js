import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBt8k2nWNtiGpFeDZC6Kzl-boWbQkstChw",
  authDomain: "car-rent-eede3.firebasestorage.app",
  projectId: "car-rent-eede3",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  storage_bucket: "car-rent-eede3.firebasestorage.app",
  appId: "1:501441387908:android:67c0e4d494822bc47251d1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithCredential };
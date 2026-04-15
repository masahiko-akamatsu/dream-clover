import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC64BmjAX5V8ZGnU-kLOQpRzrS98RoRE-8",
  authDomain: "yosyukupro.firebaseapp.com",
  projectId: "yosyukupro",
  storageBucket: "yosyukupro.firebasestorage.app",
  messagingSenderId: "824661488718",
  appId: "1:824661488718:web:f4951ee0e7c99b2e7a3f1f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

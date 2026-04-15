import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2yIV5R5tMkWlmQLT2Cxb_MnWiQZhVGSk",
  authDomain: "yosyukupro.firebaseapp.com",
  projectId: "yosyukupro",
  storageBucket: "yosyukupro.appspot.com",
  messagingSenderId: "459825852657",
  appId: "1:459825852657:web:b2e7a3c8d4f1e2a3b5c6d7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzuLdnbK7hhyfU7dq2ZEAjYFMnTYLJI2g",
  authDomain: "women-in-race.firebaseapp.com",
  projectId: "women-in-race",
  storageBucket: "women-in-race.firebasestorage.app",
  messagingSenderId: "42013471712",
  appId: "1:42013471712:web:0a9f834c5d50d302d37185"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
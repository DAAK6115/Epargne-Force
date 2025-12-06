// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTjezBBCPYcfMtrYw2fQw57kMvtdjyU98",
  authDomain: "epargne-force.firebaseapp.com",
  projectId: "epargne-force",
  storageBucket: "epargne-force.firebasestorage.app",
  messagingSenderId: "1080809009568",
  appId: "1:1080809009568:web:85a66c753ab830306974c5",
  measurementId: "G-MR8T94G4YL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
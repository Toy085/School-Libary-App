// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyClDPG88YUP7Amr7ZOhkLRHcSQZ4OFYfgE",
  authDomain: "library-app-ccde8.firebaseapp.com",
  projectId: "library-app-ccde8",
  storageBucket: "library-app-ccde8.firebasestorage.app",
  messagingSenderId: "50421751935",
  appId: "1:50421751935:web:787129e709c7bb3bbbdf4a",
  measurementId: "G-BG3F43PF9Q"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

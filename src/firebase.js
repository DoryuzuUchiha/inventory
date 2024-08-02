// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD06NSOTxoYrdY2kphX1NDW2BmvjKXm4U8",
  authDomain: "project-week-2-84f33.firebaseapp.com",
  projectId: "project-week-2-84f33",
  storageBucket: "project-week-2-84f33.appspot.com",
  messagingSenderId: "682313113306",
  appId: "1:682313113306:web:14e6cd45e3b69861300fe3",
  measurementId: "G-K43FB5J6Q0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Analytics
const analytics = getAnalytics(app);

export { firestore, analytics };

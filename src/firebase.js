import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD06NSOTxoYrdY2kphX1NDW2BmvjKXm4U8",
  authDomain: "project-week-2-84f33.firebaseapp.com",
  projectId: "project-week-2-84f33",
  storageBucket: "project-week-2-84f33.appspot.com",
  messagingSenderId: "682313113306",
  appId: "1:682313113306:web:14e6cd45e3b69861300fe3",
  measurementId: "G-K43FB5J6Q0"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

let analytics;
if (typeof window !== 'undefined') {
  // Only initialize analytics if window is available
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { firestore, analytics };

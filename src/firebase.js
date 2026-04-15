import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-zsPtIvhWaxkS4izLbw0yVD575KKDgM0",
  authDomain: "stockpro-v1.firebaseapp.com",
  projectId: "stockpro-v1",
  storageBucket: "stockpro-v1.firebasestorage.app",
  messagingSenderId: "80960042847",
  appId: "1:80960042847:web:2d53ec69bcc7b79a7428ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;

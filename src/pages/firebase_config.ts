// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, setDoc, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAutq-2XF4lHO7EnR2OMQa9gTOX-CimK0E",
  authDomain: "barber-485eb.firebaseapp.com",
  projectId: "barber-485eb",
  storageBucket: "barber-485eb.firebasestorage.app",
  messagingSenderId: "635042648753",
  appId: "1:635042648753:web:79962e14bd3cf7cdf60890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDoc, setDoc, doc, deleteDoc, updateDoc, arrayUnion }

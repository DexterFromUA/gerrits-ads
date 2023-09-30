import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDzmANVAN9nOvntVb9YYDCb8rRzOl4M4dg",
  authDomain: "darts-884de.firebaseapp.com",
  databaseURL:
    "https://darts-884de-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "darts-884de",
  storageBucket: "darts-884de.appspot.com",
  messagingSenderId: "508689001682",
  appId: "1:508689001682:web:1cac2ef11591dfd27b110b",
  measurementId: "G-R50PL9H5G4",
};

export const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
export const analytics = getAnalytics(app);

export const database = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

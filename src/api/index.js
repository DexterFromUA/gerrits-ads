import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, child, update } from "firebase/database";
import {
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  ref as fRef,
} from "firebase/storage";

const firebaseConfig = {
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const database = getDatabase(app);
const storage = getStorage(app);

export const getCollections = async () => {
  try {
    const result = await get(child(ref(database), "collections/"));

    if (result.exists()) {
      return Object.entries(result.val()).map((el) => el[1]);
    }

    return [];
  } catch (error) {
    console.log("Error while getting collections: ", error);
  }
};

export const addCollection = async (name, description) => {
  try {
    await set(ref(database, "collections/" + name), {
      name,
      description,
      dateAdded: new Date().toDateString(),
    });

    return true;
  } catch (error) {
    console.log("Error while adding collection: ", error);
  }
};

export const getSingleCollection = async (name) => {
  try {
    const result = await get(child(ref(database), "collections/" + name));

    if (result.exists()) {
      return result.val();
    }

    return null;
  } catch (error) {
    console.log("Error while getting collections: ", error);
  }
};

export const addFileToStorage = async (id, file, cb) => {
  try {
    const storageRef = fRef(storage, `/${id}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        console.log("PERCENTS", percent);
      },
      (err) => {
        console.log(err);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          cb(url);
        });
      }
    );
  } catch (error) {
    console.log("Error while adding file: ", error);
  }
};

export const updateCollection = async (id, data) => {
  const updates = {};

  updates["collections/" + id] = data;

  try {
    await update(ref(database), updates);
  } catch (error) {
    console.log("Error while updating collection: ", error);
  }
};

export const removeCollection = async (id) => {
  try {
    await set(ref(database, "collections/" + id), null);

    return true;
  } catch (error) {
    console.log("Error while removing collection: ", error);
  }
};

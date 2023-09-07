import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, child, update } from "firebase/database";
import {
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  ref as fRef,
  deleteObject,
  listAll,
} from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

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
const auth = getAuth(app);

export const signUpManually = async (mail, pass) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, mail, pass);

    if (result && result.user.uid) {
      localStorage.setItem("gUId", result.user.uid);
      localStorage.setItem("gMail", result.user.email);
      localStorage.setItem(
        "gAccessToken",
        result.user.stsTokenManager.accessToken
      );
      localStorage.setItem(
        "gRefreshToken",
        result.user.stsTokenManager.refreshToken
      );

      return true;
    }
  } catch (error) {
    console.log("Error while creating user: ", error);
  }
};

export const signInManually = async (mail, pass) => {
  try {
    const result = await signInWithEmailAndPassword(auth, mail, pass);

    console.log("SIGN IN", result);

    if (result) {
      localStorage.setItem("gUId", result.user.uid);
      localStorage.setItem("gMail", result.user.email);
      localStorage.setItem(
        "gAccessToken",
        result.user.stsTokenManager.accessToken
      );
      localStorage.setItem(
        "gRefreshToken",
        result.user.stsTokenManager.refreshToken
      );

      return true;
    }
  } catch (error) {
    console.log("Error while creating user: ", error);
  }
};

export const signOutUser = async () => {
  const result = await signOut(auth);

  localStorage.clear();

  return result;
};

export const getCollections = async (user) => {
  try {
    const result = await get(child(ref(database), user));

    if (result.exists()) {
      return Object.entries(result.val()).map((el) => el[1]);
    }

    return [];
  } catch (error) {
    console.log("Error while getting collections: ", error);
  }
};

export const addCollection = async (user, name, description) => {
  try {
    await set(ref(database, user + "/" + name), {
      name,
      description,
      dateAdded: new Date().toDateString(),
    });

    return true;
  } catch (error) {
    console.log("Error while adding collection: ", error);
  }
};

export const getSingleCollection = async (user, name) => {
  try {
    const result = await get(child(ref(database), user + "/" + name));

    if (result.exists()) {
      return result.val();
    }

    return null;
  } catch (error) {
    console.log("Error while getting collections: ", error);
  }
};

export const addFileToStorage = async (user, id, file, cb) => {
  try {
    const storageRef = fRef(storage, `${user}/${id}/${file.name}`);
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
          cb(url, file.name);
        });
      }
    );
  } catch (error) {
    console.log("Error while adding file: ", error);
  }
};

export const updateCollection = async (user, id, data) => {
  const updates = {};

  updates[user + "/" + id] = data;

  try {
    await update(ref(database), updates);
  } catch (error) {
    console.log("Error while updating collection: ", error);
  }
};

export const removeCollection = async (user, id) => {
  try {
    await set(ref(database, user + "/" + id), null);

    return true;
  } catch (error) {
    console.log("Error while removing collection: ", error);
  }
};

export const removeAd = async (user, collection, image) => {
  try {
    const r = fRef(storage, user + "/" + collection + "/" + image);

    await deleteObject(r);

    return true;
  } catch (error) {
    console.log("Error while removing ad: ", error);
  }
};

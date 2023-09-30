import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ref, set, get, child, update } from "firebase/database";
import {
  uploadBytesResumable,
  getDownloadURL,
  ref as fRef,
  deleteObject,
} from "firebase/storage";

import { auth, database, storage } from "../api/fb";

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
  if (file.length) {
    const promises = [];
    const urls = [];

    file.forEach((image) => {
      const storageRef = fRef(storage, `${user}/${id}/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      promises.push(uploadTask);

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
            console.log("downloaded", url);
            cb(url, image.name);
          });
        }
      );
    });

    Promise.all(promises)
      .then(() => console.log("URLs from promises", urls))
      .catch(() => console.log("Error while uploading files"));
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

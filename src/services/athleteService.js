import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const athleteCollection = collection(db, "athletes");

export const addAthlete = async (athlete) => {
  await addDoc(athleteCollection, athlete);
};

export const getAthletes = async () => {
  const snapshot = await getDocs(athleteCollection);

  return snapshot.docs.map((document) => ({
    firestoreId: document.id,
    ...document.data(),
  }));
};

export const updateAthlete = async (id, athlete) => {
  await updateDoc(doc(db, "athletes", id), athlete);
};

export const deleteAthlete = async (id) => {
  await deleteDoc(doc(db, "athletes", id));
};
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const eventCollection = collection(db, "events");

export const addEvent = async (event) => {
  await addDoc(eventCollection, event);
};

export const getEvents = async () => {
  const snapshot = await getDocs(eventCollection);

  return snapshot.docs.map((document) => ({
    firestoreId: document.id,
    ...document.data(),
  }));
};

export const updateEvent = async (id, event) => {
  await updateDoc(doc(db, "events", id), event);
};

export const deleteEvent = async (id) => {
  await deleteDoc(doc(db, "events", id));
};
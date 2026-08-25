import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const scoreCollection = collection(db, "liveScores");

export const addScore = async (score) => {
  return await addDoc(scoreCollection, score);
};

export const subscribeScores = (callback) => {
  return onSnapshot(scoreCollection, (snapshot) => {
    const scores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(scores);
  });
};

export const updateScore = async (id, score) => {
  await updateDoc(doc(db, "liveScores", id), score);
};

export const deleteScore = async (id) => {
  await deleteDoc(doc(db, "liveScores", id));
};
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Community letters of support, one sub-collection per athlete:
//   letters/{athleteId}/messages/{messageId}

export function subscribeLetters(athleteId, onData, onError) {
  const ref = query(
    collection(db, "letters", String(athleteId), "messages"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    ref,
    (snap) => {
      onData(
        snap.docs
          // Admins can hide a letter from the moderation panel.
          .filter((d) => !d.data().hidden)
          .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text,
            authorName: data.authorName || "Anonymous",
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        })
      );
    },
    (err) => {
      console.error("Letters subscription failed:", err);
      if (onError) onError(err);
    }
  );
}

export async function addLetter(athleteId, { text, authorId, authorName }) {
  return addDoc(collection(db, "letters", String(athleteId), "messages"), {
    text: text.trim(),
    authorId,
    authorName: authorName || "Anonymous",
    createdAt: serverTimestamp(),
  });
}

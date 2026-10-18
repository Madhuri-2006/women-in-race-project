import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Admins are stored as admins/{lowercased email} → { role, addedBy, addedAt }.
// Keying on email lets a super admin grant access before the person has ever
// signed in. Firestore rules additionally require a verified email.

export async function getAdminRole(user) {
  // Rules only honour verified emails, so don't show the panel otherwise.
  if (!user?.email || !user.emailVerified) return null;
  try {
    const snap = await getDoc(doc(db, "admins", user.email.toLowerCase()));
    return snap.exists() ? snap.data().role || "admin" : null;
  } catch {
    return null;
  }
}

export async function listAdmins() {
  const snap = await getDocs(collection(db, "admins"));
  return snap.docs.map((d) => ({ email: d.id, ...d.data() }));
}

export async function setAdmin(email, role, addedBy) {
  await setDoc(doc(db, "admins", email.trim().toLowerCase()), {
    role,
    addedBy,
    addedAt: serverTimestamp(),
  });
}

export async function removeAdmin(email) {
  await deleteDoc(doc(db, "admins", email));
}

// ---- Activity log -------------------------------------------------------

export async function logAction(user, action, detail = "") {
  try {
    await addDoc(collection(db, "adminLog"), {
      action,
      detail,
      by: user?.email || "unknown",
      at: serverTimestamp(),
    });
  } catch (err) {
    // Logging must never block the actual admin action.
    console.warn("Could not write admin log:", err.code || err.message);
  }
}

export async function getRecentLog(max = 15) {
  const snap = await getDocs(
    query(collection(db, "adminLog"), orderBy("at", "desc"), limit(max))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, at: data.at?.toDate?.() ?? null };
  });
}

// ---- Dashboard counts ---------------------------------------------------

export async function countCollection(name) {
  try {
    const snap = await getCountFromServer(collection(db, name));
    return snap.data().count;
  } catch {
    return null;
  }
}

// ---- Letters moderation -------------------------------------------------
// Letters live at letters/{athleteId}/messages/{id}; a collection-group query
// pulls the newest across every athlete.

export async function getRecentLetters(max = 50) {
  const snap = await getDocs(
    query(collectionGroup(db, "messages"), orderBy("createdAt", "desc"), limit(max))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      path: d.ref.path,
      athleteId: d.ref.parent.parent?.id,
      text: data.text,
      authorName: data.authorName || "Anonymous",
      hidden: Boolean(data.hidden),
      createdAt: data.createdAt?.toDate?.() ?? null,
    };
  });
}

export async function setLetterHidden(path, hidden) {
  await updateDoc(doc(db, path), { hidden });
}

export async function deleteLetter(path) {
  await deleteDoc(doc(db, path));
}

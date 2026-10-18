import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Collections:
//   quizQuestions/{id}        admin-authored questions mixed into every quiz
//   quizScores/{date}_{uid}   one daily-challenge result per player per day
//   players/{uid}             running totals that power the all-time board

export const MAX_DAILY_SCORE = 2000; // 10 questions × (100 base + 100 speed bonus)

// ---- Custom questions (admin) --------------------------------------------

const questionCollection = collection(db, "quizQuestions");

export async function getQuizQuestions() {
  const snap = await getDocs(questionCollection);
  return snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
}

export async function addQuizQuestion(q) {
  await addDoc(questionCollection, q);
}

export async function updateQuizQuestion(id, q) {
  await updateDoc(doc(db, "quizQuestions", id), q);
}

export async function deleteQuizQuestion(id) {
  await deleteDoc(doc(db, "quizQuestions", id));
}

// ---- Daily results --------------------------------------------------------

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export async function getMyDailyResult(uid, date = todayKey()) {
  const snap = await getDoc(doc(db, "quizScores", `${date}_${uid}`));
  return snap.exists() ? snap.data() : null;
}

export async function getPlayer(uid) {
  const snap = await getDoc(doc(db, "players", uid));
  return snap.exists() ? snap.data() : null;
}

// Saves today's result and rolls it into the player's totals atomically, so
// a refresh mid-save can't double-count.
export async function submitDailyResult(user, { score, correct, total }) {
  const date = todayKey();
  const name = user.displayName || maskPhone(user.phoneNumber) || "Player";
  const scoreRef = doc(db, "quizScores", `${date}_${user.uid}`);
  const playerRef = doc(db, "players", user.uid);

  return runTransaction(db, async (tx) => {
    const existing = await tx.get(scoreRef);
    if (existing.exists()) return existing.data();

    const playerSnap = await tx.get(playerRef);
    const prev = playerSnap.exists() ? playerSnap.data() : null;
    const streak = prev?.lastPlayed === yesterdayKey() ? (prev.streak || 0) + 1 : 1;

    const result = {
      uid: user.uid,
      name,
      photoURL: user.photoURL || "",
      date,
      score,
      correct,
      total,
      createdAt: serverTimestamp(),
    };
    tx.set(scoreRef, result);
    tx.set(playerRef, {
      name,
      photoURL: user.photoURL || "",
      totalPoints: (prev?.totalPoints || 0) + score,
      gamesPlayed: (prev?.gamesPlayed || 0) + 1,
      bestScore: Math.max(prev?.bestScore || 0, score),
      streak,
      bestStreak: Math.max(prev?.bestStreak || 0, streak),
      lastPlayed: date,
    });
    return result;
  });
}

// ---- Leaderboards ---------------------------------------------------------

export async function getDailyLeaderboard(date = todayKey(), max = 10) {
  // Filter-only query (no composite index needed); sort client-side.
  const snap = await getDocs(query(collection(db, "quizScores"), where("date", "==", date)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

export async function getAllTimeLeaderboard(max = 10) {
  const snap = await getDocs(
    query(collection(db, "players"), orderBy("totalPoints", "desc"), limit(max))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---- Admin: remove a bad score --------------------------------------------

export async function deleteDailyResult(id) {
  await deleteDoc(doc(db, "quizScores", id));
}

export async function resetPlayer(uid) {
  await setDoc(doc(db, "players", uid), {
    totalPoints: 0,
    gamesPlayed: 0,
    bestScore: 0,
    streak: 0,
  }, { merge: true });
}

function maskPhone(phone) {
  if (!phone) return "";
  return `${phone.slice(0, 3)}•••••${phone.slice(-3)}`;
}

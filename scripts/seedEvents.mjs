// Wipes the "events" collection and re-seeds it cleanly from
// src/data/events.json, keyed by numeric id (deterministic doc IDs so this
// is always safe to re-run). The collection currently has ~20 duplicate
// docs from an old non-idempotent addDoc-based script — this replaces all
// of them.
//
// Usage: npm run seed:events

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const events = JSON.parse(
  readFileSync(path.join(__dirname, "..", "src", "data", "events.json"), "utf8")
);

async function run() {
  const existing = await getDocs(collection(db, "events"));
  console.log(`Deleting ${existing.size} existing event docs...`);
  for (const d of existing.docs) {
    await deleteDoc(doc(db, "events", d.id));
  }

  console.log(`Seeding ${events.length} events...`);
  for (const event of events) {
    await setDoc(doc(db, "events", String(event.id)), event);
    console.log(`  uploaded: ${event.title}`);
  }

  console.log("Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  if (err.code === "permission-denied") {
    console.error(
      "\nFirestore rules are blocking this write. Temporarily switch to a permissive rule, re-run this script, then restore the locked-down rules."
    );
  }
  process.exit(1);
});

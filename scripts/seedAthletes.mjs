// One-time / re-runnable seed script: uploads src/data/athletes.json into the
// Firestore "athletes" collection. Safe to re-run — each athlete is upserted
// by its numeric `id` field, so nothing gets duplicated.
//
// Usage: npm run seed:athletes
// (Firestore rules must temporarily allow writes to run this — see README.)

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error(
    "Missing Firebase env vars. Run this with: npm run seed:athletes (loads .env automatically)."
  );
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const athletes = JSON.parse(
  readFileSync(path.join(__dirname, "..", "src", "data", "athletes.json"), "utf8")
);

async function seed() {
  console.log(`Seeding ${athletes.length} athletes into Firestore ("athletes" collection)...`);

  for (const athlete of athletes) {
    await setDoc(doc(db, "athletes", String(athlete.id)), athlete);
    console.log(`  uploaded: ${athlete.name}`);
  }

  console.log(`Done. ${athletes.length} athletes are now in Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  if (err.code === "permission-denied") {
    console.error(
      "\nFirestore rules are blocking this write. Temporarily switch to a permissive rule, re-run this script, then restore the locked-down rules (see README)."
    );
  }
  process.exit(1);
});

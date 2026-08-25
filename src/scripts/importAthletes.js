import athletes from "../data/athletes.json";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

console.log(athletes);

async function uploadAthletes() {
  try {
    const athleteCollection = collection(db, "athletes");

    for (const athlete of athletes) {
      await addDoc(athleteCollection, athlete);
      console.log(`${athlete.name} uploaded`);
    }

    console.log("✅ All athletes uploaded");
  } catch (error) {
    console.error("Upload Error:", error);
  }
}

uploadAthletes();
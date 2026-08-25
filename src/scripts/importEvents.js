import events from "../data/events.json";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

async function uploadEvents() {
  const eventCollection = collection(db, "events");

  for (const event of events) {
    await addDoc(eventCollection, event);
    console.log(event.title + " uploaded");
  }

  console.log("All events uploaded.");
}

uploadEvents();
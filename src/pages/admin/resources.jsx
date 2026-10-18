// Field/column definitions for each collection the admin panel manages.
// Kept at module scope so the config objects (and their load functions)
// are stable between renders.

import { getAthletes, addAthlete, updateAthlete, deleteAthlete } from "../../services/athleteService";
import { getEvents, addEvent, updateEvent, deleteEvent } from "../../services/eventService";
import { addScore, updateScore, deleteScore } from "../../services/liveScoreService";
import {
  getQuizQuestions,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "../../services/quizService";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import localAthletes from "../../data/athletes.json";

const SPORTS = [...new Set(localAthletes.map((a) => a.sport))].sort();
const STATES = [...new Set(localAthletes.map((a) => a.state).filter(Boolean))].sort();

// Public pages route athletes/events by a numeric `id`; new records get the
// next free number so their links work immediately.
const nextId = (items) => Math.max(0, ...items.map((x) => Number(x.id) || 0)) + 1;

const toNum = (v) => (v === "" || v == null ? 0 : Number(v));

const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([k]) => k !== "firestoreId"));

// ---- Athletes --------------------------------------------------------------

const MEDAL_FIELDS = ["olympicMedals", "worldChampionships", "commonwealthMedals", "asianGamesMedals"];

export const athletesConfig = {
  title: "Athletes",
  singular: "Athlete",
  load: getAthletes,
  add: addAthlete,
  update: updateAthlete,
  remove: deleteAthlete,
  searchKeys: ["name", "sport", "state", "coach"],
  label: (a) => a.name,
  emptyForm: {
    name: "",
    sport: "",
    state: "",
    country: "India",
    birthDate: "",
    coach: "",
    image: "",
    imageCredit: "",
    bio: "",
    olympicMedals: 0,
    worldChampionships: 0,
    commonwealthMedals: 0,
    asianGamesMedals: 0,
  },
  fromForm: (form, items, isNew) => {
    const data = clean(form);
    MEDAL_FIELDS.forEach((k) => (data[k] = toNum(data[k])));
    if (isNew) data.id = nextId(items);
    return data;
  },
  fields: [
    { name: "name", label: "Full name", required: true },
    { name: "sport", label: "Sport", required: true, options: SPORTS },
    { name: "state", label: "State", required: true, options: STATES },
    { name: "country", label: "Country" },
    { name: "birthDate", label: "Birth date", type: "date" },
    { name: "coach", label: "Coach" },
    { name: "image", label: "Image file", placeholder: "e.g. 121.jpg", hint: "File in public/images/athletes/" },
    { name: "imageCredit", label: "Image credit" },
    { name: "olympicMedals", label: "Olympic medals", type: "number" },
    { name: "worldChampionships", label: "World Championship medals", type: "number" },
    { name: "commonwealthMedals", label: "Commonwealth medals", type: "number" },
    { name: "asianGamesMedals", label: "Asian Games medals", type: "number" },
    { name: "bio", label: "Biography", type: "textarea", full: true },
  ],
  columns: [
    {
      key: "image",
      label: "",
      render: (a) =>
        a.image ? (
          <img className="adm-thumb" src={`/images/athletes/${a.image}`} alt="" />
        ) : (
          <span className="adm-thumb fallback">{a.name?.charAt(0)}</span>
        ),
    },
    { key: "name", label: "Name", render: (a) => <a href={`/athletes/${a.id}`} target="_blank" rel="noreferrer">{a.name}</a> },
    { key: "sport", label: "Sport" },
    { key: "state", label: "State" },
    {
      key: "medals",
      label: "Medals (O/W/C/A)",
      render: (a) => (
        <span className="adm-mono">{MEDAL_FIELDS.map((k) => a[k] || 0).join(" / ")}</span>
      ),
    },
  ],
};

// ---- Events ----------------------------------------------------------------

export const eventsConfig = {
  title: "Events",
  singular: "Event",
  load: getEvents,
  add: addEvent,
  update: updateEvent,
  remove: deleteEvent,
  searchKeys: ["title", "location", "date"],
  label: (e) => e.title,
  emptyForm: { title: "", date: "", location: "", image: "", description: "", imageCredit: "" },
  fromForm: (form, items, isNew) => {
    const data = clean(form);
    if (isNew) data.id = nextId(items);
    return data;
  },
  fields: [
    { name: "title", label: "Title", required: true, full: true },
    { name: "date", label: "Date", required: true, placeholder: "15 August 2026" },
    { name: "location", label: "Location", required: true },
    { name: "image", label: "Image path", placeholder: "/images/events/marathon.jpg" },
    { name: "imageCredit", label: "Image credit" },
    { name: "description", label: "Description", type: "textarea", full: true },
  ],
  columns: [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
    { key: "location", label: "Location" },
  ],
};

// ---- Live scores -----------------------------------------------------------

const SCORE_STATUSES = ["Live", "Upcoming", "Finished"];

async function getScores() {
  const snap = await getDocs(collection(db, "liveScores"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function bump(item, side, ctx) {
  const key = side === "A" ? "scoreA" : "scoreB";
  const current = Number(item[key]);
  if (Number.isNaN(current)) return null;
  return (delta) => ctx.quickUpdate(item, { [key]: Math.max(0, current + delta) });
}

function ScoreCell({ item, side, ctx }) {
  const key = side === "A" ? "scoreA" : "scoreB";
  const change = bump(item, side, ctx);
  return (
    <span className="adm-score">
      {change && (
        <button type="button" className="adm-btn tiny ghost" onClick={() => change(-1)} aria-label="minus one">
          −
        </button>
      )}
      <span className="adm-mono">{String(item[key] ?? "")}</span>
      {change && (
        <button type="button" className="adm-btn tiny" onClick={() => change(1)} aria-label="plus one">
          +
        </button>
      )}
    </span>
  );
}

export const scoresConfig = {
  title: "Live Scores",
  singular: "Match",
  idKey: "id",
  load: getScores,
  add: addScore,
  update: updateScore,
  remove: deleteScore,
  searchKeys: ["event", "teamA", "teamB", "sport"],
  label: (s) => `${s.teamA} vs ${s.teamB}`,
  emptyForm: {
    sport: "Cricket",
    event: "",
    teamA: "",
    scoreA: "0",
    teamB: "",
    scoreB: "0",
    status: "Live",
    note: "",
    highlight: "",
  },
  toForm: (s) => ({ ...scoresConfig.emptyForm, ...s, scoreA: String(s.scoreA ?? ""), scoreB: String(s.scoreB ?? "") }),
  fromForm: (form) => {
    const data = { ...form };
    delete data.id;
    // Plain numbers stay numeric (enables +/− buttons); "247/6" stays text.
    ["scoreA", "scoreB"].forEach((k) => {
      const v = String(data[k]).trim();
      data[k] = /^\d+$/.test(v) ? Number(v) : v;
    });
    return data;
  },
  fields: [
    { name: "sport", label: "Sport", type: "select", options: SPORTS },
    { name: "status", label: "Status", type: "select", options: SCORE_STATUSES },
    { name: "event", label: "Event", required: true, full: true, placeholder: "India Women vs Australia Women — 3rd ODI" },
    { name: "teamA", label: "Team / player A", required: true },
    { name: "scoreA", label: "Score A", hint: "Number, or text like 247/6 (47.2 ov)" },
    { name: "teamB", label: "Team / player B", required: true },
    { name: "scoreB", label: "Score B" },
    { name: "note", label: "Status line / result", full: true, placeholder: "India won by 67 runs" },
    { name: "highlight", label: "Highlight", full: true, placeholder: "Smriti Mandhana 94 (88)" },
  ],
  columns: [
    { key: "sport", label: "Sport" },
    { key: "event", label: "Event" },
    { key: "teamA", label: "A" },
    { key: "scoreA", label: "Score A", render: (s, ctx) => <ScoreCell item={s} side="A" ctx={ctx} /> },
    { key: "scoreB", label: "Score B", render: (s, ctx) => <ScoreCell item={s} side="B" ctx={ctx} /> },
    { key: "teamB", label: "B" },
    {
      key: "status",
      label: "Status",
      render: (s, ctx) => (
        <select
          className={`adm-status ${String(s.status).toLowerCase()}`}
          value={s.status || "Live"}
          onChange={(e) => ctx.quickUpdate(s, { status: e.target.value }, `${s.teamA} vs ${s.teamB} → ${e.target.value}`)}
        >
          {SCORE_STATUSES.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ),
    },
  ],
};

// ---- Quiz questions --------------------------------------------------------

export const quizConfig = {
  title: "Quiz Questions",
  singular: "Question",
  load: getQuizQuestions,
  add: addQuizQuestion,
  update: updateQuizQuestion,
  remove: deleteQuizQuestion,
  searchKeys: ["question", "sport"],
  label: (q) => q.question,
  emptyForm: {
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "0",
    explanation: "",
    sport: "",
    athleteId: "",
    active: true,
  },
  toForm: (q) => ({
    ...quizConfig.emptyForm,
    ...q,
    option1: q.options?.[0] ?? "",
    option2: q.options?.[1] ?? "",
    option3: q.options?.[2] ?? "",
    option4: q.options?.[3] ?? "",
    answer: String(q.answer ?? 0),
    athleteId: q.athleteId ?? "",
  }),
  fromForm: (form) => {
    const raw = [form.option1, form.option2, form.option3, form.option4].map((o) => String(o ?? "").trim());
    const answerText = raw[Number(form.answer)];
    if (!answerText) throw new Error("The option marked correct can't be empty.");
    const options = raw.filter(Boolean);
    if (options.length < 2) throw new Error("Give at least two options.");
    return {
      question: form.question.trim(),
      options,
      answer: options.indexOf(answerText),
      explanation: form.explanation || "",
      sport: form.sport || "",
      athleteId: form.athleteId === "" ? null : Number(form.athleteId),
      active: Boolean(form.active),
    };
  },
  fields: [
    { name: "question", label: "Question", required: true, full: true, type: "textarea" },
    { name: "option1", label: "Option 1", required: true },
    { name: "option2", label: "Option 2", required: true },
    { name: "option3", label: "Option 3" },
    { name: "option4", label: "Option 4" },
    {
      name: "answer",
      label: "Correct option",
      type: "select",
      options: [0, 1, 2, 3].map((i) => ({ value: String(i), label: `Option ${i + 1}` })),
    },
    { name: "sport", label: "Sport (optional)", options: SPORTS, hint: "Used by practice-mode sport filter" },
    { name: "explanation", label: "Explanation shown after answering", full: true, type: "textarea" },
    { name: "athleteId", label: "Linked athlete ID (optional)", type: "number", hint: "Adds a 'Read her story' link" },
    { name: "active", label: "Active (include in quizzes)", type: "checkbox" },
  ],
  columns: [
    { key: "question", label: "Question" },
    { key: "answerText", label: "Answer", render: (q) => q.options?.[q.answer] ?? "—" },
    { key: "sport", label: "Sport", render: (q) => q.sport || "Any" },
    {
      key: "active",
      label: "Active",
      render: (q, ctx) => (
        <input
          type="checkbox"
          checked={q.active !== false}
          onChange={(e) => ctx.quickUpdate(q, { active: e.target.checked }, `${e.target.checked ? "Activated" : "Paused"}: ${q.question}`)}
        />
      ),
    },
  ],
};

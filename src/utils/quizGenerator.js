// Builds quiz questions from the athlete records. With the same seed (e.g.
// today's date) every player gets the identical set, which is what makes the
// daily leaderboard fair.
//
// Question shape:
//   { id, type, prompt, image?, options: string[], answer: number,
//     explanation, athleteId? }

function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

// mulberry32 — tiny, fast, good enough for shuffling quiz options.
export function seededRandom(seed) {
  let a = typeof seed === "number" ? seed : hashString(String(seed));
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

// Correct answer + up to 3 distinct distractors, shuffled.
function buildOptions(correct, pool, rand, count = 4) {
  const distractors = shuffle(
    [...new Set(pool)].filter((v) => v && v !== correct),
    rand
  ).slice(0, count - 1);
  const options = shuffle([correct, ...distractors], rand);
  return { options, answer: options.indexOf(correct) };
}

const totalMedals = (a) =>
  (Number(a.olympicMedals) || 0) +
  (Number(a.worldChampionships) || 0) +
  (Number(a.commonwealthMedals) || 0) +
  (Number(a.asianGamesMedals) || 0);

const GENERATORS = {
  photo(athletes, rand) {
    const withPhoto = athletes.filter((a) => a.image);
    if (withPhoto.length < 4) return null;
    const a = pick(withPhoto, rand);
    // Same-sport distractors make it a real test, not a guess by kit colour.
    const sameSport = athletes.filter((x) => x.sport === a.sport).map((x) => x.name);
    const pool = sameSport.length >= 4 ? sameSport : athletes.map((x) => x.name);
    return {
      type: "photo",
      prompt: "Who is this champion?",
      image: `/images/athletes/${a.image}`,
      ...buildOptions(a.name, pool, rand),
      explanation: `${a.name} — ${a.sport}, ${a.state}.`,
      athleteId: a.id,
    };
  },

  sport(athletes, rand) {
    const a = pick(athletes, rand);
    return {
      type: "sport",
      prompt: `Which sport does ${a.name} compete in?`,
      ...buildOptions(a.sport, athletes.map((x) => x.sport), rand),
      explanation: `${a.name} is a ${a.sport} athlete from ${a.state}.`,
      athleteId: a.id,
    };
  },

  state(athletes, rand) {
    const withState = athletes.filter((a) => a.state);
    const a = pick(withState, rand);
    return {
      type: "state",
      prompt: `Which state does ${a.name} hail from?`,
      ...buildOptions(a.state, withState.map((x) => x.state), rand),
      explanation: `${a.name} represents ${a.state}.`,
      athleteId: a.id,
    };
  },

  coach(athletes, rand) {
    const coached = athletes.filter((a) => a.coach);
    if (coached.length < 4) return null;
    const a = pick(coached, rand);
    return {
      type: "coach",
      prompt: `Who has coached ${a.name}?`,
      ...buildOptions(a.coach, coached.map((x) => x.coach), rand),
      explanation: `${a.coach} coached ${a.name} (${a.sport}).`,
      athleteId: a.id,
    };
  },

  medals(athletes, rand) {
    const a = pick(athletes, rand);
    const rivals = athletes.filter((x) => totalMedals(x) !== totalMedals(a) && x.id !== a.id);
    if (!rivals.length) return null;
    const b = pick(rivals, rand);
    const winner = totalMedals(a) > totalMedals(b) ? a : b;
    const options = shuffle([a.name, b.name], rand);
    return {
      type: "medals",
      prompt: "Who has won more major international medals?",
      options,
      answer: options.indexOf(winner.name),
      explanation: `${a.name}: ${totalMedals(a)} · ${b.name}: ${totalMedals(b)} (Olympics, Worlds, CWG and Asian Games combined).`,
      athleteId: winner.id,
    };
  },

  olympian(athletes, rand) {
    const medallists = athletes.filter((a) => Number(a.olympicMedals) > 0);
    const others = athletes.filter((a) => !Number(a.olympicMedals));
    if (!medallists.length || others.length < 3) return null;
    const a = pick(medallists, rand);
    const distractors = shuffle(others, rand).slice(0, 3).map((x) => x.name);
    const options = shuffle([a.name, ...distractors], rand);
    return {
      type: "olympian",
      prompt: "Which of these athletes is an Olympic medallist?",
      options,
      answer: options.indexOf(a.name),
      explanation: `${a.name} has ${a.olympicMedals} Olympic medal${a.olympicMedals > 1 ? "s" : ""} in ${a.sport}.`,
      athleteId: a.id,
    };
  },
};

const TYPE_ROTATION = ["photo", "sport", "medals", "state", "photo", "olympian", "coach", "sport", "photo", "medals"];

function fromCustom(q) {
  return {
    type: "custom",
    prompt: q.question,
    options: q.options,
    answer: Number(q.answer),
    explanation: q.explanation || "",
    athleteId: q.athleteId ? Number(q.athleteId) : undefined,
  };
}

/**
 * @param {object[]} athletes   athlete records
 * @param {object[]} custom     admin-authored questions (active ones are used)
 * @param {object}   opts       { seed, count, sport }
 */
export function generateQuiz(athletes, custom = [], { seed, count = 10, sport = "All" } = {}) {
  const rand = seededRandom(seed ?? Math.random() * 1e9);
  // Sort first so the same seed always sees the same order regardless of
  // what order Firestore returned the documents in.
  let pool = [...athletes].filter((a) => a.name && a.sport).sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  if (sport !== "All") {
    const filtered = pool.filter((a) => a.sport === sport);
    if (filtered.length >= 4) pool = filtered;
  }

  const customPool = shuffle(
    custom
      .filter((q) => q.active !== false && Array.isArray(q.options) && q.options.length >= 2)
      .filter((q) => sport === "All" || !q.sport || q.sport === sport)
      .sort((a, b) => String(a.firestoreId).localeCompare(String(b.firestoreId))),
    rand
  ).slice(0, Math.min(3, Math.floor(count / 3)));

  const questions = customPool.map(fromCustom);
  const seen = new Set();
  let attempts = 0;

  while (questions.length < count && attempts < count * 20) {
    // Walk the rotation one step per attempt, so a type that can't produce a
    // question (or a duplicate) just hands over to the next one.
    const type = TYPE_ROTATION[attempts % TYPE_ROTATION.length];
    attempts++;
    const q = GENERATORS[type](pool, rand);
    if (!q) continue;
    const key = `${q.type}:${q.prompt}:${q.options[q.answer]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    questions.push(q);
  }

  return shuffle(questions, rand).map((q, i) => ({ ...q, id: `${seed ?? "practice"}-${i}` }));
}

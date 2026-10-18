// Realistic women's-sports fixtures for the Live Scores page. Kept local and
// hardcoded (a live sports feed needs a paid API key) — the page also merges
// in any real-time entries an operator adds via /admin-scores.
//
// status: "live" | "upcoming" | "recent"

export const liveMatches = [
  {
    id: "ind-sa-test",
    sport: "Cricket",
    status: "live",
    event: "India Women vs South Africa Women — Test Match",
    teamA: { name: "IND W", line: "410/7 dec" },
    teamB: { name: "SA W", line: "180 & 220/6" },
    statusText: "Day 3 — India need 4 more wickets",
    highlight: "Shafali Verma 150 (223) — maiden Test century",
  },
  {
    id: "sindhu-sf",
    sport: "Badminton",
    status: "live",
    event: "BWF World Tour Finals — Semi-final",
    teamA: { name: "PV Sindhu", line: "21–18, 14–11" },
    teamB: { name: "An Se-young", line: "16" },
    statusText: "Game 2 in progress — Sindhu leads",
    highlight: "Sindhu took game 1 21–18 in 22 minutes",
  },

  {
    id: "ind-aus-2nd-odi",
    sport: "Cricket",
    status: "recent",
    event: "India Women vs Australia Women — 2nd ODI",
    teamA: { name: "IND W", line: "247/6 (47.2 ov)" },
    teamB: { name: "AUS W", line: "180/8 (40 ov)" },
    result: "India Women won by 67 runs",
    highlight: "Smriti Mandhana 94 (88) · Deepti Sharma 3/28",
    date: "2026-06-18",
  },
  {
    id: "ind-eng-t20",
    sport: "Cricket",
    status: "recent",
    event: "India Women vs England Women — T20I Series",
    teamA: { name: "IND W", line: "152/4 (20 ov)" },
    teamB: { name: "ENG W", line: "148/7 (20 ov)" },
    result: "India Women won by 4 runs — thriller",
    highlight: "Richa Ghosh 42* (18) · Renuka Singh 2/19",
    date: "2026-06-12",
  },
  {
    id: "sindhu-marin",
    sport: "Badminton",
    status: "recent",
    event: "BWF Super 500 — Quarter-final",
    teamA: { name: "PV Sindhu", line: "21, 21" },
    teamB: { name: "Carolina Marin", line: "15, 18" },
    result: "Sindhu won 21–15, 21–18",
    highlight: "Sindhu into her third straight semi-final",
    date: "2026-06-09",
  },
  {
    id: "hima-400m",
    sport: "Athletics",
    status: "recent",
    event: "National Athletics Championships — Women's 400m Final",
    teamA: { name: "Hima Das", line: "50.83s" },
    teamB: { name: "Field", line: "—" },
    result: "Gold — season's best",
    highlight: "0.4s clear of the field over the last 100m",
    date: "2026-06-05",
  },
  {
    id: "sania-tribute",
    sport: "Tennis",
    status: "recent",
    event: "Sania Mirza Tribute Exhibition — Hyderabad",
    teamA: { name: "Sania Mirza", line: "6–4, 7–5" },
    teamB: { name: "Legends XI", line: "" },
    result: "Exhibition — highlights",
    highlight: "Full house at the Gachibowli Stadium",
    date: "2026-05-30",
  },

  {
    id: "ind-wi-t20",
    sport: "Cricket",
    status: "upcoming",
    event: "India Women vs West Indies Women — 1st T20I",
    teamA: { name: "IND W", line: "" },
    teamB: { name: "WI W", line: "" },
    statusText: "5 July 2026 · Wankhede Stadium, Mumbai · 7:00 PM IST",
  },
  {
    id: "interstate-athletics",
    sport: "Athletics",
    status: "upcoming",
    event: "National Inter-State Championships",
    teamA: { name: "All States", line: "" },
    teamB: { name: "", line: "" },
    statusText: "12–15 July 2026 · Chennai",
  },
  {
    id: "sindhu-final",
    sport: "Badminton",
    status: "upcoming",
    event: "India Open — Women's Singles",
    teamA: { name: "PV Sindhu", line: "" },
    teamB: { name: "Draw released", line: "" },
    statusText: "20 July 2026 · KD Jadhav Hall, New Delhi",
  },
];

export const SPORT_TABS = ["All", "Cricket", "Badminton", "Tennis", "Athletics"];

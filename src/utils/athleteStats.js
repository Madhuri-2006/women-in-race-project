// Pure aggregation helpers over the athlete records that getAthletes()
// returns from Firestore. Used by the Gap Dashboard's live section and the
// India Map so both read from the same computed numbers.

export const MEDAL_FIELDS = [
  "olympicMedals",
  "worldChampionships",
  "commonwealthMedals",
  "asianGamesMedals",
];

export function totalMedals(athlete) {
  return MEDAL_FIELDS.reduce((sum, field) => sum + (Number(athlete[field]) || 0), 0);
}

export function countByState(athletes) {
  const map = {};
  for (const a of athletes) {
    if (!a.state) continue;
    map[a.state] = (map[a.state] || 0) + 1;
  }
  return Object.entries(map)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);
}

export function countBySport(athletes) {
  const map = {};
  for (const a of athletes) {
    const sport = a.sport || "Other";
    map[sport] = (map[sport] || 0) + 1;
  }
  return Object.entries(map)
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => b.count - a.count);
}

export function medalsBySport(athletes) {
  const map = {};
  for (const a of athletes) {
    const sport = a.sport || "Other";
    map[sport] = (map[sport] || 0) + totalMedals(a);
  }
  return Object.entries(map)
    .map(([sport, medals]) => ({ sport, medals }))
    .filter((row) => row.medals > 0)
    .sort((a, b) => b.medals - a.medals);
}

export function summaryMetrics(athletes) {
  const states = new Set(athletes.map((a) => a.state).filter(Boolean));
  const sports = new Set(athletes.map((a) => a.sport).filter(Boolean));
  const medals = athletes.reduce((sum, a) => sum + totalMedals(a), 0);
  return {
    athletes: athletes.length,
    states: states.size,
    sports: sports.size,
    medals,
  };
}

export function uniqueSports(athletes) {
  return [...new Set(athletes.map((a) => a.sport).filter(Boolean))].sort();
}

// Competition rank by total medals: 1 + number of athletes with strictly more.
function medalRank(athlete, pool) {
  const mine = totalMedals(athlete);
  return 1 + pool.filter((a) => totalMedals(a) > mine).length;
}

// Where one athlete stands against her sport and the full roster. Used by the
// athlete profile page.
export function athleteStanding(athlete, athletes) {
  const sportPeers = athletes.filter((a) => a.sport === athlete.sport);
  const statePeers = athletes.filter((a) => a.state && a.state === athlete.state);
  const sportMedals = sportPeers.reduce((sum, a) => sum + totalMedals(a), 0);

  return {
    total: totalMedals(athlete),
    sportRank: medalRank(athlete, sportPeers),
    sportCount: sportPeers.length,
    overallRank: medalRank(athlete, athletes),
    overallCount: athletes.length,
    sportAverage: sportPeers.length ? sportMedals / sportPeers.length : 0,
    shareOfSportMedals: sportMedals ? totalMedals(athlete) / sportMedals : 0,
    statePeerCount: statePeers.length,
  };
}

// Other athletes in the same sport, most decorated first.
export function relatedAthletes(athlete, athletes, limit = 4) {
  return athletes
    .filter((a) => a.sport === athlete.sport && a.id !== athlete.id)
    .sort((a, b) => totalMedals(b) - totalMedals(a))
    .slice(0, limit);
}

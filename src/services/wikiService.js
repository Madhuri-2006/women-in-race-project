// Fetches an athlete's backstory and physical stats from Wikipedia and
// Wikidata at view time, so every profile gets a full biography without us
// hand-maintaining one for all 120 athletes. Both APIs allow anonymous
// cross-origin requests (origin=*). Results are cached in localStorage for a
// week; the profile page still renders fully if any of this fails.

import athleteWikiTitles from "../data/athleteWikiTitles";

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const CACHE_PREFIX = "wir-wiki-v1:";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Used to confirm a fetched article is about this athlete and not a namesake.
const SPORT_KEYWORDS = {
  Badminton: /badminton/i,
  Athletics: /sprint|athlet|javelin|runner|hurdl|steeplechase|race walk|middle-distance|track and field/i,
  Boxing: /boxer|boxing/i,
  Wrestling: /wrestl/i,
  Weightlifting: /weightlift/i,
  Archery: /arch(er|ery)/i,
  "Table Tennis": /table[ -]tennis/i,
  Cricket: /cricket/i,
};

// Article sections that are reference lists rather than story.
const SKIPPED_SECTIONS = /^(references|external links|see also|notes|further reading|bibliography|sources|citations|footnotes)$/i;

const WIKIDATA_UNITS = {
  Q11573: "m",
  Q174728: "cm",
  Q11570: "kg",
};

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const { savedAt, value } = JSON.parse(raw);
    if (Date.now() - savedAt > CACHE_TTL_MS) return undefined;
    return value;
  } catch {
    return undefined;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ savedAt: Date.now(), value }));
  } catch {
    // Storage full or blocked: the profile just refetches next time.
  }
}

async function getJson(base, params) {
  const url = `${base}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wikipedia responded ${res.status}`);
  return res.json();
}

export function resolveWikiTitle(athlete) {
  if (Object.prototype.hasOwnProperty.call(athleteWikiTitles, athlete.id)) {
    return athleteWikiTitles[athlete.id];
  }
  if (athlete.imageSourceUrl?.includes("/wiki/")) {
    return decodeURIComponent(athlete.imageSourceUrl.split("/wiki/")[1]).replace(/_/g, " ");
  }
  return athlete.name;
}

// Splits a plaintext extract ("== Early life ==" style headings) into a lead
// paragraph block and a list of titled sections.
export function parseSections(extract) {
  const lines = extract.split("\n");
  const sections = [];
  let current = { title: null, level: 1, lines: [] };

  for (const line of lines) {
    const heading = line.match(/^(={2,})\s*(.+?)\s*\1$/);
    if (heading) {
      sections.push(current);
      current = { title: heading[2], level: heading[1].length, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  const toParagraphs = (sectionLines) =>
    sectionLines
      .join("\n")
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

  const [lead, ...rest] = sections;
  return {
    lead: toParagraphs(lead.lines),
    sections: rest
      .filter((s) => !SKIPPED_SECTIONS.test(s.title))
      .map((s) => ({ title: s.title, level: s.level, paragraphs: toParagraphs(s.lines) }))
      .filter((s) => s.paragraphs.length > 0 || s.level === 2),
  };
}

function quantity(claims, property) {
  const value = claims?.[property]?.[0]?.mainsnak?.datavalue?.value;
  if (!value?.amount) return null;
  const amount = Number(value.amount);
  const unit = WIKIDATA_UNITS[value.unit?.split("/").pop()] || "";
  if (unit === "m") return `${Math.round(amount * 100)} cm`;
  return `${amount} ${unit}`.trim();
}

function entityId(claims, property) {
  return claims?.[property]?.[0]?.mainsnak?.datavalue?.value?.id || null;
}

async function fetchWikidataFacts(qid) {
  const data = await getJson(WIKIDATA_API, {
    action: "wbgetentities",
    ids: qid,
    props: "claims",
  });
  const claims = data.entities?.[qid]?.claims;
  if (!claims) return {};

  const birthPlaceId = entityId(claims, "P19");
  const handednessId = entityId(claims, "P552");
  const labelIds = [birthPlaceId, handednessId].filter(Boolean);

  let labels = {};
  if (labelIds.length) {
    const labelData = await getJson(WIKIDATA_API, {
      action: "wbgetentities",
      ids: labelIds.join("|"),
      props: "labels",
      languages: "en",
    });
    labels = Object.fromEntries(
      Object.entries(labelData.entities || {}).map(([id, e]) => [id, e.labels?.en?.value])
    );
  }

  return {
    height: quantity(claims, "P2048"),
    weight: quantity(claims, "P2067"),
    birthPlace: labels[birthPlaceId] || null,
    handedness: labels[handednessId] || null,
  };
}

// Returns null when no trustworthy article exists for this athlete.
export async function getAthleteWikiProfile(athlete) {
  const title = resolveWikiTitle(athlete);
  if (!title) return null;

  const cacheKey = `${athlete.id}:${title}`;
  const cached = readCache(cacheKey);
  if (cached !== undefined) return cached;

  const data = await getJson(WIKI_API, {
    action: "query",
    prop: "extracts|pageprops|pageimages|info",
    explaintext: "1",
    exsectionformat: "wiki",
    inprop: "url",
    piprop: "thumbnail",
    pithumbsize: "600",
    pilicense: "free",
    redirects: "1",
    formatversion: "2",
    titles: title,
  });

  const page = data.query?.pages?.[0];
  const isArticle = page && !page.missing && page.extract && !page.pageprops?.disambiguation;
  const description = page?.pageprops?.["wikibase-shortdesc"] || "";
  const sportPattern = SPORT_KEYWORDS[athlete.sport];
  const matchesSport =
    !sportPattern || sportPattern.test(`${description} ${page?.extract?.slice(0, 800) || ""}`);

  if (!isArticle || !matchesSport) {
    writeCache(cacheKey, null);
    return null;
  }

  const qid = page.pageprops?.wikibase_item;
  const facts = qid ? await fetchWikidataFacts(qid).catch(() => ({})) : {};

  const profile = {
    title: page.title,
    url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    description,
    thumbnail: page.thumbnail?.source || null,
    facts,
    ...parseSections(page.extract),
  };

  writeCache(cacheKey, profile);
  return profile;
}

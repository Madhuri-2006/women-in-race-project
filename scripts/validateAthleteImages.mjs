// Safety net for fetchAthleteImages.mjs: Wikipedia search sometimes falls
// back to an unrelated person when there's no exact-match page. This checks
// every fetched image's source page title against the athlete's actual name
// and reverts anything that doesn't plausibly match (deletes the file,
// clears the image fields so the card falls back to the initials avatar).

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "src", "data", "athletes.json");
const IMAGES_DIR = path.join(__dirname, "..", "public", "images", "athletes");

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function pageTitleFromUrl(url) {
  const last = url.split("/wiki/")[1] || "";
  return decodeURIComponent(last).replace(/_/g, " ");
}

function isPlausibleMatch(athleteName, pageTitle) {
  const nameTokens = normalize(athleteName);
  const titleTokens = new Set(normalize(pageTitle));
  // Require the athlete's last name token (usually the most distinctive) to
  // appear somewhere in the matched page title.
  const lastToken = nameTokens[nameTokens.length - 1];
  if (!lastToken) return true;
  return titleTokens.has(lastToken);
}

const athletes = JSON.parse(readFileSync(DATA_PATH, "utf8"));
let reverted = 0;
let kept = 0;

for (const athlete of athletes) {
  if (!athlete.image || !athlete.imageSourceUrl) continue;

  const pageTitle = pageTitleFromUrl(athlete.imageSourceUrl);
  const ok = isPlausibleMatch(athlete.name, pageTitle);

  if (!ok) {
    console.log(`  reverting mismatch: "${athlete.name}" matched "${pageTitle}"`);
    const filePath = path.join(IMAGES_DIR, athlete.image);
    if (existsSync(filePath)) unlinkSync(filePath);
    delete athlete.image;
    delete athlete.imageCredit;
    delete athlete.imageSourceUrl;
    reverted++;
  } else {
    kept++;
  }
}

writeFileSync(DATA_PATH, JSON.stringify(athletes, null, 2) + "\n");

console.log(`\nDone. ${kept} images kept, ${reverted} mismatches reverted to initials avatar.`);

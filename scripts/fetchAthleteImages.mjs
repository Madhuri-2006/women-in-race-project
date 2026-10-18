// One-time / re-runnable: finds a real photo for each athlete via the
// Wikipedia/Wikimedia API, downloads it into public/images/athletes/, and
// writes image + attribution fields back into src/data/athletes.json.
//
// Usage: node scripts/fetchAthleteImages.mjs
// After running, push the updated data to Firestore with: npm run seed:athletes

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "src", "data", "athletes.json");
const IMAGES_DIR = path.join(__dirname, "..", "public", "images", "athletes");

const USER_AGENT = "WomenInRaceApp/1.0 (portfolio project; contact: arlochicken05@gmail.com)";
const DELAY_MS = 200;

mkdirSync(IMAGES_DIR, { recursive: true });

const athletes = JSON.parse(readFileSync(DATA_PATH, "utf8"));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findWikipediaImage(athlete) {
  const query = encodeURIComponent(`${athlete.name} ${athlete.sport} India`);
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}` +
    `&gsrlimit=1&prop=pageimages|info&piprop=thumbnail&pithumbsize=500&inprop=url&format=json&origin=*`;

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);

  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0];
  if (!page?.thumbnail?.source) return null;

  return {
    imageUrl: page.thumbnail.source,
    pageTitle: page.title,
    pageUrl: page.fullurl,
  };
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buffer);
}

function extensionFromUrl(url) {
  const match = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  return match ? `.${match[1].toLowerCase()}` : ".jpg";
}

async function run() {
  let found = 0;
  let missed = 0;

  for (const athlete of athletes) {
    try {
      const result = await findWikipediaImage(athlete);

      if (!result) {
        console.log(`  no image: ${athlete.name}`);
        // Clear any stale placeholder filename (e.g. "athlete-name.jpg") that
        // was never a real file, so this athlete correctly falls back to an
        // initials avatar instead of silently being treated as "has a photo".
        delete athlete.image;
        delete athlete.imageCredit;
        delete athlete.imageSourceUrl;
        missed++;
        await sleep(DELAY_MS);
        continue;
      }

      const ext = extensionFromUrl(result.imageUrl);
      const filename = `${athlete.id}${ext}`;
      await downloadImage(result.imageUrl, path.join(IMAGES_DIR, filename));

      athlete.image = filename;
      athlete.imageCredit = "Photo via Wikimedia Commons";
      athlete.imageSourceUrl = result.pageUrl;

      console.log(`  found: ${athlete.name} -> ${result.pageTitle}`);
      found++;
    } catch (err) {
      console.log(`  error: ${athlete.name} -> ${err.message}`);
      missed++;
    }

    await sleep(DELAY_MS);
  }

  writeFileSync(DATA_PATH, JSON.stringify(athletes, null, 2) + "\n");

  console.log(`\nDone. ${found} images found, ${missed} skipped (kept initials avatar).`);
  console.log("Next: run `npm run seed:athletes` to push these into Firestore.");
}

run();

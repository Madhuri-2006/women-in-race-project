// Fetches generic topical sports photos (not tied to a specific person) from
// Wikimedia Commons for the Gallery and Events pages, whose image assets
// never actually existed on disk.
//
// Usage: node scripts/fetchTopicalImages.mjs

import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_AGENT = "WomenInRaceApp/1.0 (portfolio project; contact: arlochicken05@gmail.com)";

const GALLERY_ITEMS = [
  { id: 1, title: "Badminton Championship", query: "badminton India" },
  { id: 2, title: "Women's Cricket Team", query: "cricket India women team" },
  { id: 3, title: "Athletics Meet", query: "athletics India women" },
  { id: 4, title: "Boxing Championship", query: "boxing women India" },
  { id: 5, title: "Archery Finals", query: "archery women India" },
  { id: 6, title: "Weightlifting Event", query: "weightlifting women India" },
];

const EVENT_ITEMS = [
  { id: "marathon", title: "National Women's Marathon", query: "marathon women India running" },
  { id: "badminton", title: "Women's Badminton Championship", query: "badminton India" },
  { id: "athletics", title: "National Athletics Meet", query: "athletics India women" },
];

const BITMAP_EXT = /\.(jpg|jpeg|png)$/i;

async function findCommonsImage(query) {
  // filetype:bitmap excludes scanned PDFs/DjVu documents, which Commons
  // otherwise happily returns (and thumbnails as a page-1 text scan).
  const q = encodeURIComponent(`${query} filetype:bitmap`);
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}` +
    `&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size&iiurlwidth=700&format=json&origin=*`;

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;

  const candidates = Object.values(pages).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  for (const page of candidates) {
    if (!BITMAP_EXT.test(page.title)) continue;
    const info = page.imageinfo?.[0];
    if (!info) continue;
    // Skip tiny icons/logos that sometimes sneak into results.
    if (info.width && info.width < 300) continue;
    return {
      imageUrl: info.thumburl || info.url,
      pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
    };
  }

  return null;
}

async function download(url, destPath) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
}

async function processSet(items, dirName) {
  const dir = path.join(__dirname, "..", "public", "images", dirName);
  mkdirSync(dir, { recursive: true });

  const results = [];
  for (const item of items) {
    try {
      const found = await findCommonsImage(item.query);
      if (!found) {
        console.log(`  [${dirName}] no image: ${item.title}`);
        results.push({ ...item, image: null });
        continue;
      }
      const filename = `${item.id}.jpg`;
      await download(found.imageUrl, path.join(dir, filename));
      console.log(`  [${dirName}] found: ${item.title}`);
      results.push({ ...item, image: filename, imageCredit: "Photo via Wikimedia Commons", imageSourceUrl: found.pageUrl });
    } catch (err) {
      console.log(`  [${dirName}] error: ${item.title} -> ${err.message}`);
      results.push({ ...item, image: null });
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return results;
}

const galleryResults = await processSet(GALLERY_ITEMS, "gallery");
const eventResults = await processSet(EVENT_ITEMS, "events");

writeFileSync(
  path.join(__dirname, "gallery-fetch-result.json"),
  JSON.stringify(galleryResults, null, 2)
);
writeFileSync(
  path.join(__dirname, "events-fetch-result.json"),
  JSON.stringify(eventResults, null, 2)
);

console.log("\nDone. Results written to scripts/gallery-fetch-result.json and scripts/events-fetch-result.json");

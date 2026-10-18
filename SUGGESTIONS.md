# Women In Race — Ideas to Develop Further

Grouped by effort. Everything in the resume bullets is now implemented; this is
what would take the portal from "complete" to "impressive".

## Quick wins (a few hours each)

- **Bookmarks / favourites.** `AuthContext` and the Firestore rules already
  support `users/{uid}/bookmarks`. Add a heart button on `AthleteCard` that
  writes there, and a "My Champions" page that reads them back. This closes the
  last unbuilt item from the original project spec.
- **Athlete journey timeline + medals tabs.** The profile page is a flat list of
  fields. Split it into Journey (vertical timeline), Medals (grid), Story
  (background / struggles), and Letters tabs — the spec's intended layout.
- **Protect the admin routes.** `/admin-scores` and `/athlete-manager` are open
  to anyone. Add a `ProtectedRoute` wrapper plus an `admins` list in Firestore
  and gate writes on it in the rules (`request.auth.uid in ...`).
- **Share buttons everywhere.** The Gap Dashboard and Inspire result already copy
  to clipboard; add the same to athlete profiles and the map's state panel.
- **Loading skeletons.** Replace "Loading…" text with card-shaped skeletons on
  the Athletes grid, Gap Dashboard, and Map.
- **Dark-theme the remaining light pages.** Athletes, Athlete Detail, Events,
  Gallery, Inspire's browse link, Admin — these still use the old pink-on-white
  look while the flagship pages are navy/magenta. Unify on the design system.

## Medium (a day or two each)

- **Move the Claude call server-side.** `inspireService.js` calls the Anthropic
  API from the browser with a client-visible key. Put it behind a Firebase
  Cloud Function or a Vercel edge function; the front-end calls your endpoint,
  the key stays server-side. The curated fallback stays as the offline path.
- **Real geo-aware map.** Right now the map colours states by athlete count.
  Add per-athlete `hometown` lat/long (many are already in the data as text)
  and drop point markers, then cluster them — a genuine "processing geographic
  datasets" story.
- **Gap Dashboard filters.** Let the user filter the live section by sport or by
  decade and watch every chart recompute — makes the "comparison views" claim
  concrete and interactive.
- **Achievements feed.** A chronological `/achievements` page (Firestore
  `achievements` collection: athlete, sport, achievement, date, importance) with
  sport filters and a "latest 3" preview on the home page.
- **Community letters moderation + home preview.** Show the 2 most recent public
  letters on the landing page, and give admins a soft-delete flag
  (`hidden: true`) rather than the current write-once rule.
- **Search & filter on the Athletes page that actually uses the URL.** Sync the
  sport filter and search box to query params so results are shareable /
  linkable (`/athletes?sport=Boxing&q=mary`).

## Larger / portfolio-defining

- **Actual live sports data.** Swap the hardcoded `liveMatches.js` for a real
  feed — CricAPI (cricket), or scrape BWF / World Athletics results on a
  schedule into Firestore with a scheduled Cloud Function. The UI is already
  built for it; only the data source changes.
- **"Compare two athletes" view.** Pick any two athletes and see medals,
  timeline, and endorsements side by side — a natural extension of the Gap
  Dashboard's comparison framing.
- **Data quality pass on the athlete records.** Fill in real `bio`, `journey`
  timelines, `quote`, and `struggles` for the top ~30 athletes so the profile
  pages and the Inspire context are richer than one-line bios.
- **Analytics.** Add a lightweight event log (Firestore or Plausible) for
  "champion matched", "letter sent", "state opened" — then surface it on an
  internal dashboard. Shows you can instrument a product, not just build one.
- **PWA + offline.** The map GeoJSON, athlete data, and images are all static or
  cacheable. A service worker would make the whole portal work offline and
  installable.
- **Accessibility & i18n.** Keyboard navigation for the map, ARIA labels on the
  charts, and a Hindi language toggle — meaningful for the actual audience this
  project is about.

## Housekeeping

- Bundle is ~1.4 MB (Recharts + Firebase + react-simple-maps). Code-split the
  route pages with `React.lazy` so the landing page loads light.
- `react-simple-maps` is pinned via `--legacy-peer-deps` (no official React 19
  support). Watch for a v4, or migrate the map to `react-leaflet`.
- Add a `firebase.json` + `firestore.rules` deploy config so rules are version
  controlled and pushed with `firebase deploy`, instead of pasted into the
  console.

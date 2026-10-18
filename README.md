# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Daily Quiz Arena (`/quiz`)

A daily 10-question challenge built from the athlete records. Everyone gets the
same questions on the same day (seeded by date), each question has a 15-second
clock, and faster answers score more (max 2,000/day).

- **Daily Challenge.** One attempt per day. Signed-in players get their result
  saved to `quizScores/{date}_{uid}` and rolled into `players/{uid}` (total
  points, streak, best day).
- **Practice.** Unlimited random rounds, optionally filtered by sport.
- **Leaderboards.** Today and all-time.
- **Learning loop.** Each answer links to the athlete's profile. Results can be
  shared as an emoji grid.
- Admin-written questions (`quizQuestions`) are mixed in, up to 3 per day.

## Admin panel (`/admin`)

Sign in at **`/admin/login`** with Google or email/password. Sections:

| Section     | What admins can do                                               |
|-------------|------------------------------------------------------------------|
| Dashboard   | Content/engagement counts, quick actions, recent admin activity  |
| Athletes    | Search, add, edit, delete athlete profiles                       |
| Events      | Add, edit, delete events                                         |
| Live Scores | Add matches, +/− scores inline, switch Live/Upcoming/Finished    |
| Quiz        | Write/pause custom questions; remove bad scores, reset players   |
| Letters     | Hide/restore or delete community letters                         |
| Admins      | (super admin only) grant/revoke admin access by email            |

Every change is written to `adminLog` and shown on the dashboard.

### Roles and security

Roles live in Firestore at `admins/{lowercased email}` → `{ role: "admin" | "superadmin" }`.
`firestore.rules` enforces them: content collections are public-read but
admin-write, and the account must have a **verified** email. The `/admin` route
guard only handles the UI. The rules are the real protection.

### One-time setup

1. **Firebase Console → Authentication → Sign-in method**: enable *Email/Password*
   (Google is already enabled).
2. Create your admin account: either sign in once with Google, or add a user
   under *Authentication → Users* (email/password accounts must verify their
   email; the admin login page has a "resend verification" button).
3. **Firestore → Data**: create collection `admins`, document ID = your email in
   lowercase, field `role` (string) = `superadmin`.
4. Publish the rules: paste `firestore.rules` into *Firestore → Rules*, or run
   `firebase deploy --only firestore:rules`.
5. Open `/admin/login`. From then on, add other admins from **Admin → Admins**.

The Letters moderation queue uses a collection-group query. The first time you
open it, Firestore may ask for an index. Click the link in the browser console
to create it.

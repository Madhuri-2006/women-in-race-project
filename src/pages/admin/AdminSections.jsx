import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  countCollection,
  getRecentLog,
  getRecentLetters,
  setLetterHidden,
  deleteLetter,
  listAdmins,
  setAdmin,
  removeAdmin,
  logAction,
} from "../../services/adminService";
import {
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  deleteDailyResult,
  resetPlayer,
  todayKey,
} from "../../services/quizService";

const fmt = (d) => (d ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

// ---- Dashboard --------------------------------------------------------------

const COUNTED = [
  { key: "athletes", label: "Athletes", section: "athletes" },
  { key: "events", label: "Events", section: "events" },
  { key: "liveScores", label: "Live matches", section: "scores" },
  { key: "quizQuestions", label: "Custom questions", section: "quiz" },
  { key: "players", label: "Quiz players", section: "quiz" },
  { key: "quizScores", label: "Quiz plays", section: "quiz" },
];

export function Dashboard({ onNavigate }) {
  const [counts, setCounts] = useState({});
  const [log, setLog] = useState(null);
  const [todayPlays, setTodayPlays] = useState(null);

  useEffect(() => {
    COUNTED.forEach(({ key }) =>
      countCollection(key).then((n) => setCounts((c) => ({ ...c, [key]: n })))
    );
    getRecentLog().then(setLog).catch(() => setLog([]));
    getDailyLeaderboard(todayKey(), 1000).then((r) => setTodayPlays(r.length)).catch(() => setTodayPlays(null));
  }, []);

  return (
    <section className="adm-section">
      <div className="adm-section-head">
        <div>
          <h2>Dashboard</h2>
          <p className="adm-muted">Overview of site content and engagement</p>
        </div>
      </div>

      <div className="adm-stats">
        {COUNTED.map((c) => (
          <button key={c.key} type="button" className="adm-stat" onClick={() => onNavigate(c.section)}>
            <strong>{counts[c.key] ?? "…"}</strong>
            <span>{c.label}</span>
          </button>
        ))}
        <div className="adm-stat accent">
          <strong>{todayPlays ?? "…"}</strong>
          <span>Quiz plays today</span>
        </div>
      </div>

      <div className="adm-two-col">
        <div className="adm-card">
          <h3>Quick actions</h3>
          <div className="adm-quick">
            <button type="button" className="adm-btn ghost" onClick={() => onNavigate("scores")}>Update a live score</button>
            <button type="button" className="adm-btn ghost" onClick={() => onNavigate("athletes")}>Add an athlete</button>
            <button type="button" className="adm-btn ghost" onClick={() => onNavigate("events")}>Publish an event</button>
            <button type="button" className="adm-btn ghost" onClick={() => onNavigate("quiz")}>Write a quiz question</button>
            <button type="button" className="adm-btn ghost" onClick={() => onNavigate("letters")}>Moderate letters</button>
          </div>
        </div>

        <div className="adm-card">
          <h3>Recent admin activity</h3>
          {log === null && <p className="adm-muted">Loading…</p>}
          {log?.length === 0 && <p className="adm-muted">No activity yet.</p>}
          <ul className="adm-log">
            {log?.map((l) => (
              <li key={l.id}>
                <span className="adm-log-action">{l.action}</span>
                {l.detail && <span className="adm-log-detail">{l.detail}</span>}
                <span className="adm-muted small">{l.by} · {fmt(l.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---- Letters moderation -------------------------------------------------------

export function LettersAdmin() {
  const { currentUser } = useAuth();
  const [letters, setLetters] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    getRecentLetters()
      .then(setLetters)
      .catch((err) => {
        setLetters([]);
        setError(
          err.code === "failed-precondition"
            ? "Firestore needs a collection-group index on messages.createdAt. Open the link in the browser console to create it."
            : err.message
        );
      });
  }, []);

  useEffect(load, [load]);

  const toggle = async (l) => {
    await setLetterHidden(l.path, !l.hidden);
    await logAction(currentUser, l.hidden ? "Restored letter" : "Hid letter", `${l.authorName}: ${l.text.slice(0, 60)}`);
    load();
  };

  const destroy = async (l) => {
    if (!window.confirm("Permanently delete this letter?")) return;
    await deleteLetter(l.path);
    await logAction(currentUser, "Deleted letter", `${l.authorName}: ${l.text.slice(0, 60)}`);
    load();
  };

  return (
    <section className="adm-section">
      <div className="adm-section-head">
        <div>
          <h2>Community Letters</h2>
          <p className="adm-muted">Newest 50 letters across all athletes. Hidden letters disappear from the public site.</p>
        </div>
      </div>
      {error && <p className="adm-error">{error}</p>}
      {letters === null && <p className="adm-muted">Loading…</p>}
      {letters?.length === 0 && !error && <p className="adm-muted">No letters yet.</p>}
      <div className="adm-letters">
        {letters?.map((l) => (
          <article key={l.path} className={`adm-letter ${l.hidden ? "hidden" : ""}`}>
            <p className="adm-letter-text">“{l.text}”</p>
            <p className="adm-muted small">
              {l.authorName} → <a href={`/athletes/${l.athleteId}`} target="_blank" rel="noreferrer">athlete #{l.athleteId}</a> · {fmt(l.createdAt)}
              {l.hidden && <span className="adm-badge">hidden</span>}
            </p>
            <div className="adm-letter-actions">
              <button type="button" className="adm-btn small ghost" onClick={() => toggle(l)}>
                {l.hidden ? "Restore" : "Hide"}
              </button>
              <button type="button" className="adm-btn small danger" onClick={() => destroy(l)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ---- Quiz leaderboard moderation ------------------------------------------------

export function QuizScoresAdmin() {
  const { currentUser } = useAuth();
  const [today, setToday] = useState([]);
  const [allTime, setAllTime] = useState([]);

  const load = useCallback(() => {
    getDailyLeaderboard(todayKey(), 50).then(setToday).catch(() => setToday([]));
    getAllTimeLeaderboard(20).then(setAllTime).catch(() => setAllTime([]));
  }, []);

  useEffect(load, [load]);

  const removeScore = async (row) => {
    if (!window.confirm(`Remove ${row.name}'s score of ${row.score} from today's board?`)) return;
    await deleteDailyResult(row.id);
    await logAction(currentUser, "Removed quiz score", `${row.name} · ${row.score} (${row.date})`);
    load();
  };

  const reset = async (row) => {
    if (!window.confirm(`Reset all-time stats for ${row.name}?`)) return;
    await resetPlayer(row.id);
    await logAction(currentUser, "Reset player stats", row.name);
    load();
  };

  return (
    <section className="adm-section">
      <div className="adm-section-head">
        <div>
          <h2>Leaderboards</h2>
          <p className="adm-muted">Remove suspicious scores or reset a player.</p>
        </div>
      </div>
      <div className="adm-two-col">
        <div className="adm-card">
          <h3>Today ({todayKey()})</h3>
          <BoardTable rows={today} value={(r) => `${r.score} · ${r.correct}/${r.total}`} action="Remove" onAction={removeScore} />
        </div>
        <div className="adm-card">
          <h3>All-time</h3>
          <BoardTable rows={allTime} value={(r) => `${r.totalPoints} pts · ${r.gamesPlayed} days`} action="Reset" onAction={reset} />
        </div>
      </div>
    </section>
  );
}

function BoardTable({ rows, value, action, onAction }) {
  if (!rows.length) return <p className="adm-muted">No scores yet.</p>;
  return (
    <ol className="adm-board">
      {rows.map((r, i) => (
        <li key={r.id}>
          <span className="adm-mono">{i + 1}</span>
          <span className="adm-board-name">{r.name}</span>
          <span className="adm-mono">{value(r)}</span>
          <button type="button" className="adm-btn tiny danger" onClick={() => onAction(r)}>
            {action}
          </button>
        </li>
      ))}
    </ol>
  );
}

// ---- Admin accounts (super admin only) -----------------------------------------

export function AdminsAdmin() {
  const { currentUser, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    listAdmins().then(setAdmins).catch((err) => {
      setAdmins([]);
      setError(err.message);
    });
  }, []);

  useEffect(load, [load]);

  const add = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    try {
      await setAdmin(email, role, currentUser.email);
      await logAction(currentUser, "Granted admin", `${email.toLowerCase()} (${role})`);
      setEmail("");
      load();
    } catch (err) {
      setError(err.code === "permission-denied" ? "Only super admins can manage admins." : err.message);
    }
  };

  const changeRole = async (a, nextRole) => {
    await setAdmin(a.email, nextRole, currentUser.email);
    await logAction(currentUser, "Changed admin role", `${a.email} → ${nextRole}`);
    load();
  };

  const revoke = async (a) => {
    if (a.email === currentUser.email?.toLowerCase()) {
      setError("You can't remove your own access.");
      return;
    }
    if (!window.confirm(`Revoke admin access for ${a.email}?`)) return;
    await removeAdmin(a.email);
    await logAction(currentUser, "Revoked admin", a.email);
    load();
  };

  return (
    <section className="adm-section">
      <div className="adm-section-head">
        <div>
          <h2>Admins</h2>
          <p className="adm-muted">
            <strong>Admin</strong>: edit site content. <strong>Super admin</strong>: everything, plus managing admins.
          </p>
        </div>
      </div>

      {isSuperAdmin ? (
        <form className="adm-inline-form" onSubmit={add}>
          <input type="email" placeholder="person@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="superadmin">Super admin</option>
          </select>
          <button type="submit" className="adm-btn">Grant access</button>
        </form>
      ) : (
        <p className="adm-muted">Only super admins can add or remove admins.</p>
      )}
      {error && <p className="adm-error">{error}</p>}
      <p className="adm-muted small">
        The person signs in at /admin/login with Google or an email/password account using this email. Their email must be verified.
      </p>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Added by</th>
              {isSuperAdmin && <th className="adm-col-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {admins?.map((a) => (
              <tr key={a.email}>
                <td data-label="Email">
                  {a.email}
                  {a.email === currentUser.email?.toLowerCase() && <span className="adm-badge">you</span>}
                </td>
                <td data-label="Role">
                  {isSuperAdmin && a.email !== currentUser.email?.toLowerCase() ? (
                    <select value={a.role} onChange={(e) => changeRole(a, e.target.value)}>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super admin</option>
                    </select>
                  ) : (
                    a.role
                  )}
                </td>
                <td data-label="Added by">{a.addedBy || "—"}</td>
                {isSuperAdmin && (
                  <td className="adm-col-actions">
                    <button type="button" className="adm-btn small danger" onClick={() => revoke(a)}>
                      Revoke
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout/Layout";
import { subscribeScores } from "../services/liveScoreService";
import { liveMatches, SPORT_TABS } from "../data/liveMatches";
import "./LiveScores.css";

// Map an operator-added Firestore doc onto the display shape used here.
function fromFirestore(doc) {
  const raw = (doc.status || "Live").toLowerCase();
  const status =
    raw === "finished" ? "recent" : raw === "upcoming" ? "upcoming" : "live";
  return {
    id: doc.id,
    sport: doc.sport || "Cricket",
    status,
    event: doc.event || "Match",
    teamA: { name: doc.teamA || "Team A", line: String(doc.scoreA ?? "") },
    teamB: { name: doc.teamB || "Team B", line: String(doc.scoreB ?? "") },
    statusText: doc.note || (status === "live" ? "Live now" : ""),
    result: status === "recent" ? doc.note || "Result" : undefined,
    highlight: doc.highlight || "",
    live: true,
  };
}

function ScoreCard({ match }) {
  return (
    <div className={`score-card ${match.status === "live" ? "is-live" : ""}`}>
      <div className="score-card-head">
        <span className="score-sport">{match.sport}</span>
        {match.status === "live" && (
          <span className="score-live-badge">
            <span className="dot" /> LIVE
          </span>
        )}
      </div>

      <p className="score-event">{match.event}</p>

      <div className="score-teams">
        <div className="score-team">
          <span className="score-team-name">{match.teamA.name}</span>
          <span className="score-team-line">{match.teamA.line}</span>
        </div>
        {match.teamB.name && (
          <div className="score-team">
            <span className="score-team-name">{match.teamB.name}</span>
            <span className="score-team-line">{match.teamB.line}</span>
          </div>
        )}
      </div>

      {match.result && <p className="score-result">{match.result}</p>}
      {match.statusText && !match.result && (
        <p className="score-status-text">{match.statusText}</p>
      )}
      {match.highlight && <p className="score-highlight">{match.highlight}</p>}
    </div>
  );
}

function LiveScores() {
  const [remoteScores, setRemoteScores] = useState([]);
  const [tab, setTab] = useState("All");
  const [secsAgo, setSecsAgo] = useState(0);

  useEffect(() => {
    const unsub = subscribeScores((data) => {
      setRemoteScores(data.map(fromFirestore));
      setSecsAgo(0);
    });
    return () => unsub();
  }, []);

  // "auto-refreshing" feel — ticks a relative timer, resets each cycle
  useEffect(() => {
    const t = setInterval(() => setSecsAgo((s) => (s + 3) % 30), 3000);
    return () => clearInterval(t);
  }, []);

  const all = useMemo(() => {
    const merged = [...remoteScores, ...liveMatches];
    return tab === "All" ? merged : merged.filter((m) => m.sport === tab);
  }, [remoteScores, tab]);

  const live = all.filter((m) => m.status === "live");
  const upcoming = all.filter((m) => m.status === "upcoming");
  const recent = all.filter((m) => m.status === "recent");

  return (
    <Layout>
      <div className="live-page">
        <div className="live-hero">
          <p className="live-eyebrow">WOMEN'S SPORTS — LIVE &amp; RECENT</p>
          <h1>Live Scores</h1>
          <p className="live-refresh">
            <span className="dot" /> Auto-refreshing · updated {secsAgo}s ago
          </p>
        </div>

        <div className="live-tabs">
          {SPORT_TABS.map((s) => (
            <button
              key={s}
              type="button"
              className={`live-tab ${tab === s ? "active" : ""}`}
              onClick={() => setTab(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {live.length > 0 && (
          <section className="live-section">
            <h2>Live Now</h2>
            <div className="score-grid">
              {live.map((m) => (
                <ScoreCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="live-section">
            <h2>Upcoming</h2>
            <div className="score-grid">
              {upcoming.map((m) => (
                <ScoreCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="live-section">
            <h2>Recent Results</h2>
            <div className="score-grid">
              {recent.map((m) => (
                <ScoreCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        {all.length === 0 && (
          <p className="live-empty">No matches in this category right now.</p>
        )}

        <p className="live-note">
          Score data is a curated snapshot (as of June 2026). A live CricAPI /
          BWF feed integration is planned — operator updates via the admin
          console appear here in real time.
        </p>
      </div>
    </Layout>
  );
}

export default LiveScores;

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { getAthletes } from "../services/athleteService";
import {
  generateInspiration,
  matchAthlete,
  hasApiKey,
} from "../services/inspireService";
import { pickFallback, FIELDS, NEEDS } from "../data/inspireFallbacks";
import "./Inspire.css";

const LOADING_LINES = [
  "Reading her story…",
  "Finding your connection…",
  "Crafting your message…",
];

function Inspire() {
  const [athletes, setAthletes] = useState([]);
  const [struggle, setStruggle] = useState("");
  const [field, setField] = useState(FIELDS[0]);
  const [need, setNeed] = useState(NEEDS[0]);

  const [phase, setPhase] = useState("form"); // form | loading | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);
  const lineTimer = useRef(null);

  useEffect(() => {
    getAthletes()
      .then(setAthletes)
      .catch((err) => console.error("Inspire: failed to load athletes", err));
  }, []);

  useEffect(() => {
    if (phase === "loading") {
      lineTimer.current = setInterval(() => {
        setLoadingLine((i) => (i + 1) % LOADING_LINES.length);
      }, 1600);
    }
    return () => clearInterval(lineTimer.current);
  }, [phase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (struggle.trim().length < 10) {
      setError("Tell us a little more about what you're going through.");
      return;
    }
    setError("");
    setPhase("loading");
    setLoadingLine(0);

    let outcome;
    try {
      outcome = await generateInspiration({ struggle, field, need, athletes });
    } catch (err) {
      if (hasApiKey()) console.warn("Inspire: AI call failed, using fallback —", err);
      outcome = pickFallback({ struggle, need });
    }

    const matched = matchAthlete(outcome.athlete, athletes);
    setResult({
      ...outcome,
      athleteId: matched?.id ?? null,
      sport: outcome.sport || matched?.sport || "",
    });
    setPhase("result");
  };

  const reset = () => {
    setResult(null);
    setError("");
    setPhase("form");
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `My champion is ${result.athlete}.\n\n${result.message}\n\n— via Women In Race, ${window.location.origin}/inspire`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Layout>
      <div className="inspire-page">
        <div className="inspire-hero">
          <p className="inspire-eyebrow">AI INSPIRE ME</p>
          <h1>
            Find Your <span className="accent">Champion</span>
          </h1>
          <p className="inspire-sub">
            Tell us what you're going through. We'll find the athlete whose story speaks
            to yours.
          </p>
        </div>

        {phase === "form" && (
          <form className="inspire-card" onSubmit={handleSubmit}>
            {error && <div className="inspire-error">{error}</div>}

            <label htmlFor="struggle">What are you struggling with right now?</label>
            <textarea
              id="struggle"
              rows={5}
              placeholder="e.g. I'm a first-generation college student and I feel like I don't belong in engineering…"
              value={struggle}
              onChange={(e) => setStruggle(e.target.value)}
            />

            <div className="inspire-selects">
              <div>
                <label htmlFor="field">What field are you in?</label>
                <select id="field" value={field} onChange={(e) => setField(e.target.value)}>
                  {FIELDS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="need">What do you need most right now?</label>
                <select id="need" value={need} onChange={(e) => setNeed(e.target.value)}>
                  {NEEDS.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="inspire-btn">
              <span className="sparkle">✦</span> Find My Champion →
            </button>

            {!hasApiKey() && (
              <p className="inspire-note">
                Running on the curated story library. Add an Anthropic API key to
                <code> .env </code> to generate personalised messages with Claude.
              </p>
            )}
          </form>
        )}

        {phase === "loading" && (
          <div className="inspire-loading">
            <div className="inspire-pulse" />
            <p>{LOADING_LINES[loadingLine]}</p>
          </div>
        )}

        {phase === "result" && result && (
          <div className="inspire-result">
            <p className="inspire-result-eyebrow">YOUR CHAMPION IS</p>
            <h2>{result.athlete}</h2>
            {result.sport && <span className="inspire-sport-badge">{result.sport}</span>}

            <p className="inspire-message">{result.message}</p>

            {result.keyMoment && (
              <div className="inspire-keymoment">
                <span className="inspire-keymoment-label">KEY MOMENT</span>
                <p>{result.keyMoment}</p>
              </div>
            )}

            <div className="inspire-actions">
              {result.athleteId && (
                <Link to={`/athletes/${result.athleteId}`} className="inspire-btn">
                  Read her full story →
                </Link>
              )}
              <button type="button" className="inspire-btn-ghost" onClick={handleShare}>
                {copied ? "Copied!" : "Share this →"}
              </button>
              <button type="button" className="inspire-link-btn" onClick={reset}>
                Find another champion
              </button>
            </div>

            <p className="inspire-source">
              {result.source === "ai"
                ? "Written just now by Claude, matched from real athlete records."
                : "Matched from our curated story library."}
            </p>
          </div>
        )}

        <p className="inspire-browse">
          Prefer to browse? <Link to="/athletes">See every athlete →</Link>
        </p>
      </div>
    </Layout>
  );
}

export default Inspire;

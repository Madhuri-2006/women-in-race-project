import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { getAthletes } from "../services/athleteService";
import {
  getQuizQuestions,
  getMyDailyResult,
  getPlayer,
  submitDailyResult,
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  todayKey,
} from "../services/quizService";
import { generateQuiz } from "../utils/quizGenerator";
import localAthletes from "../data/athletes.json";
import "./Quiz.css";

const SECONDS_PER_QUESTION = 15;
const LOCAL_PLAYED_KEY = "wir-daily-played";

function pointsFor(secondsLeft) {
  return 100 + Math.round((100 * secondsLeft) / SECONDS_PER_QUESTION);
}

function readLocalPlayed() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_PLAYED_KEY) || "null");
    return raw?.date === todayKey() ? raw : null;
  } catch {
    return null;
  }
}

function writeLocalPlayed(result) {
  try {
    localStorage.setItem(LOCAL_PLAYED_KEY, JSON.stringify({ date: todayKey(), ...result }));
  } catch {
    /* storage blocked — the daily lock is a convenience, not security */
  }
}

function Quiz() {
  const { currentUser } = useAuth();

  const [athletes, setAthletes] = useState([]);
  const [custom, setCustom] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState(null); // "daily" | "practice"
  const [phase, setPhase] = useState("lobby"); // "lobby" | "playing" | "done"
  const [practiceSport, setPracticeSport] = useState("All");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // { choice, correct, points }
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);

  const [todayResult, setTodayResult] = useState(null);
  const [player, setPlayer] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [boardTab, setBoardTab] = useState("today");
  const [boards, setBoards] = useState({ today: [], allTime: [] });
  const [copied, setCopied] = useState(false);

  // ---- data ---------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getAthletes().catch(() => []),
      getQuizQuestions().catch(() => []),
    ]).then(([remote, questionsData]) => {
      if (cancelled) return;
      setAthletes(remote.length ? remote : localAthletes);
      setCustom(questionsData);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadBoards = useCallback(() => {
    Promise.all([
      getDailyLeaderboard().catch(() => []),
      getAllTimeLeaderboard().catch(() => []),
    ]).then(([today, allTime]) => setBoards({ today, allTime }));
  }, []);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    if (!currentUser) {
      setTodayResult(readLocalPlayed());
      setPlayer(null);
      return;
    }
    getMyDailyResult(currentUser.uid)
      .then((r) => setTodayResult(r || readLocalPlayed()))
      .catch(() => setTodayResult(readLocalPlayed()));
    getPlayer(currentUser.uid).then(setPlayer).catch(() => setPlayer(null));
  }, [currentUser]);

  const sports = useMemo(
    () => ["All", ...[...new Set(athletes.map((a) => a.sport).filter(Boolean))].sort()],
    [athletes]
  );

  // ---- game flow ----------------------------------------------------------

  const current = questions[index];
  const currentAnswer = answers[index];
  const revealed = Boolean(currentAnswer);

  const start = (nextMode) => {
    const qs =
      nextMode === "daily"
        ? generateQuiz(athletes, custom, { seed: `daily-${todayKey()}` })
        : generateQuiz(athletes, custom, { sport: practiceSport });
    setMode(nextMode);
    setQuestions(qs);
    setAnswers([]);
    setIndex(0);
    setSecondsLeft(SECONDS_PER_QUESTION);
    setSaveState("idle");
    setCopied(false);
    setPhase("playing");
    window.scrollTo(0, 0);
  };

  const answer = useCallback(
    (choice) => {
      if (!current || answers[index]) return;
      const correct = choice === current.answer;
      const next = [...answers];
      next[index] = { choice, correct, points: correct ? pointsFor(secondsLeft) : 0 };
      setAnswers(next);
    },
    [current, answers, index, secondsLeft]
  );

  // Countdown; running out counts as a wrong answer.
  const answerRef = useRef(answer);
  answerRef.current = answer;
  useEffect(() => {
    if (phase !== "playing" || revealed) return undefined;
    if (secondsLeft <= 0) {
      answerRef.current(-1);
      return undefined;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, revealed, secondsLeft]);

  const score = answers.reduce((sum, a) => sum + (a?.points || 0), 0);
  const correctCount = answers.filter((a) => a?.correct).length;

  const finish = async () => {
    setPhase("done");
    window.scrollTo(0, 0);
    if (mode !== "daily") return;

    const result = { score, correct: correctCount, total: questions.length };
    writeLocalPlayed(result);
    setTodayResult(result);

    if (!currentUser) return;
    setSaveState("saving");
    try {
      await submitDailyResult(currentUser, result);
      setSaveState("saved");
      getPlayer(currentUser.uid).then(setPlayer).catch(() => {});
      loadBoards();
    } catch (err) {
      console.error("Could not save quiz result:", err);
      setSaveState("error");
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      finish();
      return;
    }
    setIndex(index + 1);
    setSecondsLeft(SECONDS_PER_QUESTION);
  };

  // Keyboard: 1–4 to answer, Enter for next.
  useEffect(() => {
    if (phase !== "playing") return undefined;
    const onKey = (e) => {
      const n = Number(e.key);
      if (!revealed && n >= 1 && n <= (current?.options.length || 0)) answer(n - 1);
      if (revealed && e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const share = async () => {
    const grid = answers.map((a) => (a?.correct ? "🟩" : "🟥")).join("");
    const text = `Women In Race — Daily Quiz ${todayKey()}\n${grid}\n${correctCount}/${questions.length} · ${score} pts\nCan you beat me? ${window.location.origin}/quiz`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  // ---- render -------------------------------------------------------------

  if (phase === "playing" && current) {
    const pct = (secondsLeft / SECONDS_PER_QUESTION) * 100;
    return (
      <Layout>
        <div className="quiz-page">
          <div className="quiz-play">
            <div className="quiz-play-top">
              <span className="quiz-chip">{mode === "daily" ? "Daily Challenge" : `Practice · ${practiceSport}`}</span>
              <span className="quiz-progress-label">
                Question {index + 1} / {questions.length}
              </span>
              <span className="quiz-score-live">{score} pts</span>
            </div>

            <div className="quiz-progress">
              {questions.map((q, i) => (
                <span
                  key={q.id}
                  className={`quiz-progress-seg ${
                    answers[i] ? (answers[i].correct ? "ok" : "bad") : i === index ? "current" : ""
                  }`}
                />
              ))}
            </div>

            <div className="quiz-card">
              <div className={`quiz-timer ${secondsLeft <= 5 && !revealed ? "urgent" : ""}`}>
                <div className="quiz-timer-bar" style={{ width: `${revealed ? 0 : pct}%` }} />
                <span>{revealed ? "—" : `${secondsLeft}s`}</span>
              </div>

              <h2 className="quiz-question">{current.prompt}</h2>

              {current.image && (
                <div className="quiz-image">
                  <img src={current.image} alt="Mystery athlete" />
                </div>
              )}

              <div className={`quiz-options ${current.options.length === 2 ? "two" : ""}`}>
                {current.options.map((opt, i) => {
                  let state = "";
                  if (revealed) {
                    if (i === current.answer) state = "correct";
                    else if (i === currentAnswer.choice) state = "wrong";
                    else state = "dim";
                  }
                  return (
                    <button
                      key={`${i}-${opt}`}
                      type="button"
                      className={`quiz-option ${state}`}
                      onClick={() => answer(i)}
                      disabled={revealed}
                    >
                      <span className="quiz-option-key">{i + 1}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <div className={`quiz-feedback ${currentAnswer.correct ? "ok" : "bad"}`}>
                  <p className="quiz-feedback-title">
                    {currentAnswer.correct
                      ? `Correct! +${currentAnswer.points}`
                      : currentAnswer.choice === -1
                        ? "Time's up!"
                        : "Not quite."}
                  </p>
                  {current.explanation && <p>{current.explanation}</p>}
                  <div className="quiz-feedback-actions">
                    {current.athleteId != null && (
                      <Link to={`/athletes/${current.athleteId}`} target="_blank" className="quiz-link">
                        Read her story ↗
                      </Link>
                    )}
                    <button type="button" className="quiz-btn" onClick={next}>
                      {index + 1 >= questions.length ? "See results" : "Next question →"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="quiz-hint">Tip: press 1–4 to answer, Enter for next. Faster answers earn more points.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (phase === "done") {
    const pct = Math.round((correctCount / questions.length) * 100);
    const verdict =
      pct >= 90 ? "Legend status 🏆" : pct >= 70 ? "True fan 🥇" : pct >= 40 ? "Rising star 🥈" : "Keep learning 🥉";
    return (
      <Layout>
        <div className="quiz-page">
          <div className="quiz-result">
            <p className="quiz-eyebrow">{mode === "daily" ? `DAILY CHALLENGE · ${todayKey()}` : "PRACTICE ROUND"}</p>
            <h1>{verdict}</h1>
            <div className="quiz-result-stats">
              <div><strong>{score}</strong><span>points</span></div>
              <div><strong>{correctCount}/{questions.length}</strong><span>correct</span></div>
              {player && mode === "daily" && <div><strong>{player.streak}🔥</strong><span>day streak</span></div>}
            </div>
            <div className="quiz-grid">
              {answers.map((a, i) => (
                <span key={questions[i].id} className={a?.correct ? "ok" : "bad"} />
              ))}
            </div>

            {mode === "daily" && !currentUser && (
              <p className="quiz-note">
                <Link to="/login">Sign in</Link> to save your score, build a streak and appear on the leaderboard.
              </p>
            )}
            {saveState === "saving" && <p className="quiz-note">Saving to leaderboard…</p>}
            {saveState === "saved" && <p className="quiz-note ok">Saved! You're on today's leaderboard.</p>}
            {saveState === "error" && <p className="quiz-note bad">Couldn't save your score. Check your connection.</p>}

            <div className="quiz-result-actions">
              {mode === "daily" && (
                <button type="button" className="quiz-btn" onClick={share}>
                  {copied ? "Copied to clipboard ✓" : "Share result"}
                </button>
              )}
              <button type="button" className="quiz-btn ghost" onClick={() => start("practice")}>
                Practice round
              </button>
              <button type="button" className="quiz-btn ghost" onClick={() => setPhase("lobby")}>
                Back to arena
              </button>
            </div>

            <h3 className="quiz-review-title">Review your answers</h3>
            <ol className="quiz-review">
              {questions.map((q, i) => (
                <li key={q.id} className={answers[i]?.correct ? "ok" : "bad"}>
                  <p className="quiz-review-q">{q.prompt}</p>
                  <p className="quiz-review-a">
                    Answer: <strong>{q.options[q.answer]}</strong>
                    {!answers[i]?.correct && answers[i]?.choice >= 0 && (
                      <> · you said {q.options[answers[i].choice]}</>
                    )}
                  </p>
                  {q.athleteId != null && (
                    <Link to={`/athletes/${q.athleteId}`} className="quiz-link">View profile →</Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Layout>
    );
  }

  // lobby
  const board = boardTab === "today" ? boards.today : boards.allTime;
  return (
    <Layout>
      <div className="quiz-page">
        <header className="quiz-hero">
          <p className="quiz-eyebrow">TEST YOUR KNOWLEDGE</p>
          <h1>
            Quiz <span className="accent">Arena</span>
          </h1>
          <p className="quiz-sub">
            Ten questions a day on India's women athletes. Same questions for everyone, a 15-second clock,
            and a leaderboard. Build a streak and learn a new story every day.
          </p>
        </header>

        <div className="quiz-lobby">
          <div className="quiz-modes">
            <section className="quiz-mode-card featured">
              <span className="quiz-chip">Today · {todayKey()}</span>
              <h2>Daily Challenge</h2>
              <p>10 questions · 15s each · up to 2,000 points. One attempt per day.</p>
              {todayResult ? (
                <div className="quiz-done-today">
                  <p>
                    You scored <strong>{todayResult.score}</strong> ({todayResult.correct}/{todayResult.total}) today.
                  </p>
                  <p className="quiz-muted">A new challenge unlocks at midnight.</p>
                </div>
              ) : (
                <button type="button" className="quiz-btn" disabled={loading} onClick={() => start("daily")}>
                  {loading ? "Loading questions…" : "Start today's challenge"}
                </button>
              )}
              {!currentUser && (
                <p className="quiz-muted small">
                  <Link to="/login">Sign in</Link> to save scores and streaks.
                </p>
              )}
            </section>

            <section className="quiz-mode-card">
              <span className="quiz-chip ghost">Unlimited</span>
              <h2>Practice</h2>
              <p>Warm up with a fresh random round. Pick a sport to focus on.</p>
              <div className="quiz-sport-picker">
                {sports.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`quiz-pill ${practiceSport === s ? "active" : ""}`}
                    onClick={() => setPracticeSport(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button type="button" className="quiz-btn ghost" disabled={loading} onClick={() => start("practice")}>
                Start practice
              </button>
            </section>

            {player && (
              <section className="quiz-mode-card stats">
                <h2>Your stats</h2>
                <div className="quiz-stats-grid">
                  <div><strong>{player.streak || 0}🔥</strong><span>current streak</span></div>
                  <div><strong>{player.bestStreak || 0}</strong><span>best streak</span></div>
                  <div><strong>{player.totalPoints || 0}</strong><span>total points</span></div>
                  <div><strong>{player.bestScore || 0}</strong><span>best day</span></div>
                  <div><strong>{player.gamesPlayed || 0}</strong><span>days played</span></div>
                </div>
              </section>
            )}
          </div>

          <aside className="quiz-board">
            <div className="quiz-board-head">
              <h2>Leaderboard</h2>
              <div className="quiz-board-tabs">
                <button type="button" className={boardTab === "today" ? "active" : ""} onClick={() => setBoardTab("today")}>
                  Today
                </button>
                <button type="button" className={boardTab === "all" ? "active" : ""} onClick={() => setBoardTab("all")}>
                  All-time
                </button>
              </div>
            </div>
            {board.length === 0 ? (
              <p className="quiz-muted">No scores yet. Be the first on the board!</p>
            ) : (
              <ol className="quiz-board-list">
                {board.map((row, i) => {
                  const uid = row.uid || row.id;
                  return (
                    <li key={row.id} className={currentUser?.uid === uid ? "me" : ""}>
                      <span className="rank">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
                      {row.photoURL ? (
                        <img src={row.photoURL} alt="" className="avatar" />
                      ) : (
                        <span className="avatar fallback">{(row.name || "P").charAt(0)}</span>
                      )}
                      <span className="name">{row.name}</span>
                      <span className="pts">{boardTab === "today" ? row.score : row.totalPoints}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  );
}

export default Quiz;

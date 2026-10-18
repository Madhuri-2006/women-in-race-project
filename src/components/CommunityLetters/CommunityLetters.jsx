import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscribeLetters, addLetter } from "../../services/lettersService";
import { getInitials } from "../../utils/athleteHelpers";
import "./CommunityLetters.css";

const MAX_LENGTH = 500;

function formatDate(date) {
  if (!date) return "just now";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CommunityLetters({ athleteId, athleteName }) {
  const { currentUser } = useAuth();
  const [letters, setLetters] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [justSentId, setJustSentId] = useState(null);

  useEffect(() => {
    if (!athleteId) return;
    setStatus("loading");
    const unsub = subscribeLetters(
      athleteId,
      (data) => {
        setLetters(data);
        setStatus("ready");
      },
      () => setStatus("error")
    );
    return () => unsub();
  }, [athleteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim().length < 5) {
      setSendError("Write a few more words of support.");
      return;
    }
    setSendError("");
    setSending(true);
    try {
      const ref = await addLetter(athleteId, {
        text,
        authorId: currentUser.uid,
        authorName:
          currentUser.displayName || currentUser.phoneNumber || "A supporter",
      });
      setText("");
      setJustSentId(ref.id);
      setTimeout(() => setJustSentId(null), 2500);
    } catch (err) {
      console.error("Failed to send letter:", err);
      setSendError("Couldn't send your letter right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="letters">
      <div className="letters-heading">
        <p className="letters-eyebrow">COMMUNITY</p>
        <h2 className="letters-title">Letters of Support</h2>
        <p className="letters-sub">
          {status === "ready" && letters.length > 0
            ? `${letters.length} message${letters.length === 1 ? "" : "s"} from the community to ${athleteName}.`
            : `Be the first to write ${athleteName} a message of support.`}
        </p>
      </div>

      {currentUser ? (
        <form className="letters-form" onSubmit={handleSubmit}>
          {sendError && <div className="letters-error">{sendError}</div>}
          <div className="letters-form-row">
            <div className="letters-form-avatar">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" />
              ) : (
                <div className="letters-avatar-fallback">
                  {getInitials(currentUser.displayName || currentUser.phoneNumber || "U")}
                </div>
              )}
            </div>
            <div className="letters-form-body">
              <textarea
                rows={3}
                maxLength={MAX_LENGTH}
                placeholder={`Write your message to ${athleteName}…`}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="letters-form-footer">
                <span className="letters-char-count">
                  {text.length}/{MAX_LENGTH}
                </span>
                <button type="submit" className="letters-btn" disabled={sending}>
                  {sending ? "Sending…" : "Send your support →"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="letters-signin">
          <span>Want to leave a message?</span>
          <Link to="/login">Sign in to write a letter →</Link>
        </div>
      )}

      {status === "loading" && (
        <div className="letters-skeletons">
          <div className="letter-skeleton" />
          <div className="letter-skeleton" />
        </div>
      )}

      {status === "error" && (
        <p className="letters-status">Letters aren't available right now.</p>
      )}

      {status === "ready" && letters.length === 0 && (
        <div className="letters-empty">
          <span className="letters-empty-icon">✉</span>
          <p>No letters yet. The first one starts here.</p>
        </div>
      )}

      {status === "ready" && letters.length > 0 && (
        <ul className="letters-list">
          {letters.map((letter) => (
            <li
              key={letter.id}
              className={`letter-item ${letter.id === justSentId ? "is-new" : ""}`}
            >
              <div className="letter-avatar">{getInitials(letter.authorName)}</div>
              <div className="letter-body">
                <p className="letter-text">“{letter.text}”</p>
                <p className="letter-meta">
                  <span className="letter-author">{letter.authorName}</span>
                  <span className="letter-dot">·</span>
                  <span>{formatDate(letter.createdAt)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CommunityLetters;

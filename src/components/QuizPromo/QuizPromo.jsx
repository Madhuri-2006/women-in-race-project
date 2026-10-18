import { Link } from "react-router-dom";
import "./QuizPromo.css";

function QuizPromo() {
  return (
    <section className="quiz-promo">
      <div className="quiz-promo-inner">
        <div>
          <p className="quiz-promo-eyebrow">NEW · DAILY CHALLENGE</p>
          <h2>How well do you know India's champions?</h2>
          <p className="quiz-promo-sub">
            10 questions a day, the same for everyone. Beat the clock, keep your streak going and climb the leaderboard.
          </p>
        </div>
        <div className="quiz-promo-actions">
          <Link to="/quiz" className="quiz-promo-btn">Play today's quiz →</Link>
          <span className="quiz-promo-meta">⏱ 2 minutes · 🔥 streaks · 🏆 leaderboard</span>
        </div>
      </div>
    </section>
  );
}

export default QuizPromo;

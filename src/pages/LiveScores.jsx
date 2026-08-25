import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { subscribeScores } from "../services/liveScoreService";
import "./LiveScores.css";

function LiveScores() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeScores((data) => {
      setScores(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      <div className="live-page">
        <h1>🏆 Live Sports Scores</h1>

        {scores.length === 0 ? (
          <h3>No Live Matches</h3>
        ) : (
          <div className="score-grid">
            {scores.map((match) => (
              <div className="score-card" key={match.id}>
                <h2>{match.event}</h2>

                <h3>
                  {match.teamA} {match.scoreA}
                </h3>

                <h3>
                  {match.teamB} {match.scoreB}
                </h3>

                <p>{match.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LiveScores;
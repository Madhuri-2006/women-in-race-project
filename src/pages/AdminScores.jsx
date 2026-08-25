import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import {
  addScore,
  subscribeScores,
  deleteScore,
} from "../services/liveScoreService";

function AdminScores() {
  const [scores, setScores] = useState([]);

  const [score, setScore] = useState({
    event: "",
    teamA: "",
    teamB: "",
    scoreA: 0,
    scoreB: 0,
    status: "Live",
  });

  useEffect(() => {
    const unsubscribe = subscribeScores((data) => {
      setScores(data);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setScore({
      ...score,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addScore({
      ...score,
      scoreA: Number(score.scoreA),
      scoreB: Number(score.scoreB),
    });

    alert("Score Added Successfully");

    setScore({
      event: "",
      teamA: "",
      teamB: "",
      scoreA: 0,
      scoreB: 0,
      status: "Live",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this score?")) return;

    await deleteScore(id);
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#e91e63",
            marginBottom: "30px",
          }}
        >
          Live Score Admin
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "15px",
            marginBottom: "40px",
          }}
        >
          <input
            name="event"
            placeholder="Event"
            value={score.event}
            onChange={handleChange}
          />

          <input
            name="teamA"
            placeholder="Team A"
            value={score.teamA}
            onChange={handleChange}
          />

          <input
            name="teamB"
            placeholder="Team B"
            value={score.teamB}
            onChange={handleChange}
          />

          <input
            type="number"
            name="scoreA"
            placeholder="Score A"
            value={score.scoreA}
            onChange={handleChange}
          />

          <input
            type="number"
            name="scoreB"
            placeholder="Score B"
            value={score.scoreB}
            onChange={handleChange}
          />

          <select
            name="status"
            value={score.status}
            onChange={handleChange}
          >
            <option>Live</option>
            <option>Upcoming</option>
            <option>Finished</option>
          </select>

          <button
            style={{
              background: "#e91e63",
              color: "#fff",
              border: "none",
              padding: "12px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Add Score
          </button>
        </form>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead
            style={{
              background: "#e91e63",
              color: "white",
            }}
          >
            <tr>
              <th>Event</th>
              <th>Team A</th>
              <th>Score</th>
              <th>Team B</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {scores.map((match) => (
              <tr key={match.id}>
                <td>{match.event}</td>
                <td>{match.teamA}</td>
                <td>
                  {match.scoreA} - {match.scoreB}
                </td>
                <td>{match.teamB}</td>
                <td>{match.status}</td>
                <td>
                  <button
                    onClick={() => handleDelete(match.id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderRadius: "5px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default AdminScores;
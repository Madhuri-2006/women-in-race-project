import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AthleteCard from "../AthleteCard/AthleteCard";
import { getAthletes } from "../../services/athleteService";
import { sortByPhotoFirst } from "../../utils/athleteHelpers";
import "./FeaturedAthletes.css";

const FEATURED_COUNT = 3;

function FeaturedAthletes() {
  const [athletes, setAthletes] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error" | "empty"

  useEffect(() => {
    let cancelled = false;

    async function loadAthletes() {
      try {
        const data = await getAthletes();
        if (cancelled) return;

        if (data.length === 0) {
          setStatus("empty");
          return;
        }

        setAthletes(sortByPhotoFirst(data).slice(0, FEATURED_COUNT));
        setStatus("ready");
      } catch (err) {
        console.error("Failed to load featured athletes:", err);
        if (!cancelled) setStatus("error");
      }
    }

    loadAthletes();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="featured-athletes">
      <h2>Featured Athletes</h2>

      {status === "loading" && <p className="featured-status">Loading athletes...</p>}

      {status === "error" && (
        <p className="featured-status">
          Couldn't load athletes right now. Please try again shortly.
        </p>
      )}

      {status === "empty" && (
        <p className="featured-status">
          No athletes yet.{" "}
          <Link to="/athlete-manager">Add the first one →</Link>
        </p>
      )}

      {status === "ready" && (
        <div className="athlete-container">
          {athletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedAthletes;

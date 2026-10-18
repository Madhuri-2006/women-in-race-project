import { useState } from "react";
import { Link } from "react-router-dom";
import { calculateAge, getInitials } from "../../utils/athleteHelpers";
import "./AthleteCard.css";

function AthleteImage({ image, name }) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <div className="athlete-avatar-fallback">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={`/images/athletes/${image}`}
      alt={name}
      onError={() => setFailed(true)}
    />
  );
}

function AthleteCard({ athlete }) {
  const { id, name, sport, image, state, birthDate, olympicMedals } = athlete;
  const age = calculateAge(birthDate);

  return (
    <div className="athlete-card">
      <AthleteImage image={image} name={name} />

      <div className="athlete-info">
        <h3>{name}</h3>

        <p>
          <strong>Sport:</strong> {sport}
        </p>

        {age !== null && (
          <p>
            <strong>Age:</strong> {age}
          </p>
        )}

        <p>
          <strong>State:</strong> {state}
        </p>

        <p>
          <strong>Olympic Medals:</strong> 🥇 {olympicMedals ?? 0}
        </p>

        <Link to={`/athletes/${id}`} className="profile-btn">
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default AthleteCard;

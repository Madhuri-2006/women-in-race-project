import { Link } from "react-router-dom";
import "./AthleteCard.css";

function AthleteCard({
  id,
  name,
  sport,
  image,
  age,
  state,
  medals,
}) {
  return (
    <div className="athlete-card">
<img
  src={`/images/athletes/${image}`}
  alt={name}
/>
      <div className="athlete-info">
        <h3>{name}</h3>

        <p>
          <strong>Sport:</strong> {sport}
        </p>

        <p>
          <strong>Age:</strong> {age}
        </p>

        <p>
          <strong>State:</strong> {state}
        </p>

        <p>
          <strong>Medals:</strong> 🥇 {medals}
        </p>

        <Link to={`/athletes/${id}`} className="profile-btn">
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default AthleteCard;
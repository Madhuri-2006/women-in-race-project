import { useState } from "react";
import "./EventCard.css";

function EventCard({ title, date, location, image, description, imageCredit, imageSourceUrl }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="event-card">
      {image && !failed ? (
        <img src={image} alt={title} onError={() => setFailed(true)} />
      ) : (
        <div className="event-card-fallback">{title}</div>
      )}

      <div className="event-content">
        <h3>{title}</h3>

        <p><strong>📅</strong> {date}</p>

        <p><strong>📍</strong> {location}</p>

        <p>{description}</p>

        {image && !failed && imageCredit && (
          <p className="event-card-credit">
            {imageSourceUrl ? (
              <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer">
                {imageCredit}
              </a>
            ) : (
              imageCredit
            )}
          </p>
        )}

        <button>View Details</button>
      </div>
    </div>
  );
}

export default EventCard;

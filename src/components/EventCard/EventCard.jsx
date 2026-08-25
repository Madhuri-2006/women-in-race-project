import "./EventCard.css";

function EventCard({ title, date, location, image, description }) {
  return (
    <div className="event-card">
      <img src={image} alt={title} />

      <div className="event-content">
        <h3>{title}</h3>

        <p><strong>📅</strong> {date}</p>

        <p><strong>📍</strong> {location}</p>

        <p>{description}</p>

        <button>View Details</button>
      </div>
    </div>
  );
}

export default EventCard;
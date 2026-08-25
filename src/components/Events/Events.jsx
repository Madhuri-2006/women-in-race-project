import "./Events.css";

function Events() {
  return (
<section className="events" id="events">
      <h2>Upcoming Events</h2>

      <div className="events-container">

        <div className="event-card">

          <h3>National Women's Marathon</h3>

          <p><strong>Date:</strong> 15 August 2026</p>

          <p><strong>Location:</strong> New Delhi</p>

          <button>View Details</button>

        </div>

        <div className="event-card">

          <h3>Women's Badminton Championship</h3>

          <p><strong>Date:</strong> 28 September 2026</p>

          <p><strong>Location:</strong> Hyderabad</p>

          <button>View Details</button>

        </div>

        <div className="event-card">

          <h3>National Athletics Meet</h3>

          <p><strong>Date:</strong> 10 October 2026</p>

          <p><strong>Location:</strong> Bengaluru</p>

          <button>View Details</button>

        </div>

      </div>

    </section>
  );
}

export default Events;
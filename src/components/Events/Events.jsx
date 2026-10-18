import EventCard from "../EventCard/EventCard";
import events from "../../data/events.json";
import "./Events.css";

function Events() {
  return (
    <section className="events" id="events">
      <h2>Upcoming Events</h2>

      <div className="events-container">
        {events.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            date={event.date}
            location={event.location}
            image={event.image}
            description={event.description}
            imageCredit={event.imageCredit}
            imageSourceUrl={event.imageSourceUrl}
          />
        ))}
      </div>
    </section>
  );
}

export default Events;

import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import EventCard from "../components/EventCard/EventCard";
import { getEvents } from "../services/eventService";
import "./Events.css";

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function loadEvents() {
      const data = await getEvents();
      setEvents(data);
    }

    loadEvents();
  }, []);

  return (
    <Layout>
      <section className="events-page">

        <h1>Upcoming Sports Events</h1>

        <p className="events-subtitle">
          Discover upcoming national and international women's sporting events.
        </p>

        <div className="events-grid">

          {events.map((event) => (
            <EventCard
              key={event.firestoreId}
              title={event.title}
              date={event.date}
              location={event.location}
              image={event.image}
              description={event.description}
            />
          ))}

        </div>

      </section>
    </Layout>
  );
}

export default Events;
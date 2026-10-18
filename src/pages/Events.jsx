import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import EventCard from "../components/EventCard/EventCard";
import PageHeading from "../components/PageHeading/PageHeading";
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

        <PageHeading
          eyebrow="WHAT'S COMING UP"
          title="Upcoming Sports Events"
          subtitle="National and international women's sporting events to follow."
        />

        <div className="events-grid">

          {events.map((event) => (
            <EventCard
              key={event.firestoreId}
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
    </Layout>
  );
}

export default Events;
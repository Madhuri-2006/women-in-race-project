import "./Achievements.css";

function Achievements() {
  return (
    <section className="achievements" id="achievements">
      <h2>Our Achievements</h2>

      <div className="achievement-container">

        <div className="achievement-card">
          <h3>28+</h3>
          <p>Olympic Medals</p>
        </div>

        <div className="achievement-card">
          <h3>45+</h3>
          <p>World Championships</p>
        </div>

        <div className="achievement-card">
          <h3>150+</h3>
          <p>Women Athletes</p>
        </div>

        <div className="achievement-card">
          <h3>60+</h3>
          <p>Sports Events</p>
        </div>

      </div>
    </section>
  );
}

export default Achievements;

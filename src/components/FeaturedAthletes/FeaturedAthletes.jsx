import AthleteCard from "../AthleteCard/AthleteCard";
import athletes from "../../data/athletes";
import "./FeaturedAthletes.css";

function FeaturedAthletes() {
  return (
    <section className="featured-athletes">

      <h2>Featured Athletes</h2>

      <div className="athlete-container">

        {athletes.map((athlete) => (
          <AthleteCard
            key={athlete.id}
            id={athlete.id}
            name={athlete.name}
            sport={athlete.sport}
            image={athlete.image}
            age={athlete.age}
            state={athlete.state}
            medals={athlete.medals}
          />
        ))}

      </div>

    </section>
  );
}

export default FeaturedAthletes;
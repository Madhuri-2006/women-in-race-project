import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { getAthletes } from "../services/athleteService";
import "./AthleteDetails.css";

function AthleteDetails() {
  const { id } = useParams();

  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    async function loadAthlete() {
      const athletes = await getAthletes();

     const foundAthlete = athletes.find(
  (item) => item.id === Number(id)
);

      setAthlete(foundAthlete);
    }

    loadAthlete();
  }, [id]);

  if (!athlete) {
    return (
      <Layout>
        <h1 style={{ textAlign: "center", marginTop: "100px" }}>
          Athlete Not Found
        </h1>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="details-container">
        <div className="details-image">
          <img
  src={`/images/athletes/${athlete.image}`}
  alt={athlete.name}
/>
        </div>

        <div className="details-content">
          <h1>{athlete.name}</h1>

          <h2>{athlete.sport}</h2>

          <p>
            <strong>Age:</strong> {athlete.age}
          </p>

          <p>
            <strong>State:</strong> {athlete.state}
          </p>

          <p>
            <strong>Country:</strong> {athlete.country}
          </p>

          <p>
            <strong>Birth Date:</strong> {athlete.birthDate}
          </p>

          <p>
            <strong>Coach:</strong> {athlete.coach}
          </p>

          <p>
            <strong>Olympic Medals:</strong> {athlete.olympicMedals}
          </p>

          <p>
            <strong>World Championships:</strong> {athlete.worldChampionships}
          </p>

          <p>
            <strong>Commonwealth Medals:</strong> {athlete.commonwealthMedals}
          </p>

          <p>
            <strong>Asian Games Medals:</strong> {athlete.asianGamesMedals}
          </p>

          <h3>Biography</h3>

          <p>{athlete.bio}</p>
        </div>
      </div>
    </Layout>
  );
}

export default AthleteDetails;
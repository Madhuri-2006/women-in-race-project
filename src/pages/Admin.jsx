import { useState } from "react";
import "./Admin.css";
import Layout from "../components/Layout/Layout";
import { addAthlete } from "../services/athleteService";

function Admin() {
  const [athlete, setAthlete] = useState({
    name: "",
    sport: "",
    state: "",
    age: "",
    medals: "",
    image: "",
  });

  const handleChange = (e) => {
    setAthlete({
      ...athlete,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addAthlete(athlete);

    alert("Athlete Added Successfully!");

    setAthlete({
      name: "",
      sport: "",
      state: "",
      age: "",
      medals: "",
      image: "",
    });
  };

  return (
    <Layout>
      <div className="admin-page">
        <h1>Admin Dashboard</h1>

        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="text"
            name="name"
            placeholder="Athlete Name"
            value={athlete.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="sport"
            placeholder="Sport"
            value={athlete.sport}
            onChange={handleChange}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={athlete.state}
            onChange={handleChange}
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={athlete.age}
            onChange={handleChange}
          />

          <input
            type="number"
            name="medals"
            placeholder="Medals"
            value={athlete.medals}
            onChange={handleChange}
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={athlete.image}
            onChange={handleChange}
          />

          <button type="submit">Add Athlete</button>
        </form>
      </div>
    </Layout>
  );
}

export default Admin;
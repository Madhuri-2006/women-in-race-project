import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import {
  getAthletes,
  deleteAthlete,
  addAthlete,
} from "../services/athleteService";

function AthleteManager() {
  const [athletes, setAthletes] = useState([]);

  const [newAthlete, setNewAthlete] = useState({
    name: "",
    sport: "",
    state: "",
    country: "India",
    age: "",
    coach: "",
    birthDate: "",
    bio: "",
    olympicMedals: 0,
    worldChampionships: 0,
    commonwealthMedals: 0,
    asianGamesMedals: 0,
    image: "",
  });

  const loadAthletes = async () => {
    const data = await getAthletes();
    setAthletes(data);
  };

  useEffect(() => {
    loadAthletes();
  }, []);

  const handleChange = (e) => {
    setNewAthlete({
      ...newAthlete,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async () => {
    if (
      !newAthlete.name ||
      !newAthlete.sport ||
      !newAthlete.state
    ) {
      alert("Fill required fields.");
      return;
    }

    await addAthlete({
      ...newAthlete,
      age: Number(newAthlete.age),
      olympicMedals: Number(newAthlete.olympicMedals),
      worldChampionships: Number(newAthlete.worldChampionships),
      commonwealthMedals: Number(newAthlete.commonwealthMedals),
      asianGamesMedals: Number(newAthlete.asianGamesMedals),
    });

    alert("Athlete Added!");

    setNewAthlete({
      name: "",
      sport: "",
      state: "",
      country: "India",
      age: "",
      coach: "",
      birthDate: "",
      bio: "",
      olympicMedals: 0,
      worldChampionships: 0,
      commonwealthMedals: 0,
      asianGamesMedals: 0,
      image: "",
    });

    loadAthletes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Athlete?")) return;
    await deleteAthlete(id);
    loadAthletes();
  };

  return (
    <Layout>
      <div style={{ maxWidth: "1400px", margin: "40px auto", padding: "20px" }}>

        <h1 style={{ textAlign: "center", color: "#e91e63" }}>
          Athlete Management
        </h1>

        <div
          style={{
            display: "flex",
            gap: "20px",
            margin: "30px 0",
          }}
        >
          <div style={card}>
            <h2>{athletes.length}</h2>
            <p>Total Athletes</p>
          </div>

          <div style={card}>
            <h2>{new Set(athletes.map(a => a.sport)).size}</h2>
            <p>Sports</p>
          </div>
        </div>

        <h2>Add Athlete</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <input name="name" placeholder="Name" value={newAthlete.name} onChange={handleChange} />
          <input name="sport" placeholder="Sport" value={newAthlete.sport} onChange={handleChange} />
          <input name="state" placeholder="State" value={newAthlete.state} onChange={handleChange} />
          <input name="country" placeholder="Country" value={newAthlete.country} onChange={handleChange} />
          <input name="age" placeholder="Age" value={newAthlete.age} onChange={handleChange} />
          <input name="birthDate" placeholder="Birth Date" value={newAthlete.birthDate} onChange={handleChange} />
          <input name="coach" placeholder="Coach" value={newAthlete.coach} onChange={handleChange} />
          <input name="image" placeholder="Image (pv-sindhu.jpg)" value={newAthlete.image} onChange={handleChange} />
          <input name="bio" placeholder="Biography" value={newAthlete.bio} onChange={handleChange} />
          <input name="olympicMedals" placeholder="Olympic Medals" value={newAthlete.olympicMedals} onChange={handleChange} />
          <input name="worldChampionships" placeholder="World Championships" value={newAthlete.worldChampionships} onChange={handleChange} />
          <input name="commonwealthMedals" placeholder="Commonwealth Medals" value={newAthlete.commonwealthMedals} onChange={handleChange} />
          <input name="asianGamesMedals" placeholder="Asian Games Medals" value={newAthlete.asianGamesMedals} onChange={handleChange} />
        </div>

        <button
          onClick={handleAdd}
          style={{
            background: "#e91e63",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          Add Athlete
        </button>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead style={{ background: "#e91e63", color: "white" }}>
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Sport</th>
              <th>State</th>
              <th>Age</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {athletes.map((athlete, index) => (
              <tr key={athlete.firestoreId}>
                <td>{index + 1}</td>

                <td>
                  <img
                    src={`/images/athletes/${athlete.image}`}
                    alt={athlete.name}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                    }}
                  />
                </td>

                <td>{athlete.name}</td>
                <td>{athlete.sport}</td>
                <td>{athlete.state}</td>
                <td>{athlete.age}</td>

                <td>
                  <button
                    onClick={() => handleDelete(athlete.firestoreId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </Layout>
  );
}

const card = {
  flex: 1,
  background: "#fff",
  padding: "20px",
  textAlign: "center",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,.1)",
};

export default AthleteManager;
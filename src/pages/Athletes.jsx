import { useState, useEffect } from "react";
import { getAthletes } from "../services/athleteService";
import Layout from "../components/Layout/Layout";
import SearchBar from "../components/SearchBar/SearchBar";
import SportFilter from "../components/SportFilter/SportFilter";
import AthleteCard from "../components/AthleteCard/AthleteCard";

function Athletes() {
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [athletes, setAthletes] = useState([]);
  useEffect(() => {
  async function loadAthletes() {
    const data = await getAthletes();
    setAthletes(data);
  }

  loadAthletes();
}, []);

  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch = athlete.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesSport =
      selectedSport === "All" ||
      athlete.sport === selectedSport;

    return matchesSearch && matchesSport;
  });

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1300px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#e91e63",
          }}
        >
          Women Athletes
        </h1>

        <SearchBar
          search={search}
          setSearch={setSearch}
        />

        <SportFilter
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "30px",
          }}
        >
          {filteredAthletes.map((athlete) => (
            <AthleteCard
              key={athlete.id}
              id={athlete.id}
              name={athlete.name}
              sport={athlete.sport}
              image={athlete.image}
              age={athlete.age}
              state={athlete.state}
              medals={athlete.olympicMedals}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Athletes;
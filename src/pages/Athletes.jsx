import { useState, useEffect } from "react";
import { getAthletes } from "../services/athleteService";
import Layout from "../components/Layout/Layout";
import SearchBar from "../components/SearchBar/SearchBar";
import SportFilter from "../components/SportFilter/SportFilter";
import AthleteCard from "../components/AthleteCard/AthleteCard";
import PageHeading from "../components/PageHeading/PageHeading";
import { sortByPhotoFirst } from "../utils/athleteHelpers";

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

  const filteredAthletes = sortByPhotoFirst(
    athletes.filter((athlete) => {
      const matchesSearch = athlete.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesSport =
        selectedSport === "All" ||
        athlete.sport === selectedSport;

      return matchesSearch && matchesSport;
    })
  );

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1300px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        <PageHeading
          eyebrow="MEET THE CHAMPIONS"
          title="Women Athletes"
          subtitle="Search or filter by sport to find any of the 120 women profiled here."
        />

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
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Athletes;
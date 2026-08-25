import "./SportFilter.css";

const sports = [
  "All",
  "Badminton",
  "Boxing",
  "Athletics",
  "Cricket",
  "Wrestling",
  "Weightlifting",
];

function SportFilter({ selectedSport, setSelectedSport }) {
  return (
    <div className="filter-container">
      {sports.map((sport) => (
        <button
          key={sport}
          className={
            selectedSport === sport ? "active-filter" : ""
          }
          onClick={() => setSelectedSport(sport)}
        >
          {sport}
        </button>
      ))}
    </div>
  );
}

export default SportFilter;
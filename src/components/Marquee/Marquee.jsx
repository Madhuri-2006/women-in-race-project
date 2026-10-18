import "./Marquee.css";

const NAMES = [
  "PV Sindhu",
  "Mithali Raj",
  "Mary Kom",
  "Mirabai Chanu",
  "Hima Das",
  "Sania Mirza",
  "Smriti Mandhana",
  "Dutee Chand",
  "Nikhat Zareen",
  "Vinesh Phogat",
  "Kalpana Chawla",
  "Tessy Thomas",
  "Ritu Karidhal",
];

function Marquee() {
  const track = [...NAMES, ...NAMES];

  return (
    <div className="marquee">
      <div className="marquee-track">
        {track.map((name, i) => (
          <span className="marquee-item" key={`${name}-${i}`}>
            {name}
            <span className="marquee-dot">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default Marquee;

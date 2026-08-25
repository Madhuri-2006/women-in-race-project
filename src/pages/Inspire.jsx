import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { getAthletes } from "../services/athleteService";

function Inspire() {
  const [athletes, setAthletes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAthletes() {
      const data = await getAthletes();
      setAthletes(data);
    }

    loadAthletes();
  }, []);

  const filteredAthletes = athletes.filter((athlete) =>
    athlete.name.toLowerCase().includes(search.toLowerCase())
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
        <h1
          style={{
            textAlign: "center",
            color: "#e91e63",
            marginBottom: "10px",
          }}
        >
          🌟 Inspire Me
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Every champion started with a dream. Read about India's inspiring women athletes.
        </p>

        <input
          type="text"
          placeholder="Search Athlete..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "16px",
            marginBottom: "30px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "25px",
          }}
        >
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 5px 15px rgba(0,0,0,.1)",
              }}
            >
              <img
                src={`/images/athletes/${athlete.image}`}
                alt={athlete.name}
                style={{
                  width: "100%",
                  height: "260px",
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: "20px" }}>
                <h2>{athlete.name}</h2>

                <p style={{ color: "#e91e63", fontWeight: "bold" }}>
                  {athlete.sport}
                </p>

                <p>
                  <strong>State:</strong> {athlete.state}
                </p>

                <p style={{ marginTop: "15px", color: "#555" }}>
                  {athlete.bio
                    ? athlete.bio
                    : "Every athlete has a journey filled with dedication, discipline, hard work and determination. They inspire millions to dream big and never give up."}
                </p>

                <button
                  style={{
                    marginTop: "15px",
                    background: "#e91e63",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    alert(
                      athlete.bio ||
                        `${athlete.name} is one of India's inspiring athletes who has dedicated years of hard work to achieve success.`
                    )
                  }
                >
                  Read Story
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Inspire;
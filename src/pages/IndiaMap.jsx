import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { getAthletes } from "../services/athleteService";

function IndiaMap() {
  const [athletes, setAthletes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await getAthletes();
      setAthletes(data);
    }

    load();
  }, []);

  const statePoints = [
    { state: "Telangana", top: "58%", left: "54%" },
    { state: "Andhra Pradesh", top: "67%", left: "57%" },
    { state: "Haryana", top: "34%", left: "43%" },
    { state: "Punjab", top: "30%", left: "38%" },
    { state: "Odisha", top: "55%", left: "64%" },
    { state: "Assam", top: "33%", left: "82%" },
    { state: "Manipur", top: "44%", left: "86%" },
    { state: "Kerala", top: "86%", left: "41%" },
    { state: "Tamil Nadu", top: "86%", left: "50%" },
    { state: "Karnataka", top: "74%", left: "43%" },
    { state: "Maharashtra", top: "58%", left: "39%" },
    { state: "Gujarat", top: "48%", left: "22%" },
    { state: "Uttar Pradesh", top: "39%", left: "52%" },
    { state: "Rajasthan", top: "42%", left: "30%" },
    { state: "Madhya Pradesh", top: "50%", left: "43%" }
  ];

  return (
    <Layout>

      <div
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          textAlign: "center",
        }}
      >

        <h1 style={{ color: "#e91e63" }}>
          Athletes Across India
        </h1>

        <div
          style={{
            position: "relative",
            width: "700px",
            margin: "40px auto",
          }}
        >

          <img
  src="/india-map.svg"
  alt="India Map"
  style={{
    width: "100%",
    display: "block"
  }}
/>
           

          {statePoints.map((point) => {

            const players = athletes.filter(
              (a) =>
                a.state?.toLowerCase() ===
                point.state.toLowerCase()
            );

            return (
              <div
                key={point.state}
                title={
                  players.length
                    ? players.map((a) => a.name).join(", ")
                    : "No Athletes"
                }
                onClick={() =>
                  navigate(
                    `/athletes?state=${encodeURIComponent(point.state)}`
                  )
                }
                style={{
                  position: "absolute",
                  top: point.top,
                  left: point.left,
                  width: "18px",
                  height: "18px",
                  background: "#e91e63",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: "3px solid white",
                }}
              />
            );
          })}
        </div>

        <p>
          Hover over a marker to view athletes.
        </p>

      </div>

    </Layout>
  );
}

export default IndiaMap;
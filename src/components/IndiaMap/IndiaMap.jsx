import Layout from "../Layout/Layout";

function IndiaMap() {
  const states = [
    { state: "Telangana", athlete: "P. V. Sindhu, Jwala Gutta, Gayatri Gopichand" },
    { state: "Haryana", athlete: "Saina Nehwal" },
    { state: "Karnataka", athlete: "Ashwini Ponnappa" },
    { state: "Kerala", athlete: "Treesa Jolly" },
    { state: "Odisha", athlete: "Rutaparna Panda" },
    { state: "Chhattisgarh", athlete: "Aakarshi Kashyap" },
    { state: "Maharashtra", athlete: "Malvika Bansod" },
    { state: "Uttarakhand", athlete: "Anupama Upadhyaya" },
    { state: "Assam", athlete: "Ashmita Chaliha" },
    { state: "Goa", athlete: "Tanisha Crasto" },
    { state: "Uttar Pradesh", athlete: "Shruti Mishra" },
    { state: "West Bengal", athlete: "Riya Mookerjee" }
  ];

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#e91e63",
            marginBottom: "30px",
          }}
        >
          Athletes Across India 🇮🇳
        </h1>

        <p
          style={{
            textAlign: "center",
            marginBottom: "40px",
            fontSize: "18px",
          }}
        >
          Hover over each card to discover famous women athletes from that state.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
          }}
        >
          {states.map((item, index) => (
            <div
              key={index}
              title={item.athlete}
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,.1)",
                cursor: "pointer",
                transition: ".3s",
              }}
            >
              <h3 style={{ color: "#e91e63" }}>
                📍 {item.state}
              </h3>

              <p>{item.athlete}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default IndiaMap;
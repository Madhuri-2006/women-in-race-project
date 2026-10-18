import { Link } from "react-router-dom";
import "./Features.css";

const FEATURES = [
  {
    icon: "🗺️",
    title: "Map of Champions",
    description:
      "See which states produce India's women heroes. An interactive map you won't find anywhere else.",
    to: "/india-map",
  },
  {
    icon: "📊",
    title: "The Gap Dashboard",
    description:
      "Hard data on how women's sports is covered vs men's. The numbers will surprise you.",
    to: "/gap-dashboard",
  },
  {
    icon: "🤖",
    title: "AI Inspire Me",
    description:
      "Tell us your struggle. We'll find the athlete whose story speaks to yours.",
    to: "/inspire",
  },
];

function Features() {
  return (
    <section className="features">
      <div className="features-grid">
        {FEATURES.map((feature) => (
          <Link to={feature.to} className="feature-card" key={feature.title}>
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Features;

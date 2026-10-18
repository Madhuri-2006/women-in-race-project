import { Link } from "react-router-dom";
import StatCounter from "../StatCounter/StatCounter";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-left">
        <p className="hero-eyebrow">CELEBRATING WOMEN WHO CHANGED THE GAME</p>

        <h1 className="hero-headline">
          She Ran. She Won. <span className="accent">She Inspired.</span>
        </h1>

        <p className="hero-sub">
          A data platform tracking women's achievements in sports, science, and tech —
          with a focus on India's unsung champions.
        </p>

        <div className="hero-actions">
          <Link to="/athletes" className="btn-primary">
            Explore Athletes →
          </Link>
          <Link to="/gap-dashboard" className="btn-secondary">
            See the Gap →
          </Link>
        </div>
      </div>

      <div className="hero-right">
        <StatCounter value={47} label="Olympic medals by Indian women" />
        <StatCounter value={200} suffix="+" label="Women profiled on this platform" />
        <StatCounter value={28} label="States with women champions" />
        <StatCounter value={15} label="Sports covered" />
      </div>
    </section>
  );
}

export default Hero;

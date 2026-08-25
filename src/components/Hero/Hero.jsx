import "./Hero.css";

function Hero() {
  return (
<section className="hero" id="home">
      <div className="hero-content">

        <h1>
          Celebrating Women in Sports
        </h1>

        <p>
          Discover inspiring women athletes,
          their achievements, inspiring stories,
          and upcoming events across India.
        </p>

        <button className="hero-btn">
          Explore Athletes
        </button>

      </div>

      <div className="hero-image">

       <img src="/images/hero.jpg" alt="Women In Race" />

      </div>

    </section>
  );
}

export default Hero;
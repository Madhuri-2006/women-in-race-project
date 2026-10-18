import Layout from "../components/Layout/Layout";
import Hero from "../components/Hero/Hero";
import Marquee from "../components/Marquee/Marquee";
import Features from "../components/Features/Features";
import FeaturedAthletes from "../components/FeaturedAthletes/FeaturedAthletes";
import Achievements from "../components/Achievements/Achievements";
import Events from "../components/Events/Events";
import Gallery from "../components/Gallery/Gallery";
import IndiaMap from "../components/IndiaMap/IndiaMap";
import QuizPromo from "../components/QuizPromo/QuizPromo";

function Home() {
  return (
    <Layout>
      <Hero />

      <Marquee />

      <QuizPromo />

      <Features />

      <FeaturedAthletes />

      <Achievements />

      <Events />

      <Gallery />

      <IndiaMap />
    </Layout>
  );
}

export default Home;
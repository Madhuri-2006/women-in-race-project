import Layout from "../components/Layout/Layout";
import Hero from "../components/Hero/Hero";
import FeaturedAthletes from "../components/FeaturedAthletes/FeaturedAthletes";
import Achievements from "../components/Achievements/Achievements";
import Events from "../components/Events/Events";
import Gallery from "../components/Gallery/Gallery";
import IndiaMap from "../components/IndiaMap/IndiaMap";

function Home() {
  return (
    <Layout>
      <Hero />

      <FeaturedAthletes />

      <Achievements />

      <Events />

      <Gallery />

      <IndiaMap />
    </Layout>
  );
}

export default Home;
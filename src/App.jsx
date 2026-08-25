import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Athletes from "./pages/Athletes";
import AthleteDetails from "./pages/AthleteDetails";
import AthleteManager from "./pages/AthleteManager";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import LiveScores from "./pages/LiveScores";
import AdminScores from "./pages/AdminScores";
import IndiaMap from "./pages/IndiaMap";
import Inspire from "./pages/Inspire";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/athletes" element={<Athletes />} />
      <Route path="/athletes/:id" element={<AthleteDetails />} />
      <Route path="/athlete-manager" element={<AthleteManager />} />

      <Route path="/events" element={<Events />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />

      <Route path="/live-scores" element={<LiveScores />} />
      <Route path="/admin-scores" element={<AdminScores />} />

      <Route path="/inspire" element={<Inspire />} />
      <Route path="/india-map" element={<IndiaMap />} />
    </Routes>
  );
}

export default App;
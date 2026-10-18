import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Athletes from "./pages/Athletes";
import AthleteDetails from "./pages/AthleteDetails";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import LiveScores from "./pages/LiveScores";
import IndiaMap from "./pages/IndiaMap";
import Inspire from "./pages/Inspire";
import GapDashboard from "./pages/GapDashboard";
import Quiz from "./pages/Quiz";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminRoute from "./components/AdminRoute/AdminRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/athletes" element={<Athletes />} />
      <Route path="/athletes/:id" element={<AthleteDetails />} />

      <Route path="/events" element={<Events />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />

      <Route path="/live-scores" element={<LiveScores />} />
      <Route path="/quiz" element={<Quiz />} />

      <Route path="/inspire" element={<Inspire />} />
      <Route path="/india-map" element={<IndiaMap />} />
      <Route path="/gap-dashboard" element={<GapDashboard />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/:section?"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
      {/* Old, unprotected admin URLs now live inside the admin panel. */}
      <Route path="/athlete-manager" element={<Navigate to="/admin/athletes" replace />} />
      <Route path="/admin-scores" element={<Navigate to="/admin/scores" replace />} />
    </Routes>
  );
}

export default App;

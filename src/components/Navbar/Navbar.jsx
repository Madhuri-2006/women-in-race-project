import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <h2>Women In Race</h2>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>

        <li>
          <NavLink to="/athletes">Athletes</NavLink>
        </li>

        <li>
          <NavLink to="/events">Events</NavLink>
        </li>

        <li>
          <NavLink to="/live-scores">Live Scores</NavLink>
        </li>

        <li>
          <NavLink to="/india-map">India Map</NavLink>
        </li>

        <li>
          <NavLink to="/inspire">Inspire Me</NavLink>
        </li>

        <li>
          <NavLink to="/gallery">Gallery</NavLink>
        </li>

        <li>
          <NavLink to="/about">About</NavLink>
        </li>

        <li>
          <NavLink to="/contact">Contact</NavLink>
        </li>

        <li>
  <NavLink to="/india-map">
    India Map
  </NavLink>
</li>
      </ul>

      <NavLink to="/login" className="login-btn">
        Login
      </NavLink>
    </nav>
  );
}

export default Navbar;
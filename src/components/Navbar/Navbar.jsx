import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const PRIMARY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/athletes", label: "Athletes" },
  { to: "/quiz", label: "Daily Quiz" },
  { to: "/live-scores", label: "Live Scores" },
  { to: "/india-map", label: "India Map" },
  { to: "/inspire", label: "Inspire Me" },
];

const MORE_LINKS = [
  { to: "/gap-dashboard", label: "Gap Dashboard" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const { currentUser, isAdmin, logOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logOut();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h2>Women In Race</h2>
      </div>

      <ul className="nav-links">
        {PRIMARY_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} end={link.to === "/"}>
              {link.label}
            </NavLink>
          </li>
        ))}

        <li className="nav-more">
          <span className="nav-more-trigger" tabIndex={0}>
            More <span className="nav-more-caret">▾</span>
          </span>
          <ul className="nav-dropdown">
            {MORE_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </li>
      </ul>

      {currentUser ? (
        <div className="nav-user">
          {isAdmin && (
            <NavLink to="/admin" className="admin-link">
              Admin
            </NavLink>
          )}
          {currentUser.photoURL ? (
            <img className="nav-avatar" src={currentUser.photoURL} alt="" />
          ) : (
            <div className="nav-avatar nav-avatar-fallback">
              {(currentUser.displayName || currentUser.phoneNumber || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          <span className="nav-username">
            {currentUser.displayName || currentUser.phoneNumber}
          </span>
          <button type="button" className="signout-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      ) : (
        <NavLink to="/login" className="login-btn">
          Login
        </NavLink>
      )}
    </nav>
  );
}

export default Navbar;

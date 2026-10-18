import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
<footer className="footer" id="contact">
      <h2>Women In Race</h2>

      <p>
        Celebrating the achievements of women athletes across India.
      </p>

      <p>
        © 2026 Women In Race. All Rights Reserved.
      </p>

      <p className="footer-admin">
        <Link to="/admin/login">Admin login</Link>
      </p>

    </footer>
  );
}

export default Footer;

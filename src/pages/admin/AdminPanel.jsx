import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ResourceManager from "./ResourceManager";
import { athletesConfig, eventsConfig, scoresConfig, quizConfig } from "./resources";
import { Dashboard, LettersAdmin, QuizScoresAdmin, AdminsAdmin } from "./AdminSections";
import "./Admin.css";

const SECTIONS = [
  { key: "dashboard", label: "Dashboard", icon: "◧" },
  { key: "athletes", label: "Athletes", icon: "★" },
  { key: "events", label: "Events", icon: "▦" },
  { key: "scores", label: "Live Scores", icon: "●" },
  { key: "quiz", label: "Quiz", icon: "?" },
  { key: "letters", label: "Letters", icon: "✉" },
  { key: "admins", label: "Admins", icon: "⚿" },
];

function AdminPanel() {
  const { section = "dashboard" } = useParams();
  const navigate = useNavigate();
  const { currentUser, adminRole, logOut } = useAuth();

  const go = (key) => navigate(key === "dashboard" ? "/admin" : `/admin/${key}`);

  const handleSignOut = async () => {
    await logOut();
    navigate("/admin/login");
  };

  let content;
  switch (section) {
    case "athletes":
      content = <ResourceManager key="athletes" config={athletesConfig} />;
      break;
    case "events":
      content = <ResourceManager key="events" config={eventsConfig} />;
      break;
    case "scores":
      content = (
        <>
          <p className="adm-tip">
            Changes appear instantly on the public <a href="/live-scores" target="_blank" rel="noreferrer">Live Scores</a> page.
            Use + / − for numeric scores, or Edit for text like “247/6 (47.2 ov)”.
          </p>
          <ResourceManager key="scores" config={scoresConfig} />
        </>
      );
      break;
    case "quiz":
      content = (
        <>
          <p className="adm-tip">
            Active custom questions are mixed into the daily challenge (up to 3 per day) alongside questions
            generated automatically from athlete data.
          </p>
          <ResourceManager key="quiz" config={quizConfig} />
          <QuizScoresAdmin />
        </>
      );
      break;
    case "letters":
      content = <LettersAdmin />;
      break;
    case "admins":
      content = <AdminsAdmin />;
      break;
    default:
      content = <Dashboard onNavigate={go} />;
  }

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <span>Women In Race</span>
          <small>Admin Console</small>
        </div>
        <nav className="adm-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={section === s.key ? "active" : ""}
              onClick={() => go(s.key)}
            >
              <span className="adm-nav-icon" aria-hidden="true">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="adm-user">
          <p className="adm-user-email">{currentUser?.email}</p>
          <span className="adm-badge">{adminRole === "superadmin" ? "Super admin" : "Admin"}</span>
          <div className="adm-user-actions">
            <Link to="/" className="adm-btn small ghost">View site</Link>
            <button type="button" className="adm-btn small ghost" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>
      </aside>

      <main className="adm-main">{content}</main>
    </div>
  );
}

export default AdminPanel;

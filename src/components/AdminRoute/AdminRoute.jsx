import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Gate for /admin. UI-only — the real enforcement is in firestore.rules,
// which reject writes from anyone not listed in the admins collection.
function AdminRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="admin-gate">Checking access…</div>;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default AdminRoute;

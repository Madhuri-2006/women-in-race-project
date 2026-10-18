import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function AdminLogin() {
  const {
    currentUser,
    isAdmin,
    loading,
    signInWithEmail,
    signInWithGoogle,
    resendVerification,
    logOut,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!loading && currentUser && isAdmin) {
      navigate(location.state?.from || "/admin", { replace: true });
    }
  }, [loading, currentUser, isAdmin, navigate, location.state]);

  const run = async (fn) => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleEmail = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your admin email and password.");
      return;
    }
    run(() => signInWithEmail(email, password));
  };

  const signedInButNotAdmin = !loading && currentUser && !isAdmin;
  const unverified = currentUser && currentUser.email && !currentUser.emailVerified;

  return (
    <div className="login-page admin-login-page">
      <div className="login-box">
        <p className="login-eyebrow">RESTRICTED AREA</p>
        <h1>
          Admin <span className="accent">Console</span>
        </h1>
        <p className="login-sub">Sign in with an account that has been granted admin access.</p>

        {error && <div className="login-error">{error}</div>}
        {info && <div className="login-info">{info}</div>}

        {signedInButNotAdmin ? (
          <div className="login-form">
            <div className="login-error">
              <strong>{currentUser.email || currentUser.phoneNumber}</strong> is signed in but doesn't have
              admin access. Ask a super admin to add this email in Admin → Admins.
            </div>
            {unverified && (
              <button
                type="button"
                className="link-btn"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await resendVerification();
                    setInfo("Verification email sent. Verify, then sign in again.");
                  })
                }
              >
                Your email isn't verified yet. Resend verification email
              </button>
            )}
            <button type="button" className="primary-btn" onClick={() => logOut()}>
              Sign out and use another account
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleEmail} className="login-form">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                className="otp-input admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                className="otp-input admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button type="submit" className="primary-btn" disabled={busy || loading}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="google-btn"
              disabled={busy || loading}
              onClick={() => run(signInWithGoogle)}
            >
              Continue with Google
            </button>
          </>
        )}

        <p className="login-back">
          <Link to="/">← Back to Women In Race</Link>
        </p>
      </div>
    </div>
  );
}

function friendlyError(err) {
  const code = err?.code || "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found")
    return "Incorrect email or password.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
  if (code === "auth/popup-closed-by-user") return "Sign-in was cancelled.";
  if (code === "auth/operation-not-allowed")
    return "Email/password sign-in isn't enabled in Firebase Authentication yet.";
  if (code === "auth/network-request-failed") return "Network error. Check your connection.";
  return err?.message || "Something went wrong. Please try again.";
}

export default AdminLogin;

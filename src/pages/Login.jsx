import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

function Login() {
  const { currentUser, signInWithGoogle, sendOtp, confirmOtp, clearRecaptcha } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("enter-phone"); // "enter-phone" | "enter-otp"
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    return () => clearRecaptcha();
  }, [clearRecaptcha]);

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    const fullNumber = `+91${digits}`;

    setPhoneLoading(true);
    try {
      await sendOtp(fullNumber, RECAPTCHA_CONTAINER_ID);
      setPhase("enter-otp");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit code sent to your phone.");
      return;
    }

    setPhoneLoading(true);
    try {
      await confirmOtp(otp.trim());
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleChangeNumber = () => {
    clearRecaptcha();
    setOtp("");
    setError("");
    setPhase("enter-phone");
  };

  return (
    <Layout>
      <div className="login-page">
        <div className="login-box">
          <p className="login-eyebrow">CELEBRATING WOMEN WHO CHANGED THE GAME</p>
          <h1>
            Sign In to <span className="accent">Women In Race</span>
          </h1>
          <p className="login-sub">
            Bookmark athletes, write letters of support, and get your own AI-matched champion.
          </p>

          {error && <div className="login-error">{error}</div>}

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <GoogleIcon />
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="login-divider">
            <span>or use your phone number</span>
          </div>

          {phase === "enter-phone" && (
            <form onSubmit={handleSendOtp} className="login-form">
              <label htmlFor="phone">Mobile number</label>
              <div className="phone-input">
                <span className="phone-prefix">+91</span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button type="submit" className="primary-btn" disabled={phoneLoading}>
                {phoneLoading ? "Sending code..." : "Send OTP"}
              </button>
            </form>
          )}

          {phase === "enter-otp" && (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <label htmlFor="otp">Enter the 6-digit code sent to +91 {phone}</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                className="otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="submit" className="primary-btn" disabled={phoneLoading}>
                {phoneLoading ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button type="button" className="link-btn" onClick={handleChangeNumber}>
                Change number
              </button>
            </form>
          )}

          <div id={RECAPTCHA_CONTAINER_ID}></div>

          <p className="login-back">
            <Link to="/admin/login">Are you an admin? Sign in to the admin console →</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

function friendlyError(err) {
  const code = err?.code || "";
  if (code === "auth/invalid-phone-number") return "That phone number doesn't look right.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please try again later.";
  if (code === "auth/invalid-verification-code") return "That code is incorrect. Try again.";
  if (code === "auth/code-expired") return "That code expired. Request a new one.";
  if (code === "auth/popup-closed-by-user") return "Sign-in was cancelled.";
  if (code === "auth/network-request-failed") return "Network error. Check your connection.";
  return err?.message || "Something went wrong. Please try again.";
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default Login;

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { getAdminRole } from "../services/adminService";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  // null = not an admin, otherwise "admin" | "superadmin"
  const [adminRole, setAdminRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAdminRole(user ? await getAdminRole(user) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signInWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email.trim(), password);

  const resendVerification = () =>
    auth.currentUser ? sendEmailVerification(auth.currentUser) : Promise.resolve();

  const setupRecaptcha = (containerId) => {
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });
    return window.recaptchaVerifier;
  };

  const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      delete window.recaptchaVerifier;
    }
  };

  const sendOtp = async (phoneNumber, containerId) => {
    const verifier = setupRecaptcha(containerId);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      return confirmationResult;
    } catch (err) {
      clearRecaptcha();
      throw err;
    }
  };

  const confirmOtp = async (code) => {
    if (!window.confirmationResult) {
      throw new Error("Your OTP session expired. Please request a new code.");
    }
    const result = await window.confirmationResult.confirm(code);
    delete window.confirmationResult;
    return result;
  };

  const logOut = () => signOut(auth);

  const value = {
    currentUser,
    loading,
    adminRole,
    isAdmin: Boolean(adminRole),
    isSuperAdmin: adminRole === "superadmin",
    signInWithGoogle,
    signInWithEmail,
    resendVerification,
    sendOtp,
    confirmOtp,
    clearRecaptcha,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

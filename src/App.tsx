// Last update: 2026-05-18 22:10
import React, { useState, useEffect } from "react";
import { RegistrationForm } from "./pages/RegistrationForm";
import { SuccessPage } from "./components/ui/SuccessPage";
import { LoginPage } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

// REVISI SOP: Menggunakan URL Akurat Hasil Deployment Terbaru Anda (...pooNxaZA)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyu3OmU4ZeHfze8KDa1X45gZr8a9V_X3T95WuOfucJyuEu40K8_s9mwO0Ehi5pooNxaZA/exec";

export default function App() {
  const isDashboardPath = window.location.pathname.includes("/dashboard");

  const [view, setView] = useState<"form" | "login" | "admin">(
    isDashboardPath && localStorage.getItem("isLoggedIn") === "true" ? "admin" : "form"
  );
  const [submitted, setSubmitted] = useState(false);
  const [lastReg, setLastReg] = useState({ name: "", desa: "" });

  // REVISI SOP: Sinkronisasi URL Browser secara dinamis berdasarkan state aktif aplikasi
  useEffect(() => {
    if (view === "admin") {
      if (!window.location.pathname.includes("/dashboard")) {
        window.history.pushState({}, "", "/dashboard");
      }
    } else if (view === "login") {
      if (!window.location.pathname.includes("/login")) {
        window.history.pushState({}, "", "/login");
      }
    } else {
      if (window.location.pathname !== "/") {
        window.history.pushState({}, "", "/");
      }
    }
  }, [view]);

  const handleLogin = (password: string) => {
    if (password === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      setView("admin");
      window.scrollTo(0, 0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setView("form");
    window.scrollTo(0, 0);
  };

  // Tampilan Halaman Sukses
  if (submitted && view === "form") {
    return (
      <SuccessPage
        userName={lastReg.name}
        userDesa={lastReg.desa}
        onBack={() => {
          setSubmitted(false);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  // Tampilan Halaman Login Portal
  if (view === "login") {
    return <LoginPage onLogin={handleLogin} onBack={() => setView("form")} />;
  }

  // Tampilan Dasbor Utama Admin (Full CRUD Mode)
  if (view === "admin") {
    return (
      <Dashboard
        googleScriptUrl={GOOGLE_SCRIPT_URL}
        onLogout={handleLogout}
      />
    );
  }

  // Tampilan Utama Form Pendaftaran Warga
  return (
    <RegistrationForm
      setSubmitted={(data) => {
        setLastReg(data);
        setSubmitted(true);
      }}
      setShowAdminModal={() => {
        setView("login");
        window.scrollTo(0, 0);
      }}
    />
  );
}
// Last update: 2026-06-03 - Replaced Supabase with localStorage auth
import React, { useState, useEffect } from "react";
import { RegistrationForm } from "./pages/RegistrationForm";
import { SuccessPage } from "./components/ui/SuccessPage";
import { LoginPage } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

// REVISI SOP: Mengembalikan ke URL Database Produksi Asli Anda yang Valid
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztG8z0ob1ULpzkYXIIbaV1PokdR_dO4qj7TSD0rnwz8qb77QlJNrUQM0DHwNwXFC_reQ/exec";

export default function App() {
  const isDashboardPath = window.location.pathname.includes("/dashboard");

  const [view, setView] = useState<"form" | "login" | "admin">("form");
  const [submitted, setSubmitted] = useState(false);
  const [lastReg, setLastReg] = useState({ name: "", desa: "" });
  const [userRole, setUserRole] = useState<string>("admin"); // default to read-only admin

  // Initial Auth Check using localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("armedia_admin_role");
    
    if (savedRole) {
      setUserRole(savedRole);
      setView("admin");
    } else {
      if (isDashboardPath) {
        setView("login");
      } else {
        setView("form");
      }
    }
  }, [isDashboardPath]);

  // Sinkronisasi URL Browser secara dinamis berdasarkan state aktif aplikasi
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

  const handleLogout = () => {
    localStorage.removeItem("armedia_admin_role");
    setUserRole("admin");
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
    return (
      <LoginPage
        onBack={() => setView("form")}
        onFallbackLogin={(email: string, role: string) => {
          console.log("[App] Login berhasil:", email, role);
          localStorage.setItem("armedia_admin_role", role);
          setUserRole(role);
          setView("admin");
        }}
      />
    );
  }

  // Tampilan Dasbor Utama Admin (Full CRUD Mode atau Read-Only berdasarkan userRole)
  if (view === "admin") {
    return (
      <Dashboard
        googleScriptUrl={GOOGLE_SCRIPT_URL}
        onLogout={handleLogout}
        userRole={userRole}
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
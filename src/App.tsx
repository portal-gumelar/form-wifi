// Last update: 2026-05-18 22:40 - Restored Original Production Database URL
import React, { useState, useEffect } from "react";
import { RegistrationForm } from "./pages/RegistrationForm";
import { SuccessPage } from "./components/ui/SuccessPage";
import { LoginPage } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

import { supabase } from "./utils/supabaseClient";

// REVISI SOP: Mengembalikan ke URL Database Produksi Asli Anda yang Valid
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztG8z0ob1ULpzkYXIIbaV1PokdR_dO4qj7TSD0rnwz8qb77QlJNrUQM0DHwNwXFC_reQ/exec";

export default function App() {
  const isDashboardPath = window.location.pathname.includes("/dashboard");

  const [view, setView] = useState<"form" | "login" | "admin">(
    isDashboardPath ? "login" : "form"
  );
  const [submitted, setSubmitted] = useState(false);
  const [lastReg, setLastReg] = useState({ name: "", desa: "" });
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("admin"); // default to read-only admin

  // Monitor auth state changes in Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        determineUserRole(session.user);
        setView("admin");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        determineUserRole(session.user);
        setView("admin");
      } else {
        setUserRole("admin");
        if (window.location.pathname.includes("/dashboard")) {
          setView("login");
        } else {
          setView("form");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const determineUserRole = async (user: any) => {
    if (!user) return;
    
    // Default fallback based on email pattern
    let role = "admin";
    if (user.email && (user.email === "superadmin@armedia.id" || user.email.startsWith("superadmin"))) {
      role = "superadmin";
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
        
      if (data && data.role) {
        role = data.role;
      }
    } catch (err) {
      console.log("Gagal menanyakan user_roles, menggunakan email fallback:", err);
    }
    
    setUserRole(role);
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
          console.log("[App] Fallback login berhasil:", email, role);
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
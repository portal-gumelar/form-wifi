// AUDIT FIX: App.tsx - JWT-based auth, hapus Google Script URL dari frontend
// - Tidak ada GOOGLE_SCRIPT_URL di sini
// - Auth berdasarkan JWT token di localStorage (bukan role string)
// - Redirect otomatis berdasarkan token validity
import React, { useState, useEffect } from "react";
import { RegistrationForm } from "./pages/RegistrationForm";
import { SuccessPage } from "./components/ui/SuccessPage";
import { LoginPage } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { api, tokenStore } from "./utils/apiClient";

type AppView = "form" | "login" | "dashboard";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const isDashboardPath = window.location.pathname.startsWith("/dashboard");
  const isLoginPath     = window.location.pathname.startsWith("/login");

  const [view,      setView]      = useState<AppView>("form");
  const [submitted, setSubmitted] = useState(false);
  const [lastReg,   setLastReg]   = useState<any>(null);
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Added loading state

  // --- Initial Auth Check ---
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStore.getAccess();
      if (!token) {
        if (isDashboardPath) setView("login");
        else if (isLoginPath) setView("login");
        else setView("form");
        setIsCheckingAuth(false);
        return;
      }

      try {
        const userData = await api.getMe();
        setUser(userData as AuthUser);
        localStorage.setItem("armedia_user", JSON.stringify(userData));
        setView("dashboard");
      } catch (err) {
        tokenStore.clear();
        setView(isDashboardPath || isLoginPath ? "login" : "form");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    initAuth();
  }, [isDashboardPath, isLoginPath]);

  // --- Sync URL dengan view state ---
  useEffect(() => {
    if (view === "dashboard") {
      if (!window.location.pathname.startsWith("/dashboard")) {
        window.history.pushState({}, "", "/dashboard");
      }
    } else if (view === "login") {
      if (!window.location.pathname.startsWith("/login")) {
        window.history.pushState({}, "", "/login");
      }
    } else {
      if (window.location.pathname !== "/") {
        window.history.pushState({}, "", "/");
      }
    }
  }, [view]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch { /* ignore */ }
    tokenStore.clear();
    setUser(null);
    setView("form");
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    setView("dashboard");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0d1655] flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#F47920]/30 border-t-[#F47920] rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-white mt-8 tracking-widest uppercase">Memuat Sistem...</h2>
      </div>
    );
  }

  // Success Page setelah submit form
  if (submitted && view === "form") {
    return (
      <SuccessPage
        data={lastReg}
        onBack={() => {
          setSubmitted(false);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  // Login Page
  if (view === "login") {
    return (
      <LoginPage
        onBack={() => setView("form")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Dashboard (Admin)
  if (view === "dashboard" && user) {
    return (
      <Dashboard
        onLogout={handleLogout}
        userRole={user.role}
        user={user}
      />
    );
  }

  // Form Pendaftaran Publik
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
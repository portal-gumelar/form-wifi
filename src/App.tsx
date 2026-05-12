import React, { useState } from "react";
import { RegistrationForm } from "./pages/RegistrationForm";
import { SuccessPage } from "./components/ui/SuccessPage";
import Dashboard from "./pages/Dashboard";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgrxe5UXu5PqMj7B-sIB_gYktCVOVFZKPwGzwUWrOuAAww0UM47YuWr6MhAs847_GF_A/exec";

export default function App() {
  const [view, setView] = useState<"form" | "admin">("form");
  const [submitted, setSubmitted] = useState(false);
  const [lastReg, setLastReg] = useState({ name: "", desa: "" });

  // Success Page Logic
  if (submitted && view === "form") {
    return <SuccessPage userName={lastReg.name} userDesa={lastReg.desa} onBack={() => { setSubmitted(false); window.scrollTo(0, 0); }} />;
  }

  // Admin Dashboard View
  if (view === "admin") {
    return (
      <Dashboard 
        googleScriptUrl={GOOGLE_SCRIPT_URL} 
        onLogout={() => {
          setView("form");
          window.scrollTo(0, 0);
        }} 
      />
    );
  }

  return (
    <RegistrationForm 
      setSubmitted={(data) => {
        setLastReg(data);
        setSubmitted(true);
      }} 
      setShowAdminModal={() => {
        setView("admin");
        window.scrollTo(0, 0);
      }} 
    />
  );
}

import React, { useState } from "react";
import { RegistrationForm } from "./pages/RegistrationForm";
import { SuccessPage } from "./components/ui/SuccessPage";
import Dashboard from "./pages/Dashboard";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyo_6xHxq2Qge71soIUW_Svi5toI69lm3KmZFKS8Ac7BhuW_vl6eE4pTB9SB-QmS__lZg/exec";

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

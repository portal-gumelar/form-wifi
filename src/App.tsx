import React, { useState } from "react";
import { RegistrationForm } from "./pages/RegistrationForm";
import Dashboard from "./pages/Dashboard";
import { SuccessPage, AdminLoginModal } from "./components/Modals";

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<"form" | "dashboard">("form");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Router Logic
  if (submitted) {
    return <SuccessPage onBack={() => { setSubmitted(false); window.scrollTo(0, 0); }} />;
  }

  if (view === "dashboard" && isAdmin) {
    return (
      <Dashboard 
        googleScriptUrl="https://script.google.com/macros/s/AKfycbzoakyfPcNDtceHrLRluX-4t5IrZX7AvpVTx7-r49ftIARFnxh_-qxDCWXt5itsYMCyHA/exec"
        onLogout={() => { setIsAdmin(false); setView("form"); }} 
        onNavigateToForm={() => setView("form")}
      />
    );
  }

  return (
    <>
      <RegistrationForm 
        setSubmitted={setSubmitted} 
        setShowAdminModal={setShowAdminModal} 
      />
      
      {showAdminModal && (
        <AdminLoginModal 
          onClose={() => setShowAdminModal(false)} 
          onSuccess={() => { 
            setIsAdmin(true); 
            setView("dashboard"); 
            setShowAdminModal(false); 
          }} 
        />
      )}
    </>
  );
}

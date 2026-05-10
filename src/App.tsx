import React, { useState } from "react";
import { RegistrationForm } from "./pages/RegistrationForm";
import { SuccessPage } from "./components/ui/SuccessPage";

export default function App() {
  const [submitted, setSubmitted] = useState(false);

  // Router Logic
  if (submitted) {
    return <SuccessPage onBack={() => { setSubmitted(false); window.scrollTo(0, 0); }} />;
  }

  return (
    <RegistrationForm 
      setSubmitted={setSubmitted} 
      setShowAdminModal={() => {
        window.location.href = "/dashboard.html";
      }} 
    />
  );
}

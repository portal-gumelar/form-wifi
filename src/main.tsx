import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { CookieConsent } from "./components/ui/CookieConsent";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <CookieConsent />
  </StrictMode>
);

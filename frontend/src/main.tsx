import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { AuthContextProvider, LanguageContextProvider } from "./contexts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageContextProvider>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </LanguageContextProvider>
  </StrictMode>
);

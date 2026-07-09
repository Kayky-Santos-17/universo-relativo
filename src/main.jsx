import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SessionProvider } from "./contexts/SessionContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import SessionModal from "./components/SessionModal";
import AppRoutes from "./routes/AppRoutes";
import "./assets/css/variables.css";
import "./assets/css/global.css";
import "./assets/css/session-modal.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
          <SessionProvider>
            <AuthProvider>
              <ThemeProvider>
                <ToastProvider>
                  <SidebarProvider>
                    <SessionModal />
                    <AppRoutes />
                  </SidebarProvider>
                </ToastProvider>
              </ThemeProvider>
            </AuthProvider>
          </SessionProvider>
        </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

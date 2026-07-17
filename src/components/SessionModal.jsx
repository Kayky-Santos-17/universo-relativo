import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/auth";
import Astronaut from "./Astronaut/Astronaut";

export default function SessionModal() {
  const { user } = useAuth();
  const { sessionValid, handleLogin, resetSession } = useSession();
  const navigate = useNavigate();
  const [takingControl, setTakingControl] = useState(false);

  if (sessionValid) return null;

  const handleTakeControl = async () => {
    if (!user?.uid) {
      navigate("/login", { replace: true });
      return;
    }
    setTakingControl(true);
    try {
      await handleLogin(user.uid, { recovered: true });
    } catch {
      navigate("/login", { replace: true });
    } finally {
      setTakingControl(false);
    }
  };

  const handleQuit = () => {
    resetSession();
    logout().catch(() => {});
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="session-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.preventDefault()}
      tabIndex={-1}
    >
      <div className="session-modal-dialog">
        <div className="session-modal-astro" aria-hidden="true">
          <Astronaut size="xs" animated={false} />
        </div>
        <div className="session-modal-content">
          <div className="session-modal-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h2 className="session-modal-title">Sessão concorrente</h2>
          <p className="session-modal-desc">
            Outro dispositivo fez login com esta conta.
          </p>
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            <button
              className="session-modal-btn"
              onClick={handleTakeControl}
              disabled={takingControl}
              autoFocus
            >
              {takingControl ? "Recuperando..." : "Recuperar sessão"}
            </button>
            <button
              className="session-modal-btn secondary"
              onClick={handleQuit}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

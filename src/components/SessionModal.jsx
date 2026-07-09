import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { forceLogout } from "../services/auth";
import Astronaut from "./Astronaut/Astronaut";

export default function SessionModal() {
  const { sessionValid, resetSession } = useSession();
  const navigate = useNavigate();
  const loggedOutRef = useRef(false);

  useEffect(() => {
    if (sessionValid) {
      loggedOutRef.current = false;
    } else if (!loggedOutRef.current) {
      loggedOutRef.current = true;
      forceLogout().catch(() => {});
    }
  }, [sessionValid]);

  const handleReLogin = () => {
    resetSession();
    navigate("/login", { replace: true });
  };

  if (sessionValid) return null;

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
          <h2 className="session-modal-title">Sessão encerrada</h2>
          <p className="session-modal-desc">
            Sua sessão foi encerrada porque outro dispositivo fez login com esta conta.
          </p>
          <button
            className="session-modal-btn"
            onClick={handleReLogin}
            autoFocus
          >
            Fazer login novamente
          </button>
        </div>
      </div>
    </div>
  );
}

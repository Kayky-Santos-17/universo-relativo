import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { onAuthChange } from "../services/auth";
import {
  generateSessionId,
  startSession,
  clearSession,
  onSessionChange,
} from "../services/sessionService";

export const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessionId] = useState(() => generateSessionId());
  const [sessionValid, setSessionValid] = useState(true);
  const [sessionChecking, setSessionChecking] = useState(true);
  const uidRef = useRef(null);
  const unsubSnapshotRef = useRef(null);
  const ourSessionIdRef = useRef(null);

  useEffect(() => {
    const unsubAuth = onAuthChange((firebaseUser) => {
      uidRef.current = firebaseUser ? firebaseUser.uid : null;

      if (unsubSnapshotRef.current) {
        unsubSnapshotRef.current();
        unsubSnapshotRef.current = null;
      }

      if (!firebaseUser) {
        ourSessionIdRef.current = null;
        setSessionChecking(false);
        return;
      }

      unsubSnapshotRef.current = onSessionChange(firebaseUser.uid, (data) => {
        const remoteId = data?.activeSessionId ?? null;
        const localId = ourSessionIdRef.current;

        if (localId !== null && remoteId !== localId) {
          setSessionValid(false);
          console.warn(
            `[Session] Sessão encerrada: activeSessionId mudou de "${localId}" para "${remoteId}"`
          );
        }

        setSessionChecking(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubSnapshotRef.current) {
        unsubSnapshotRef.current();
      }
    };
  }, []);

  const handleLogin = useCallback(
    async (uid, metadata = {}) => {
      setSessionValid(true);
      ourSessionIdRef.current = sessionId;
      try {
        await startSession(uid, sessionId, metadata);
      } catch (err) {
        console.error("[Session] Erro ao iniciar sessão:", err);
      }
    },
    [sessionId]
  );

  const handleLogout = useCallback(async (uid) => {
    if (uid) {
      setSessionValid(true);
      ourSessionIdRef.current = null;
      try {
        await clearSession(uid);
      } catch (err) {
        console.error("[Session] Erro ao limpar sessão:", err);
      }
    }
  }, []);

  const resetSession = useCallback(() => {
    setSessionValid(true);
    ourSessionIdRef.current = null;
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        sessionValid,
        sessionChecking,
        handleLogin,
        handleLogout,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

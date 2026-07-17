import { createContext, useState, useEffect, useCallback, useRef } from "react";
import {
  onAuthChange,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  resetPassword as authResetPassword,
  loginWithGoogle as authLoginWithGoogle
} from "../services/auth";
import { getDocById, setDocById } from "../services/firestore";
import { COLECAO } from "../utils/constants";
import { useSession } from "../hooks/useSession";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const userRef = useRef(null);
  const { handleLogin, handleLogout } = useSession();

  const loadUserData = useCallback(async (firebaseUser) => {
    userRef.current = firebaseUser;
    setUser(firebaseUser);
    if (firebaseUser) {
      try {
        const snap = await getDocById(COLECAO.alunos, firebaseUser.uid);
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setIsAdmin(data.admin === true);
        } else {
          setUserData(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn("[Auth] Erro ao carregar dados do usuário:", err?.code || err?.message || err);
        setUserData(null);
        setIsAdmin(false);
      }
    } else {
      setUserData(null);
      setIsAdmin(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsub = onAuthChange(loadUserData);
    return unsub;
  }, [loadUserData]);

  const login = useCallback(async (email, password) => {
    const cred = await authLogin(email, password);
    const uid = cred.user.uid;
    await handleLogin(uid, {
      device: navigator.userAgent,
      browser: navigator.userAgent,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    });
    return cred.user;
  }, [handleLogin]);

  const loginWithGoogle = useCallback(async () => {
    const result = await authLoginWithGoogle();
    const fbUser = result.user;
    const uid = fbUser.uid;

    const snap = await getDocById(COLECAO.alunos, uid);
    if (!snap.exists()) {
      const newUserData = {
        nome: fbUser.displayName || "",
        email: fbUser.email,
        photoURL: fbUser.photoURL || "",
        ativo: true,
        admin: false,
        criadoEm: new Date(),
        provider: "google",
        progresso: { questoesRespondidas: 0, acertos: 0 }
      };
      await setDocById(COLECAO.alunos, uid, newUserData);
      setUserData(newUserData);
      setIsAdmin(false);
    }

    await handleLogin(uid, {
      device: navigator.userAgent,
      browser: navigator.userAgent,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    });
    return fbUser;
  }, [handleLogin]);

  const logout = useCallback(async () => {
    if (user) {
      await handleLogout(user.uid);
    }
    await authLogout();
  }, [user, handleLogout]);

  const register = useCallback(async (email, password) => {
    const cred = await authRegister(email, password);
    const uid = cred.user.uid;
    await handleLogin(uid, {
      device: navigator.userAgent,
      browser: navigator.userAgent,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    });
    return cred.user;
  }, [handleLogin]);

  const resetPassword = useCallback(async (email) => {
    await authResetPassword(email);
  }, []);

  const reloadUserData = useCallback(async () => {
    const fbUser = userRef.current;
    if (!fbUser) return;
    try {
      const snap = await getDocById(COLECAO.alunos, fbUser.uid);
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setIsAdmin(data.admin === true);
      }
    } catch {
      // silencioso
    }
  }, []);

  if (typeof window !== "undefined") {
    window.__isAdmin = isAdmin;
    window.__userUid = user?.uid;
    window.__userData = userData;
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, login, loginWithGoogle, logout, register, resetPassword, reloadUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

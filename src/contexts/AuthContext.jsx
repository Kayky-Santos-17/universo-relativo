import { createContext, useState, useEffect, useCallback } from "react";
import {
  onAuthChange,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  resetPassword as authResetPassword
} from "../services/auth";
import { getDocById } from "../services/firestore";
import { COLECAO } from "../utils/constants";
import { useSession } from "../hooks/useSession";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { handleLogin, handleLogout } = useSession();

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await getDocById(COLECAO.alunos, firebaseUser.uid);
          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);
            setIsAdmin(data.admin === true);
          }
        } catch {
          setUserData(null);
          setIsAdmin(false);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

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

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, login, logout, register, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

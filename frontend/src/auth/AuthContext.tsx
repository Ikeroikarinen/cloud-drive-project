import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, meApi } from "../api/endpoints";

export type AuthState = {
  token: string | null;
  userId: string | null;
  loading: boolean;

  login: (login: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;

  logout: () => void;
  setToken: (t: string | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

const LS_TOKEN = "cloud_drive_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(LS_TOKEN));
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  function setToken(t: string | null) {
    setTokenState(t);
    if (t) localStorage.setItem(LS_TOKEN, t);
    else localStorage.removeItem(LS_TOKEN);
  }

  function logout() {
    setToken(null);
    setUserId(null);
  }

  async function login(loginStr: string, password: string) {
    const res = await authApi.login(loginStr, password);
    setToken(res.token);
    setUserId(res.user.id);
  }

  async function register(username: string, email: string, password: string) {
    const res = await authApi.register(username, email, password);
    setToken(res.token);
    setUserId(res.user.id);
  }

  // validate token -> /api/me (nice to have)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setUserId(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const me = await meApi.get(token);
        if (!cancelled) setUserId(me.userId);
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      userId,
      loading,
      login,
      register,
      logout,
      setToken,
    }),
    [token, userId, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

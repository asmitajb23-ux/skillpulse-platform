"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSessionFromCookie, login as loginService, logout as logoutService, signup as signupService } from "@/services/auth";
import type { Profile, Role } from "@/types";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Profile>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<Profile>;
  logout: () => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setUser(getSessionFromCookie());
  }, []);

  useEffect(() => {
    setUser(getSessionFromCookie());
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await loginService(email, password);
    setUser(profile);
    return profile;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: Role) => {
    const profile = await signupService(name, email, password, role);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refresh }),
    [user, loading, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

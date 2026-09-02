"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthUser, UserResponse } from "@/lib/types";
import { getUser, saveUser, removeUser } from "@/lib/auth";
import apiClient from "@/lib/apiClient";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const stored = getUser();
      if (!stored) { setIsLoading(false); return; }
      setUser(stored);
      try {
        const res = await apiClient.get<UserResponse>("/api/users/me");
        const fresh: AuthUser = {
          ...stored,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role ?? stored.role ?? "TRAVELER",
          address: res.data.address ?? null,
          profilePhotoUrl: res.data.profilePhotoUrl ?? null,
        };
        saveUser(fresh);
        setUser(fresh);
      } catch {
        removeUser();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const login = useCallback((authUser: AuthUser) => { saveUser(authUser); setUser(authUser); }, []);
  const logout = useCallback(() => { removeUser(); setUser(null); }, []);

  const refreshUser = useCallback(async () => {
    const stored = getUser();
    if (!stored) return;
    try {
      const res = await apiClient.get<UserResponse>("/api/users/me");
      const fresh: AuthUser = {
        ...stored,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role ?? stored.role ?? "TRAVELER",
        address: res.data.address ?? null,
        profilePhotoUrl: res.data.profilePhotoUrl ?? null,
      };
      saveUser(fresh);
      setUser(fresh);
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

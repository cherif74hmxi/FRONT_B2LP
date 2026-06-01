"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginUser, logoutUser } from "./api";
import type { AuthSession, Utilisateur } from "./types";

const STORAGE_KEY = "b2lp_auth_session";

type AuthContextValue = {
  initialized: boolean;
  token?: string;
  user?: Utilisateur;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isAdminUser(user?: Utilisateur): boolean {
  // L'API peut renvoyer un role explicite, ou seulement l'utilisateur seed id 1.
  // Le backend reste la vraie securite ; ici on gere surtout l'affichage du menu.
  return user?.role === "admin";
}

function readStoredSession(): AuthSession | undefined {
  const rawSession = sessionStorage.getItem(STORAGE_KEY);

  if (!rawSession) {
    return undefined;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<AuthSession | undefined>();

  useEffect(() => {
    setSession(readStoredSession());
    setInitialized(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const nextSession = await loginUser(email, password);

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    const token = session?.access_token;

    if (token) {
      try {
        await logoutUser(token);
      } catch {
        // La session locale doit quand meme etre nettoyee si l'API ne repond pas.
      }
    }

    window.sessionStorage.removeItem(STORAGE_KEY);
    setSession(undefined);
  }, [session?.access_token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      token: session?.access_token,
      user: session?.user,
      isAuthenticated: Boolean(session?.access_token),
      isAdmin: isAdminUser(session?.user),
      login,
      logout,
    }),
    [initialized, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit etre utilise dans AuthProvider");
  }

  return context;
}

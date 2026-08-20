"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { redirect } from 'next/navigation'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

const GUEST_STORAGE_KEY = "pyramid_guest_mode";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

type AuthMode = "loading" | "guest" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  mode: AuthMode;
  user: AuthUser | null;
  /** Redirects the full page to the backend's Google OAuth start route. */
  loginWithGoogle: () => void;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  /** Called by /auth/callback once it has the token from the redirect fragment. */
  setSessionFromCallback: (accessToken: string) => Promise<void>;
  /**
   * Fetch wrapper for authenticated API calls. Attaches the current access
   * token, sends the refresh cookie, and — on a 401 — attempts exactly one
   * silent refresh + retry before giving up and falling back to
   * unauthenticated state.
   */
  authFetch: (path: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchMe = useCallback(async (token: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) return null;
      return (await res.json()) as AuthUser;
    } catch {
      return null;
    }
  }, []);

  /** Exchanges the httpOnly refresh cookie for a new access token. */
  const tryRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("refresh failed");
      const data = (await res.json()) as { accessToken: string };
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      setAccessToken(null);
      setUser(null);
      setMode("unauthenticated");
      return null;
    }
  }, []);

  // On first load: honor guest mode if set, otherwise attempt a silent
  // refresh to restore a previous session (access token lives only in
  // memory, so a page reload always starts with none — this is what lets
  // a returning logged-in user skip the Google redirect on every visit).
  useEffect(() => {
    const isGuest =
      typeof window !== "undefined" &&
      localStorage.getItem(GUEST_STORAGE_KEY) === "true";

    if (isGuest) {
      setMode("guest");
      return;
    }

    void (async () => {
      const token = await tryRefresh();
      if (!token) {
        setMode("unauthenticated");
        return;
      }
      const me = await fetchMe(token);
      setUser(me);
      setMode(me ? "authenticated" : "unauthenticated");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGoogle = useCallback(() => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    // Full page navigation, not a fetch — OAuth redirects need a real
    // browser navigation to Google and back.
    redirect(`${API_URL}/auth/google`);
  }, []);

  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_STORAGE_KEY, "true");
    setMode("guest");
  }, []);

  const setSessionFromCallback = useCallback(
    async (token: string) => {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setAccessToken(token);
      const me = await fetchMe(token);
      setUser(me);
      setMode(me ? "authenticated" : "unauthenticated");
    },
    [fetchMe],
  );

  const logout = useCallback(async () => {
    if (accessToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      }).catch(() => {
        // Logout is best-effort — clear local state regardless of whether
        // the request succeeded.
      });
    }
    localStorage.removeItem(GUEST_STORAGE_KEY);
    setAccessToken(null);
    setUser(null);
    setMode("unauthenticated");
  }, [accessToken]);

  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}): Promise<Response> => {
      const doFetch = (token: string | null) =>
        fetch(`${API_URL}${path}`, {
          ...options,
          credentials: "include",
          headers: {
            ...(options.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      let res = await doFetch(accessToken);

      if (res.status === 401) {
        const refreshed = await tryRefresh();
        if (refreshed) {
          res = await doFetch(refreshed);
        }
      }

      return res;
    },
    [accessToken, tryRefresh],
  );

  return (
    <AuthContext.Provider
      value={{
        mode,
        user,
        loginWithGoogle,
        continueAsGuest,
        logout,
        setSessionFromCallback,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

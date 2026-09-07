import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authStore, fetchMe } from "../lib/api";
import type { User } from "../lib/types";

interface AuthCtx {
  user: User | null;
  booting: boolean;
  setUser: (u: User | null) => void;
  loginSession: (user: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await fetchMe();
      if (alive) {
        setUser(me);
        setBooting(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const loginSession = useCallback((u: User, token: string) => {
    authStore.token = token;
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch { /* ignore */ }
    authStore.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  return <Ctx.Provider value={{ user, booting, setUser, loginSession, logout, updateUser }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

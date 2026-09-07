import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../context/ToastContext";

export function AuthOutlet() {
  return <RequireAuth><Outlet /></RequireAuth>;
}

export function RequireAuth({ children, orgOnly = false }: { children: ReactNode; orgOnly?: boolean }) {
  const { user, booting } = useAuth();
  const loc = useLocation();
  if (booting) return <PageLoader />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (orgOnly && !user.isOrg) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, booting } = useAuth();
  if (booting) return <PageLoader />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

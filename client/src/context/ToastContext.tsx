import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "../lib/icons";

type Kind = "ok" | "err" | "info";
interface Toast { id: number; kind: Kind; text: string }

const Ctx = createContext<{ toast: (text: string, kind?: Kind) => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((text: string, kind: Kind = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            <span className="tick">{t.kind === "ok" ? "" : t.kind === "err" ? "!" : "ℹ"}</span>
            <span style={{ flex: 1 }}>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}

export function errText(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Something went wrong. Please try again.";
}

export function Spinner({ size = 20 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-label="Loading" />;
}

export function PageLoader() {
  return (
    <div className="page-load">
      <Spinner size={34} />
    </div>
  );
}

export function Empty({ icon, title, text, children }: { icon?: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="big">{icon ? <Icon name={icon} size={56} color="#d0d5dd" /> : ""}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function ErrBox({ children }: { children: ReactNode }) {
  return (
    <div className="err-box">
      <Icon name="x" size={17} /> <span>{children}</span>
    </div>
  );
}

// OjaX API client — thin fetch wrapper with auth + auto-refresh.
import type { User } from "./types";

const TOKEN_KEY = "ojax_access_token";

let inFlightRefresh: Promise<string | null> | null = null;

export const authStore = {
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set token(t: string | null) {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function tryRefresh(): Promise<string | null> {
  if (inFlightRefresh) return inFlightRefresh;
  inFlightRefresh = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      authStore.token = data.accessToken;
      return data.accessToken as string;
    } catch {
      return null;
    }
  })().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

interface Opts {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  formData?: FormData;
  retried?: boolean;
}

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  const token = authStore.token;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(path, {
    method: opts.method || "GET",
    headers,
    body,
    credentials: "include",
  });

  if (res.status === 401 && !opts.retried && !path.includes("/auth/")) {
    const fresh = await tryRefresh();
    if (fresh) {
      return api<T>(path, { ...opts, retried: true });
    }
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const err = data?.error;
    throw new ApiError(res.status, err?.code || "request_failed", err?.message || "Request failed", err?.details);
  }
  return data as T;
}

// ---- typed helpers ----
export const get = <T>(p: string) => api<T>(p);
export const post = <T>(p: string, body?: unknown) => api<T>(p, { method: "POST", body });
export const patch = <T>(p: string, body?: unknown) => api<T>(p, { method: "PATCH", body });
export const del = <T>(p: string) => api<T>(p, { method: "DELETE" });

export interface Session {
  accessToken: string;
  user: User;
}

export async function fetchMe(): Promise<User | null> {
  try {
    const d = await api<{ user: User | null }>("/api/auth/me");
    return d.user;
  } catch {
    return null;
  }
}

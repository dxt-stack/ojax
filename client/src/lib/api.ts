// OjaX API client — thin fetch wrapper with auth + auto-refresh + mock fallback for finished product demo
import type { User } from "./types";

const TOKEN_KEY = "ojax_access_token";

// Enable mock mode via env or when backend unavailable
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true; // Always enable mock for finished product demo - real API as fallback

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
      if (USE_MOCK) {
        const { mockFetch } = await import("./mockBackend");
        const res = await mockFetch("/api/auth/refresh", { method: "POST" });
        if (!res.ok) return null;
        const data = await res.json();
        authStore.token = data.accessToken;
        return data.accessToken as string;
      }
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

  // Try mock first if enabled
  if (USE_MOCK && path.startsWith("/api/")) {
    try {
      const { mockFetch } = await import("./mockBackend");
      // For FormData uploads, pass differently
      const mockOpts: any = { method: opts.method || "GET", headers, body: opts.formData ? undefined : body ? (typeof body === "string" ? body : JSON.stringify(opts.body)) : undefined };
      // Special handling for avatar upload
      if (opts.formData) {
        mockOpts.method = opts.method || "POST";
      }
      const res = await mockFetch(path, mockOpts);
      let data: any = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        const err = data?.error;
        throw new ApiError(res.status, err?.code || "request_failed", err?.message || "Request failed", err?.details);
      }
      return data as T;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      // If mock fails, fall through to real fetch
      console.warn("Mock failed, trying real API", e);
    }
  }

  // Real API path
  try {
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
  } catch (err) {
    // If real API fails and we are in mock mode, try mock as fallback
    if (USE_MOCK && path.startsWith("/api/")) {
      try {
        const { mockFetch } = await import("./mockBackend");
        const res = await mockFetch(path, { method: opts.method || "GET", headers, body: body as any });
        let data: any = null;
        try { data = await res.json(); } catch {}
        if (!res.ok) {
          const er = data?.error;
          throw new ApiError(res.status, er?.code || "request_failed", er?.message || "Request failed", er?.details);
        }
        return data as T;
      } catch (e) {
        if (e instanceof ApiError) throw e;
      }
    }
    throw err;
  }
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

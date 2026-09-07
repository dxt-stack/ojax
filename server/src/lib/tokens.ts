import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";

export interface AccessPayload {
  sub: string; // user id
  role: string;
  typ: "access";
}

export interface RefreshPayload {
  sub: string;
  jti: string; // token family id — lets us revoke on rotation
  typ: "refresh";
}

export function signAccess(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role, typ: "access" } as AccessPayload, config.jwtSecret, {
    expiresIn: config.accessTokenTtlSec,
    algorithm: "HS256",
  });
}

export function signRefresh(userId: string, familyId: string): string {
  return jwt.sign({ sub: userId, jti: familyId, typ: "refresh" } as RefreshPayload, config.jwtSecret, {
    expiresIn: `${config.refreshTokenTtlDays}d`,
    algorithm: "HS256",
  });
}

export function verifyAccess(token: string): AccessPayload | null {
  try {
    const p = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] }) as AccessPayload;
    return p && p.typ === "access" ? p : null;
  } catch {
    return null;
  }
}

export function verifyRefresh(token: string): RefreshPayload | null {
  try {
    const p = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] }) as RefreshPayload;
    return p && p.typ === "refresh" ? p : null;
  } catch {
    return null;
  }
}

export function randomFamilyId(): string {
  return randomUUID();
}

export function refreshCookie(token: string) {
  return {
    name: "ojax_refresh" as const,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: config.isProd,
      path: "/api/auth",
      maxAge: config.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    },
  };
}

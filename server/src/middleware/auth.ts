import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { queryOne } from "../db/pool.js";
import { HttpError } from "../lib/errors.js";

export interface AuthedUser {
  id: string;
  role: string;
  email: string;
  fullName: string;
  universityCode: string | null;
  isOrg: boolean;
  verified: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] }) as any;
    if (payload && payload.typ === "access" && payload.sub) {
      req.user = {
        id: payload.sub,
        role: payload.role || "student",
        email: payload.email || "",
        fullName: payload.name || "",
        universityCode: payload.universityCode || null,
        isOrg: !!payload.isOrg,
        verified: !!payload.verified,
      };
    }
  } catch {
    /* invalid token → treat as anonymous */
  }
  next();
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) return next(HttpError.unauthorized());
  try {
    const payload: any = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    if (!payload || payload.typ !== "access" || !payload.sub) return next(HttpError.unauthorized());
    const user = await queryOne<{ id: string; role: string; email: string; full_name: string; university_code: string | null; is_org: boolean; verified: boolean; deleted_at: Date | null }>(
      `SELECT id, role, email, full_name, university_code, is_org, verified, deleted_at
         FROM users WHERE id = $1`, [payload.sub]);
    if (!user || user.deleted_at) return next(HttpError.unauthorized("This account is no longer active."));
    req.user = {
      id: user.id, role: user.role, email: user.email, fullName: user.full_name,
      universityCode: user.university_code, isOrg: user.is_org, verified: user.verified,
    };
    // async fire-and-forget last-seen
    queryOne(`UPDATE users SET last_seen_at = now() WHERE id = $1`, [user.id]).catch(() => {});
    return next();
  } catch {
    return next(HttpError.unauthorized());
  }
}

function bearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (h && h.startsWith("Bearer ")) return h.slice(7);
  return null;
}

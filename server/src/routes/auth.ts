import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import * as auth from "../services/auth.service.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { wrap, HttpError } from "../lib/errors.js";
import { queryOne } from "../db/pool.js";
import { publicUser } from "../repos/users.js";

export const authRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1",
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(auth.PASSWORD_MIN).max(200),
  universityCode: z.string().trim().max(30).optional().nullable(),
  department: z.string().trim().max(120).optional().nullable(),
  level: z.string().trim().max(40).optional().nullable(),
  isOrg: z.boolean().optional(),
  orgName: z.string().trim().max(160).optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

authRouter.post(
  "/register",
  limiter,
  wrap(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw HttpError.unprocessable("validation_error", "Please fix the highlighted fields.", parsed.error.flatten());
    }
    const out = await auth.register(parsed.data, req.headers["user-agent"]);
    res.cookie("ojax_refresh", out.refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ accessToken: out.access, user: out.user });
  }),
);

authRouter.post(
  "/login",
  limiter,
  wrap(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest("invalid_body", "Enter your email and password.");
    const out = await auth.login(parsed.data.email, parsed.data.password, req.headers["user-agent"]);
    res.cookie("ojax_refresh", out.refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken: out.access, user: out.user });
  }),
);

authRouter.post(
  "/refresh",
  wrap(async (req, res) => {
    const token = req.cookies?.ojax_refresh || req.body?.refreshToken;
    if (!token) throw HttpError.unauthorized("No session.", "no_session");
    const out = await auth.refreshSession(token, req.headers["user-agent"]);
    res.cookie("ojax_refresh", out.refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken: out.access, user: out.user });
  }),
);

authRouter.post("/logout", wrap(async (req, res) => {
  await auth.logout(req.cookies?.ojax_refresh || req.body?.refreshToken);
  res.clearCookie("ojax_refresh", { path: "/api/auth" });
  res.json({ ok: true });
}));

authRouter.post("/verify-email", requireAuth, wrap(async (req, res) => {
  const token = z.string().parse(req.body?.token ?? "");
  await auth.verifyEmail(req.user!.id, token);
  res.json({ ok: true });
}));

authRouter.post("/verify-email/resend", requireAuth, wrap(async (req, res) => {
  const user = await queryOne<{ email: string }>(`SELECT email FROM users WHERE id = $1`, [req.user!.id]);
  if (!user) throw HttpError.notFound();
  await auth.issueVerifyEmail(req.user!.id, user.email);
  res.json({ ok: true });
}));

authRouter.post("/forgot-password", limiter, wrap(async (req, res) => {
  const email = z.string().email().parse(req.body?.email ?? "");
  await auth.requestPasswordReset(email);
  res.json({ ok: true });
}));

authRouter.post("/reset-password", limiter, wrap(async (req, res) => {
  const schema = z.object({ email: z.string().email(), token: z.string().min(10), password: z.string().min(auth.PASSWORD_MIN) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw HttpError.badRequest("invalid_body", "Missing reset details.");
  await auth.resetPassword(parsed.data.email, parsed.data.token, parsed.data.password);
  res.json({ ok: true });
}));

authRouter.post("/change-password", requireAuth, wrap(async (req, res) => {
  const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(auth.PASSWORD_MIN).max(200) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw HttpError.badRequest("invalid_body", "Enter both passwords.");
  await auth.changePassword(req.user!.id, parsed.data.currentPassword, parsed.data.newPassword);
  res.json({ ok: true });
}));

authRouter.get("/me", optionalAuth, wrap(async (req, res) => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }
  const u = await queryOne(
    `SELECT id, email, full_name, role, is_org, org_name, avatar_url, university_code, department, level,
            phone, whatsapp, bio, meetup_spot, verified, email_verified, onboarded, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [req.user.id],
  );
  if (!u) {
    res.json({ user: null });
    return;
  }
  res.json({ user: publicUser(u as any) });
}));

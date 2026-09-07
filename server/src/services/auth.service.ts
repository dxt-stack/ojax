import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { query, queryOne, withTx } from "../db/pool.js";
import { HttpError } from "../lib/errors.js";
import { config } from "../config.js";
import { logger } from "../lib/logger.js";
import {
  randomFamilyId,
  refreshCookie,
  signAccess,
  signRefresh,
  verifyRefresh,
} from "../lib/tokens.js";
import { notify, sendEmail } from "../lib/notify.js";
import { getUserByEmail, getUserById } from "../repos/users.js";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  universityCode?: string | null;
  department?: string | null;
  level?: string | null;
  isOrg?: boolean;
  orgName?: string | null;
}

export const PASSWORD_MIN = 8;

const emailTokenHash = (raw: string) => createHash("sha256").update(raw).digest("hex");

function authResult(userId: string, role: string) {
  const access = signAccess(userId, role);
  const familyId = randomFamilyId();
  const refresh = signRefresh(userId, familyId);
  return { access, refresh, familyId };
}

async function storeRefresh(familyId: string, userId: string, ua?: string) {
  await query(
    `INSERT INTO refresh_tokens (user_id, family_id, expires_at, user_agent)
     VALUES ($1,$2, now() + ($3 || ' days')::interval, $4)`,
    [userId, familyId, config.refreshTokenTtlDays, ua || null],
  );
}

export async function register(input: RegisterInput, ua?: string) {
  const email = input.email.trim().toLowerCase();
  if (input.password.length < PASSWORD_MIN) {
    throw HttpError.unprocessable("weak_password", `Password must be at least ${PASSWORD_MIN} characters.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw HttpError.badRequest("invalid_email", "That email address doesn't look right.");
  }
  const existing = await getUserByEmail(email);
  if (existing) throw HttpError.conflict("email_taken", "An account with that email already exists. Try signing in.");

  const hash = await bcrypt.hash(input.password, 11);
  const id = crypto.randomUUID();

  await withTx(async (q) => {
    const rows = await q(
      `INSERT INTO users (id, full_name, email, password_hash, university_code, department, level, is_org, org_name, onboarded)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, TRUE) RETURNING id, role`,
      [id, input.fullName.trim(), email, hash, input.universityCode || null, input.department || null,
       input.level || null, !!input.isOrg, input.orgName?.trim() || null],
    );
    return rows[0];
  });

  const { access, refresh, familyId } = authResult(id, "student");
  await storeRefresh(familyId, id, ua);

  // fire-and-forget verification email
  sendEmail(email, "Verify your OjaX email", "PLACEHOLDER_VERIFY")
    .then(() => issueVerifyEmail(id, email))
    .catch((e) => logger.error("verify email trigger failed", e));

  return { access, refresh, user: { id, email, fullName: input.fullName.trim() } };
}

export async function login(emailRaw: string, password: string, ua?: string) {
  const email = emailRaw.trim().toLowerCase();
  const user = await getUserByEmail(email);
  if (!user) throw HttpError.unauthorized("Wrong email or password.");
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw HttpError.unauthorized("Wrong email or password.");

  const { access, refresh, familyId } = authResult(user.id, user.role);
  await storeRefresh(familyId, user.id, ua);
  return {
    access,
    refresh,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isOrg: user.is_org,
      universityCode: user.university_code,
      verified: user.verified,
      onboarded: user.onboarded,
    },
  };
}

export async function refreshSession(refreshToken: string, ua?: string) {
  const payload = verifyRefresh(refreshToken);
  if (!payload) throw HttpError.unauthorized("Your session has expired — sign in again.", "session_expired");

  const row = await queryOne<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM refresh_tokens
      WHERE family_id = $1::uuid AND user_id = $2::uuid AND revoked_at IS NULL AND expires_at > now()`,
    [payload.jti, payload.sub],
  );
  if (!row) throw HttpError.unauthorized("Your session has expired — sign in again.", "session_expired");

  const user = await getUserById(row.user_id);
  if (!user) throw HttpError.unauthorized("This account is no longer active.");

  // rotate: revoke old family, mint new one
  const newFamily = randomFamilyId();
  await withTx(async (q) => {
    await q(`UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1::uuid AND revoked_at IS NULL`, [payload.jti]);
    await q(
      `INSERT INTO refresh_tokens (user_id, family_id, expires_at, user_agent)
       VALUES ($1,$2, now() + ($3 || ' days')::interval, $4)`,
      [user.id, newFamily, config.refreshTokenTtlDays, ua || null],
    );
  });

  return {
    access: signAccess(user.id, user.role),
    refresh: signRefresh(user.id, newFamily),
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isOrg: user.is_org,
      universityCode: user.university_code,
      verified: user.verified,
      onboarded: user.onboarded,
    },
  };
}

export async function logout(refreshToken?: string) {
  if (!refreshToken) return;
  const payload = verifyRefresh(refreshToken);
  if (!payload) return;
  await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1::uuid AND revoked_at IS NULL`, [payload.jti]);
}

export async function revokeOtherSessions(userId: string, keepFamilyId: string) {
  await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND family_id <> $2::uuid AND revoked_at IS NULL`, [userId, keepFamilyId]);
}

// ---------------- email verification ----------------

export async function issueVerifyEmail(userId: string, email: string) {
  const raw = randomBytes(32).toString("hex");
  await query(
    `INSERT INTO email_tokens (user_id, kind, token_hash, expires_at)
     VALUES ($1,'verify_email',$2, now() + interval '24 hours')`,
    [userId, emailTokenHash(raw)],
  );
  await sendEmail(email, "Verify your email", `Token: ${raw}`);
  return raw;
}

export async function verifyEmail(userId: string, rawToken: string) {
  const tok = await queryOne<{ id: string }>(
    `SELECT id FROM email_tokens
      WHERE user_id = $1 AND kind = 'verify_email' AND token_hash = $2 AND used_at IS NULL AND expires_at > now()
      ORDER BY created_at DESC LIMIT 1`,
    [userId, emailTokenHash(rawToken)],
  );
  if (!tok) throw HttpError.badRequest("invalid_token", "That verification link is invalid or has expired.");
  await withTx(async (q) => {
    await q(`UPDATE email_tokens SET used_at = now() WHERE id = $1`, [tok.id]);
    await q(`UPDATE users SET email_verified = TRUE WHERE id = $1`, [userId]);
  });
}

// ---------------- password reset ----------------

export async function requestPasswordReset(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  const user = await getUserByEmail(email);
  // Always succeed (don't leak which emails exist), but only issue when user exists.
  if (!user) return;
  const raw = randomBytes(32).toString("hex");
  await query(
    `INSERT INTO email_tokens (user_id, kind, token_hash, expires_at)
     VALUES ($1,'reset_password',$2, now() + interval '30 minutes')`,
    [user.id, emailTokenHash(raw)],
  );
  await sendEmail(email, "Reset your OjaX password", `Token: ${raw}`);
}

export async function resetPassword(emailRaw: string, rawToken: string, newPassword: string) {
  const email = emailRaw.trim().toLowerCase();
  const user = await getUserByEmail(email);
  if (!user) throw HttpError.badRequest("invalid_token", "That reset link is invalid or has expired.");
  if (newPassword.length < PASSWORD_MIN) {
    throw HttpError.unprocessable("weak_password", `Password must be at least ${PASSWORD_MIN} characters.`);
  }
  const tok = await queryOne<{ id: string }>(
    `SELECT id FROM email_tokens
      WHERE user_id = $1 AND kind = 'reset_password' AND token_hash = $2 AND used_at IS NULL AND expires_at > now()
      ORDER BY created_at DESC LIMIT 1`,
    [user.id, emailTokenHash(rawToken)],
  );
  if (!tok) throw HttpError.badRequest("invalid_token", "That reset link is invalid or has expired.");
  const hash = await bcrypt.hash(newPassword, 11);
  await withTx(async (q) => {
    await q(`UPDATE email_tokens SET used_at = now() WHERE id = $1`, [tok.id]);
    await q(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, user.id]);
    await q(`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [user.id]);
  });
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await getUserById(userId);
  if (!user) throw HttpError.notFound();
  const ok = await bcrypt.compare(current, user.password_hash);
  if (!ok) throw HttpError.badRequest("wrong_password", "Your current password is incorrect.");
  if (next.length < PASSWORD_MIN) {
    throw HttpError.unprocessable("weak_password", `Password must be at least ${PASSWORD_MIN} characters.`);
  }
  if (next === current) throw HttpError.badRequest("same_password", "New password must be different from current.");
  const hash = await bcrypt.hash(next, 11);
  await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, userId]);
  await query(`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
  await notify(userId, "system", "Password changed", "Your password was changed. If this wasn't you, reset it now.");
}

export function cookieFor(refresh: string) {
  return refreshCookie(refresh);
}

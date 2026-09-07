import { query, queryOne } from "../db/pool.js";
import { HttpError } from "../lib/errors.js";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_org: boolean;
  org_name: string | null;
  avatar_url: string | null;
  university_code: string | null;
  department: string | null;
  level: string | null;
  phone: string | null;
  whatsapp: string | null;
  bio: string;
  meetup_spot: string | null;
  verified: boolean;
  email_verified: boolean;
  onboarded: boolean;
  created_at: Date;
  deleted_at: Date | null;
}

export function publicUser(u: Partial<UserRow> | null | undefined) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    role: u.role,
    isOrg: !!u.is_org,
    orgName: u.org_name,
    avatarUrl: u.avatar_url,
    universityCode: u.university_code,
    department: u.department,
    level: u.level,
    phone: u.phone,
    whatsapp: u.whatsapp,
    bio: u.bio,
    meetupSpot: u.meetup_spot,
    verified: !!u.verified,
    emailVerified: !!u.email_verified,
    joinedAt: u.created_at,
  };
}

export async function getUserById(id: string): Promise<UserRow | null> {
  return queryOne<UserRow>(`SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`, [id]);
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  return queryOne<UserRow>(`SELECT * FROM users WHERE lower(email) = lower($1) AND deleted_at IS NULL`, [email]);
}

export async function assertUserActive(id: string): Promise<UserRow> {
  const u = await getUserById(id);
  if (!u) throw HttpError.notFound("Account not found.");
  return u;
}

export async function userStats(id: string) {
  const listings = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM listings WHERE seller_id = $1 AND deleted_at IS NULL AND status <> 'deleted'`,
    [id],
  );
  const sold = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM listings WHERE seller_id = $1 AND status = 'sold'`,
    [id],
  );
  return {
    activeListings: Number(listings?.count ?? 0),
    soldItems: Number(sold?.count ?? 0),
  };
}

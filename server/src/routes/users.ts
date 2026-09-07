import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middleware/auth.js";
import { wrap, HttpError } from "../lib/errors.js";
import { query, queryOne, withTx } from "../db/pool.js";
import { publicUser, userStats } from "../repos/users.js";
import { upload } from "../lib/uploader.js";
import { persistImage, deleteUploadsByIds } from "../lib/images.js";

export const usersRouter = Router();

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  universityCode: z.string().trim().max(30).nullable().optional(),
  department: z.string().trim().max(120).nullable().optional(),
  level: z.string().trim().max(40).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  whatsapp: z.string().trim().max(30).nullable().optional(),
  bio: z.string().trim().max(600).nullable().optional(),
  meetupSpot: z.string().trim().max(200).nullable().optional(),
  orgName: z.string().trim().max(160).nullable().optional(),
});

/** Public profile: others see this. */
usersRouter.get("/:id", wrap(async (req, res) => {
  const u = await queryOne(
    `SELECT id, full_name, role, is_org, org_name, avatar_url, university_code, department,
            level, bio, meetup_spot, verified, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [req.params.id],
  );
  if (!u) throw HttpError.notFound("User not found.");
  const rating = await queryOne<{ avg: string | null; count: string }>(
    `SELECT round(avg(rating)::numeric, 1)::text AS avg, count(*)::text AS count
       FROM listing_reviews WHERE seller_id = $1`, [req.params.id]);
  res.json({
    user: publicUser(u as any),
    stats: await userStats(u.id),
    rating: { avg: rating?.avg ? Number(rating.avg) : null, count: Number(rating?.count ?? 0) },
  });
}));

/** Own profile (authenticated). */
usersRouter.get("/me/dashboard", requireAuth, wrap(async (req, res) => {
  const uid = req.user!.id;
  const active = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM listings WHERE seller_id = $1 AND status = 'active' AND deleted_at IS NULL`, [uid]);
  const sold = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM listings WHERE seller_id = $1 AND status = 'sold'`, [uid]);
  const favs = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM favorites WHERE user_id = $1`, [uid]);
  const unread = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM messages m
       JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = $1
      WHERE m.sender_id <> $1 AND m.read_at IS NULL`, [uid]);
  const cart = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM cart_items WHERE user_id = $1`, [uid]);
  const sales = await queryOne<{ count: string; revenue: string | null }>(
    `SELECT count(*)::text AS count, coalesce(sum(o.total_kobo),0)::text AS revenue
       FROM orders o JOIN order_items oi ON oi.order_id = o.id
      WHERE oi.seller_id = $1 AND o.status IN ('paid','processing','completed')`, [uid]);
  res.json({
    stats: {
      activeListings: Number(active?.count ?? 0),
      soldItems: Number(sold?.count ?? 0),
      favorites: Number(favs?.count ?? 0),
      unreadMessages: Number(unread?.count ?? 0),
      cartItems: Number(cart?.count ?? 0),
      salesCount: Number(sales?.count ?? 0),
      salesRevenueKobo: Number(sales?.revenue ?? 0),
    },
  });
}));

/** Update own profile. */
usersRouter.patch("/me", requireAuth, wrap(async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) throw HttpError.unprocessable("validation_error", "Please fix the highlighted fields.", parsed.error.flatten());
  const b = parsed.data;
  const sets: string[] = [];
  const vals: unknown[] = [];
  const add = (col: string, val: unknown) => {
    sets.push(`${col} = $${vals.length + 1}`);
    vals.push(val === "" ? null : val);
  };
  if (b.fullName !== undefined) add("full_name", b.fullName);
  if (b.universityCode !== undefined) add("university_code", b.universityCode);
  if (b.department !== undefined) add("department", b.department);
  if (b.level !== undefined) add("level", b.level);
  if (b.phone !== undefined) add("phone", b.phone);
  if (b.whatsapp !== undefined) add("whatsapp", b.whatsapp);
  if (b.bio !== undefined) add("bio", b.bio);
  if (b.meetupSpot !== undefined) add("meetup_spot", b.meetupSpot);
  if (b.orgName !== undefined) add("org_name", b.orgName);
  if (!sets.length) throw HttpError.badRequest("nothing_to_update", "Nothing to update.");
  vals.push(req.user!.id);
  const u = await queryOne(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING
       id, email, full_name, role, is_org, org_name, avatar_url, university_code, department, level,
       phone, whatsapp, bio, meetup_spot, verified, email_verified, onboarded, created_at`,
    vals,
  );
  res.json({ user: publicUser(u as any) });
}));

/** Upload avatar. */
usersRouter.post("/me/avatar", requireAuth, upload.single("file"), wrap(async (req, res) => {
  if (!req.file) throw HttpError.badRequest("no_file", "Attach an image file.");
  const img = await persistImage(req.file, req.user!.id, "avatar");
  const old = await queryOne<{ avatar_url: string | null }>(`SELECT avatar_url FROM users WHERE id = $1`, [req.user!.id]);
  await query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [img.fullUrl, req.user!.id]);
  if (old?.avatar_url && old.avatar_url.includes("/uploads/")) {
    const key = decodeURIComponent(old.avatar_url.split("/uploads/")[1] || "");
    const row = await queryOne<{ id: string }>(`SELECT id FROM uploads WHERE full_key = $1 OR thumb_key = $1`, [key]);
    if (row) {
      const { deleteUploadsByIds } = await import("../lib/images.js");
      await deleteUploadsByIds([row.id]);
    }
  }
  res.json({ avatarUrl: img.fullUrl });
}));

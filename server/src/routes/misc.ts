import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { wrap, HttpError } from "../lib/errors.js";
import { query, queryOne } from "../db/pool.js";
import { config } from "../config.js";
import { upload } from "../lib/uploader.js";
import { persistImage } from "../lib/images.js";

export const notificationsRouter = Router();
export const uploadsRouter = Router();

const BASE = config.publicBaseUrl.replace(/\/$/, "");

// ---------------- notifications ----------------

notificationsRouter.get("/", requireAuth, wrap(async (req, res) => {
  const limit = Math.min(60, Number(req.query.limit ?? 30) || 30);
  const rows = await query<any>(
    `SELECT id, kind, title, body, link, read_at, created_at
       FROM notifications WHERE user_id = $1
      ORDER BY created_at DESC LIMIT $2`, [req.user!.id, limit]);
  const unreadRow = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL`, [req.user!.id]);
  res.json({ notifications: rows, unreadCount: Number(unreadRow?.count ?? 0) });
}));

notificationsRouter.post("/read", requireAuth, wrap(async (req, res) => {
  const id = req.body?.id;
  if (id) {
    await query(`UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2`, [id, req.user!.id]);
  } else {
    await query(`UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL`, [req.user!.id]);
  }
  res.json({ ok: true });
}));

// ---------------- uploads (shared media endpoint) ----------------

uploadsRouter.post("/event", requireAuth, upload.single("file"), wrap(async (req, res) => {
  const org = await queryOne<{ is_org: boolean }>(`SELECT is_org FROM users WHERE id = $1`, [req.user!.id]);
  if (!org?.is_org) throw HttpError.forbidden("Only organisations can upload event posters.");
  if (!req.file) throw HttpError.badRequest("no_file", "Attach a file.");
  const img = await persistImage(req.file, req.user!.id, "event");
  res.status(201).json({ image: { id: img.id, url: img.fullUrl } });
}));

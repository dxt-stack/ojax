import { Router } from "express";
import { z } from "zod";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { wrap, HttpError } from "../lib/errors.js";
import { query, queryOne, withTx } from "../db/pool.js";
import { config } from "../config.js";
import { notify } from "../lib/notify.js";

export const eventsRouter = Router();

const eventSchema = z.object({
  title: z.string().trim().min(4).max(140),
  description: z.string().trim().max(8000).optional().default(""),
  category: z.string().max(40).default("socials"),
  startsAt: z.string().datetime().or(z.string().min(1)),
  endsAt: z.string().datetime().nullable().optional(),
  venue: z.string().trim().min(2).max(200),
  universityCode: z.string().max(30).nullable().optional(),
  city: z.string().trim().max(80).default("Lagos"),
  isOnline: z.boolean().optional().default(false),
  onlineUrl: z.string().url().max(300).nullable().optional(),
  capacity: z.number().int().positive().max(100000).nullable().optional(),
  priceKobo: z.number().int().min(0).max(100_000_000).optional().default(0),
  posterUrl: z.string().max(500).nullable().optional(),
  posterUploadId: z.string().uuid().nullable().optional(),
});

export function serializeEvent(e: any, rsvpCount = 0, myRsvp = false) {
  return {
    id: e.id,
    org: {
      id: e.org_id,
      name: e.is_org ? e.org_name || e.full_name : e.full_name,
      avatarUrl: e.avatar_url,
      isOrg: e.is_org,
    },
    title: e.title,
    description: e.description,
    category: e.category,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    venue: e.venue,
    universityCode: e.university_code,
    city: e.city,
    isOnline: e.is_online,
    onlineUrl: e.online_url,
    capacity: e.capacity,
    priceKobo: Number(e.price_kobo || 0),
    status: e.status,
    posterUrl: e.poster_url || (e.poster_upload_id ? `/uploads/${e.poster_key}` : null),
    rsvpCount,
    myRsvp,
    createdAt: e.created_at,
  };
}

const EVENT_SELECT = `
  e.*, s.full_name, s.org_name, s.is_org, s.avatar_url,
  (SELECT u.full_key FROM uploads u WHERE u.id = e.poster_upload_id) AS poster_key,
  (SELECT count(*) FROM event_rsvps r WHERE r.event_id = e.id) AS rsvp_count
`;

// ---- public ----
eventsRouter.get("/", optionalAuth, wrap(async (req, res) => {
  const q = req.query;
  const page = Math.max(1, Number(q.page ?? 1) || 1);
  const pageSize = Math.min(48, Number(q.pageSize ?? 24) || 24);
  const where = [`e.status = 'published'`];
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };

  const mode = (q.mode as string) || "upcoming";
  if (mode === "upcoming") where.push(`e.starts_at >= now() - interval '3 hours'`);
  if (mode === "past") where.push(`e.starts_at < now()`);
  if (q.category) where.push(`e.category = ${p(q.category)}`);
  if (q.university) where.push(`e.university_code = ${p(q.university)}`);
  if (q.mine === "1" && req.user) {
    where.length = 0;
    where.push(`e.org_id = $1`);
    where.push(`e.status <> 'cancelled'`);
    params.push(req.user.id);
  }
  const order = mode === "past" ? "e.starts_at DESC" : "e.starts_at ASC";
  const totalRow = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM events e WHERE ${where.join(" AND ")}`, params);
  const rows = await query<any>(
    `SELECT ${EVENT_SELECT}
       FROM events e JOIN users s ON s.id = e.org_id
      WHERE ${where.join(" AND ")}
      ORDER BY ${order}
      LIMIT ${p(pageSize)} OFFSET ${p((page - 1) * pageSize)}`,
    params,
  );
  let myRsvps = new Set<string>();
  if (req.user) {
    const rsvps = await query<{ event_id: string }>(
      `SELECT event_id FROM event_rsvps WHERE user_id = $1`, [req.user.id]);
    myRsvps = new Set(rsvps.map((r) => r.event_id));
  }
  const items = rows.map((r) => serializeEvent(r, Number(r.rsvp_count ?? 0), myRsvps.has(r.id)));
  res.json({ items, total: Number(totalRow?.count ?? 0), page, pageSize, pages: Math.max(1, Math.ceil(Number(totalRow?.count ?? 0) / pageSize)) });
}));

eventsRouter.get("/:id", optionalAuth, wrap(async (req, res) => {
  const row = await queryOne<any>(
    `SELECT ${EVENT_SELECT} FROM events e JOIN users s ON s.id = e.org_id WHERE e.id = $1`,
    [req.params.id],
  );
  if (!row || (row.status === "draft" && row.org_id !== req.user?.id)) {
    throw HttpError.notFound("Event not found.");
  }
  if (row.status === "cancelled" && !req.user) throw HttpError.gone("This event was cancelled.");
  const myRsvp = req.user
    ? !!(await queryOne(`SELECT 1 FROM event_rsvps WHERE event_id = $1 AND user_id = $2`, [row.id, req.user.id]))
    : false;
  res.json({ event: serializeEvent(row, Number(row.rsvp_count ?? 0), myRsvp) });
}));

// ---- org only ----
async function requireOrg(req: any) {
  if (!req.user) throw HttpError.unauthorized();
  const u = await queryOne<{ is_org: boolean }>(`SELECT is_org FROM users WHERE id = $1`, [req.user.id]);
  if (!u?.is_org) throw HttpError.forbidden("Only student organisations/associations can publish events.");
  return u;
}

eventsRouter.post("/", requireAuth, wrap(async (req, res) => {
  await requireOrg(req);
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) throw HttpError.unprocessable("validation_error", "Please fix the highlighted fields.", parsed.error.flatten());
  const d = parsed.data;
  const starts = new Date(d.startsAt);
  if (Number.isNaN(starts.getTime())) throw HttpError.badRequest("bad_date", "Pick a valid start date/time.");
  if (d.endsAt) {
    const ends = new Date(d.endsAt);
    if (Number.isNaN(ends.getTime()) || ends <= starts) throw HttpError.badRequest("bad_date", "End time must be after the start.");
  }
  if (d.posterUploadId) {
    await query(`UPDATE uploads SET attached = TRUE WHERE id = $1::uuid AND owner_id = $2`, [d.posterUploadId, req.user!.id]);
  }
  const row = await queryOne<any>(
    `INSERT INTO events (org_id, title, description, category, starts_at, ends_at, venue, university_code,
                         city, is_online, online_url, capacity, price_kobo, poster_upload_id, poster_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      req.user!.id, d.title, d.description, d.category, starts, d.endsAt ? new Date(d.endsAt) : null,
      d.venue, d.universityCode || null, d.city, d.isOnline, d.onlineUrl || null, d.capacity || null,
      d.priceKobo, d.posterUploadId || null, d.posterUrl || null,
    ],
  );
  res.status(201).json({ event: serializeEvent(row) });
}));

eventsRouter.patch("/:id", requireAuth, wrap(async (req, res) => {
  const org = await requireOrg(req);
  const existing = await queryOne<any>(`SELECT * FROM events WHERE id = $1 AND org_id = $2`, [req.params.id, req.user!.id]);
  if (!existing) throw HttpError.notFound("Event not found or not yours.");
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) throw HttpError.unprocessable("validation_error", "Please fix the highlighted fields.", parsed.error.flatten());
  const d = parsed.data as Record<string, unknown>;
  const sets: string[] = [];
  const vals: unknown[] = [];
  const map: Record<string, string> = {
    title: "title", description: "description", category: "category", venue: "venue",
    universityCode: "university_code", city: "city", isOnline: "is_online", onlineUrl: "online_url",
    capacity: "capacity", priceKobo: "price_kobo", posterUrl: "poster_url", status: "status",
  };
  for (const [k, col] of Object.entries(map)) {
    if (d[k] !== undefined) {
      sets.push(`${col} = $${vals.length + 1}`);
      vals.push(d[k] === null ? null : d[k]);
    }
  }
  if (d.startsAt !== undefined) {
    const s = new Date(d.startsAt as string);
    if (Number.isNaN(s.getTime())) throw HttpError.badRequest("bad_date", "Invalid start date.");
    sets.push(`starts_at = $${vals.length + 1}`);
    vals.push(s);
  }
  if (d.endsAt !== undefined) {
    sets.push(`ends_at = $${vals.length + 1}`);
    vals.push(d.endsAt ? new Date(d.endsAt as string) : null);
  }
  if (!sets.length) throw HttpError.badRequest("nothing_to_update", "Nothing to update.");
  vals.push(req.params.id);
  const row = await queryOne<any>(
    `UPDATE events SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`, vals);
  res.json({ event: serializeEvent(row) });
}));

// rsvp
eventsRouter.post("/:id/rsvp", requireAuth, wrap(async (req, res) => {
  const ev = await queryOne<any>(`SELECT * FROM events WHERE id = $1 AND status = 'published'`, [req.params.id]);
  if (!ev) throw HttpError.notFound("Event not found.");
  const countRow = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM event_rsvps WHERE event_id = $1`, [ev.id]);
  const count = Number(countRow?.count ?? 0);
  if (ev.capacity && count >= ev.capacity) {
    throw HttpError.conflict("event_full", "Sorry — this event is fully booked.");
  }
  const exists = await queryOne(`SELECT 1 FROM event_rsvps WHERE event_id = $1 AND user_id = $2`, [ev.id, req.user!.id]);
  if (!exists) {
    await query(`INSERT INTO event_rsvps (event_id, user_id) VALUES ($1,$2)`, [ev.id, req.user!.id]);
    await notify(ev.org_id, "event", "New RSVP 📌",
      `Someone signed up for "${ev.title}".`, `/events/${ev.id}`);
  }
  res.json({ ok: true, count: exists ? count : count + 1 });
}));

eventsRouter.delete("/:id/rsvp", requireAuth, wrap(async (req, res) => {
  await query(`DELETE FROM event_rsvps WHERE event_id = $1 AND user_id = $2`, [req.params.id, req.user!.id]);
  res.json({ ok: true });
}));

// upload event poster
eventsRouter.post("/posters", requireAuth, wrap(async (req, res) => {
  throw HttpError.badRequest("not_implemented", "Upload posters via the /api/uploads/event endpoint.");
}));

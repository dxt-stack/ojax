import { Router } from "express";
import { z } from "zod";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { wrap, HttpError } from "../lib/errors.js";
import { query, queryOne, withTx } from "../db/pool.js";
import { config } from "../config.js";
import { notify } from "../lib/notify.js";

export const messagesRouter = Router();

const urlFor = (key: string | null) => (key ? `/uploads/${key}` : null);

/**
 * Open (or find an existing) conversation about a listing.
 * The other party is always the listing's seller.
 */
async function findOrCreateConversation(listingId: string, initiatorId: string, body?: string) {
  const listing = await queryOne<any>(
    `SELECT l.id, l.title, l.seller_id, l.status, s.full_name,
            (SELECT u.thumb_key FROM listing_images li JOIN uploads u ON u.id = li.upload_id
              WHERE li.listing_id = l.id ORDER BY li.position LIMIT 1) AS cover_key
       FROM listings l JOIN users s ON s.id = l.seller_id
      WHERE l.id = $1 AND l.deleted_at IS NULL`, [listingId]);
  if (!listing) throw HttpError.notFound("Listing not found.");

  // existing conversation about this listing between the two users
  const existing = await queryOne<{ conversation_id: string }>(
    `SELECT cm.conversation_id
       FROM conversation_members cm
       JOIN conversations c ON c.id = cm.conversation_id
       JOIN conversation_members other ON other.conversation_id = c.id AND other.user_id = $2
      WHERE cm.user_id = $1 AND c.listing_id = $3
      LIMIT 1`,
    [initiatorId, listing.seller_id, listingId],
  );
  if (existing) return existing.conversation_id;

  const convId = crypto.randomUUID();
  await withTx(async (q) => {
    await q(
      `INSERT INTO conversations (id, listing_id, listing_title_snapshot, cover_snapshot, created_by)
       VALUES ($1,$2,$3,$4,$5)`,
      [convId, listing.id, listing.title, urlFor(listing.cover_key), initiatorId],
    );
    await q(
      `INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1,$2),($1,$3)`,
      [convId, initiatorId, listing.seller_id],
    );
    if (body?.trim()) {
      await q(
        `INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1,$2,$3)`,
        [convId, initiatorId, body.trim().slice(0, 2000)],
      );
    }
  });
  return convId;
}

/** My conversations (threads). */
messagesRouter.get("/conversations", requireAuth, wrap(async (req, res) => {
  const rows = await query<any>(
    `SELECT c.id AS conversation_id, c.listing_id, c.listing_title_snapshot, c.cover_snapshot, c.updated_at,
            other.user_id AS peer_id,
            other_u.full_name AS peer_name, other_u.avatar_url AS peer_avatar, other_u.is_org,
            (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id = other.user_id AND m.read_at IS NULL) AS unread
       FROM conversation_members me
       JOIN conversations c ON c.id = me.conversation_id
       JOIN conversation_members other ON other.conversation_id = c.id AND other.user_id <> me.user_id
       JOIN users other_u ON other_u.id = other.user_id
      WHERE me.user_id = $1
      ORDER BY c.updated_at DESC`,
    [req.user!.id],
  );
  const lastMessages = await query<any>(
    `SELECT DISTINCT ON (m.conversation_id) m.conversation_id, m.body, m.sender_id, m.created_at
       FROM messages m
       JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = $1
      ORDER BY m.conversation_id, m.created_at DESC`,
    [req.user!.id],
  );
  const byConv = new Map(lastMessages.map((m) => [m.conversation_id, m]));
  const out = rows.map((r) => {
    const last = byConv.get(r.conversation_id);
    return {
      conversationId: r.conversation_id,
      listingId: r.listing_id,
      listingTitle: r.listing_title_snapshot,
      coverUrl: r.cover_snapshot,
      updatedAt: r.updated_at,
      unread: Number(r.unread),
      peer: { id: r.peer_id, fullName: r.peer_name, avatarUrl: r.peer_avatar },
      lastMessage: last ? { body: last.body, senderId: last.sender_id, createdAt: last.created_at } : null,
    };
  });
  res.json({ conversations: out });
}));

/** Messages inside one conversation. */
messagesRouter.get("/conversations/:id", requireAuth, wrap(async (req, res) => {
  const conv = await queryOne<any>(
    `SELECT c.* FROM conversations c
      JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
     WHERE c.id = $2`, [req.user!.id, req.params.id]);
  if (!conv) throw HttpError.notFound("Conversation not found.");
  const messages = await query<any>(
    `SELECT m.id, m.sender_id, m.body, m.kind, m.created_at, m.read_at
       FROM messages m WHERE m.conversation_id = $1 ORDER BY m.created_at ASC LIMIT 500`,
    [req.params.id],
  );
  // mark peer messages as read
  await query(
    `UPDATE messages SET read_at = now()
      WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL`,
    [req.params.id, req.user!.id],
  );
  await query(
    `UPDATE conversation_members SET last_read_at = now()
      WHERE conversation_id = $1 AND user_id = $2`, [req.params.id, req.user!.id]);
  res.json({
    conversation: {
      id: conv.id, listingId: conv.listing_id, listingTitle: conv.listing_title_snapshot,
      coverUrl: conv.cover_snapshot,
    },
    messages,
  });
}));

/** Send a message in a conversation. */
messagesRouter.post("/conversations/:id/messages", requireAuth, wrap(async (req, res) => {
  const body = z.string().trim().min(1).max(2000).parse(req.body?.body ?? "");
  const conv = await queryOne<any>(
    `SELECT c.*, other.user_id AS peer_id
       FROM conversations c
       JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
       JOIN conversation_members other ON other.conversation_id = c.id AND other.user_id <> $1
      WHERE c.id = $2`, [req.user!.id, req.params.id]);
  if (!conv) throw HttpError.notFound("Conversation not found.");
  const msg = await queryOne(
    `INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1,$2,$3) RETURNING *`,
    [conv.id, req.user!.id, body],
  );
  await query(`UPDATE conversations SET updated_at = now() WHERE id = $1`, [conv.id]);
  await notify(conv.peer_id, "message", "New message 💬", body.slice(0, 120), `/messages/${conv.id}`);
  res.status(201).json({ message: msg });
}));

/** Start a conversation about a listing. */
messagesRouter.post("/start", requireAuth, wrap(async (req, res) => {
  const schema = z.object({
    listingId: z.string().uuid(),
    message: z.string().trim().max(2000).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw HttpError.badRequest("invalid_body", "Missing listing.");
  const listing = await queryOne<any>(
    `SELECT l.seller_id FROM listings l WHERE l.id = $1 AND l.deleted_at IS NULL`, [parsed.data.listingId]);
  if (!listing) throw HttpError.notFound("Listing not found.");
  if (listing.seller_id === req.user!.id) {
    throw HttpError.badRequest("self_chat", "This is your own listing.");
  }
  const convId = await findOrCreateConversation(parsed.data.listingId, req.user!.id, parsed.data.message);
  res.status(201).json({ conversationId: convId });
}));

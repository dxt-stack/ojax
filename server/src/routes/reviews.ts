import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { wrap, HttpError } from "../lib/errors.js";
import { query, queryOne, withTx } from "../db/pool.js";

export const reviewsRouter = Router();

/**
 * POST /api/reviews/order/:orderId
 * Buyer rates a seller for one purchased item once the order is completed.
 * One review per order item — no repeat reviews, no pre-delivery reviews.
 */
const reviewSchema = z.object({
  orderItemId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().default(""),
});

reviewsRouter.post(
  "/order/:orderId",
  requireAuth,
  wrap(async (req, res) => {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      throw HttpError.unprocessable("validation_error", "Rating must be 1–5 stars with a short comment.", parsed.error.flatten());
    }
    const { orderItemId, rating, comment } = parsed.data;

    const order = await queryOne<any>(
      `SELECT id, status, buyer_id FROM orders WHERE id = $1 AND buyer_id = $2`,
      [req.params.orderId, req.user!.id],
    );
    if (!order) throw HttpError.notFound("Order not found.");
    if (order.status !== "completed") {
      throw HttpError.conflict(
        "not_completed",
        "You can review a seller only after confirming delivery of the order.",
      );
    }

    const item = await queryOne<{ id: string; seller_id: string; listing_id: string; title_snapshot: string }>(
      `SELECT id, seller_id, listing_id, title_snapshot FROM order_items WHERE id = $1 AND order_id = $2`,
      [orderItemId, order.id],
    );
    if (!item) throw HttpError.notFound("Item not found in this order.");
    if (item.seller_id === req.user!.id) {
      throw HttpError.badRequest("self_review", "You can't review yourself.");
    }

    const already = await queryOne(`SELECT 1 FROM listing_reviews WHERE order_item_id = $1`, [item.id]);
    if (already) throw HttpError.conflict("already_reviewed", "You already reviewed this item.");

    await withTx(async (q) => {
      await q(
        `INSERT INTO listing_reviews (order_item_id, buyer_id, seller_id, rating, comment)
         VALUES ($1,$2,$3,$4,$5)`,
        [item.id, req.user!.id, item.seller_id, rating, comment],
      );
      await q(
        `INSERT INTO notifications (user_id, kind, title, body, link)
         VALUES ($1,'order','You received a rating ⭐',$2,$3)`,
        [
          item.seller_id,
          `A buyer rated your sale of "${item.title_snapshot}" ${rating}/5.`,
          `/profile/${req.user!.id}`,
        ],
      );
    });

    res.status(201).json({ ok: true });
  }),
);

/** Public: a seller's rating summary + recent reviews (used on profiles & seller cards). */
reviewsRouter.get(
  "/seller/:sellerId",
  wrap(async (req, res) => {
    const agg = await queryOne<{ avg: string | null; count: string }>(
      `SELECT round(avg(rating)::numeric, 1)::text AS avg, count(*)::text AS count
         FROM listing_reviews WHERE seller_id = $1`,
      [req.params.sellerId],
    );
    const reviews = await query<any>(
      `SELECT r.id, r.rating, r.comment, r.created_at, oi.title_snapshot,
              b.id AS buyer_id, b.full_name AS buyer_name, b.avatar_url AS buyer_avatar
         FROM listing_reviews r
         JOIN users b ON b.id = r.buyer_id
         JOIN order_items oi ON oi.id = r.order_item_id
        WHERE r.seller_id = $1
        ORDER BY r.created_at DESC
        LIMIT 20`,
      [req.params.sellerId],
    );
    res.json({
      summary: {
        avg: agg?.avg ? Number(agg.avg) : null,
        count: Number(agg?.count ?? 0),
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: Number(r.rating),
        comment: r.comment,
        itemTitle: r.title_snapshot,
        createdAt: r.created_at,
        buyer: { id: r.buyer_id, fullName: r.buyer_name, avatarUrl: r.buyer_avatar },
      })),
    });
  }),
);

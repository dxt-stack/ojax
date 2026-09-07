import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { wrap, HttpError } from "../lib/errors.js";
import { query, queryOne, withTx } from "../db/pool.js";
import { config } from "../config.js";
import { notify } from "../lib/notify.js";

export const ordersRouter = Router();

const C = {
  shipping: config.shippingFeeKobo,
  freeAbove: config.freeShippingAboveKobo,
};

const urlFor = (key: string | null) => (key ? `/uploads/${key}` : null);

function shippingForSubtotal(subtotal: number, shipAny: boolean): number {
  if (!shipAny) return 0;
  return subtotal >= C.freeAbove ? 0 : C.shipping;
}

function nextOrderNo(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `OJX-${stamp}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

interface CartLine {
  listing_id: string;
  title: string;
  price_kobo: string | number;
  seller_id: string;
  status: string;
  ship_available: boolean;
  quantity: string | number; // stock
  qty: string | number;
  meetup_location: string | null;
  cover_key: string | null;
  seller_name: string;
}

export async function cartSnapshot(userId: string): Promise<CartLine[]> {
  return query<CartLine>(
    `SELECT l.id AS listing_id, l.title, l.price_kobo, l.seller_id, l.status, l.ship_available,
            l.quantity, l.meetup_location,
            ci.quantity AS qty, s.full_name AS seller_name,
            (SELECT u.full_key FROM listing_images li JOIN uploads u ON u.id = li.upload_id
              WHERE li.listing_id = l.id ORDER BY li.position LIMIT 1) AS cover_key
       FROM cart_items ci
       JOIN listings l ON l.id = ci.listing_id AND l.deleted_at IS NULL
       JOIN users s ON s.id = l.seller_id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC`,
    [userId],
  );
}

async function cartCount(userId: string): Promise<number> {
  const r = await queryOne<{ count: string }>(`SELECT count(*)::text AS count FROM cart_items WHERE user_id = $1`, [userId]);
  return Number(r?.count ?? 0);
}

// ---------------- cart ----------------

ordersRouter.get("/cart", requireAuth, wrap(async (req, res) => {
  const rows = await cartSnapshot(req.user!.id);
  let subtotal = 0;
  let shipAny = false;
  const items = rows.map((r) => {
    const active = r.status === "active";
    if (active) {
      subtotal += Number(r.price_kobo) * Number(r.qty);
      if (r.ship_available) shipAny = true;
    }
    return {
      listingId: r.listing_id,
      title: r.title,
      priceKobo: Number(r.price_kobo),
      qty: Number(r.qty),
      stock: Number(r.quantity),
      shipAvailable: r.ship_available,
      sellerId: r.seller_id,
      sellerName: r.seller_name,
      coverUrl: urlFor(r.cover_key),
      unavailable: !active,
    };
  });
  const shipping = shippingForSubtotal(subtotal, shipAny);
  res.json({
    items,
    totals: { subtotalKobo: subtotal, shippingKobo: shipping, totalKobo: subtotal + shipping },
    rules: { shippingKobo: C.shipping, freeAboveKobo: C.freeAbove, serviceFeeRatePercent: config.serviceFeeRatePercent },
  });
}));

ordersRouter.post("/cart", requireAuth, wrap(async (req, res) => {
  const schema = z.object({
    listingId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99).default(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw HttpError.badRequest("invalid_body", "Invalid cart request.");
  const { listingId, quantity } = parsed.data;

  const listing = await queryOne<{ id: string; status: string; quantity: number; seller_id: string }>(
    `SELECT id, status, quantity, seller_id FROM listings WHERE id = $1 AND deleted_at IS NULL`, [listingId]);
  if (!listing) throw HttpError.notFound("Listing not found.");
  if (listing.status !== "active") throw HttpError.gone();
  if (listing.seller_id === req.user!.id) {
    throw HttpError.badRequest("own_item", "You can't add your own item to your cart.");
  }
  const existing = await queryOne<{ quantity: number }>(
    `SELECT quantity FROM cart_items WHERE user_id = $1 AND listing_id = $2`, [req.user!.id, listingId]);
  const want = (existing?.quantity ?? 0) + quantity;
  if (want > listing.quantity) {
    throw HttpError.unprocessable("stock_exceeded", `Only ${listing.quantity} in stock.`, { stock: listing.quantity });
  }
  await query(
    `INSERT INTO cart_items (user_id, listing_id, quantity) VALUES ($1,$2,$3)
     ON CONFLICT (user_id, listing_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [req.user!.id, listingId, quantity],
  );
  res.status(201).json({ count: await cartCount(req.user!.id) });
}));

ordersRouter.patch("/cart/:listingId", requireAuth, wrap(async (req, res) => {
  const quantity = Math.max(1, Math.min(99, Number(req.body?.quantity) || 1));
  const listing = await queryOne<{ quantity: number }>(
    `SELECT quantity FROM listings WHERE id = $1 AND deleted_at IS NULL`, [req.params.listingId]);
  if (!listing) throw HttpError.notFound();
  if (quantity > listing.quantity) {
    throw HttpError.unprocessable("stock_exceeded", `Only ${listing.quantity} in stock.`, { stock: listing.quantity });
  }
  await query(`UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND listing_id = $3`,
    [quantity, req.user!.id, req.params.listingId]);
  res.json({ ok: true, count: await cartCount(req.user!.id) });
}));

ordersRouter.delete("/cart/:listingId", requireAuth, wrap(async (req, res) => {
  await query(`DELETE FROM cart_items WHERE user_id = $1 AND listing_id = $2`, [req.user!.id, req.params.listingId]);
  res.json({ ok: true, count: await cartCount(req.user!.id) });
}));

ordersRouter.delete("/cart", requireAuth, wrap(async (req, res) => {
  await query(`DELETE FROM cart_items WHERE user_id = $1`, [req.user!.id]);
  res.json({ ok: true });
}));

// ---------------- checkout ----------------

const checkoutSchema = z.object({
  fulfilment: z.enum(["pickup", "shipping"]),
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(7).max(30),
  deliveryAddress: z.string().trim().max(500).nullable().optional(),
  campusNote: z.string().trim().max(300).nullable().optional(),
  buyerNote: z.string().trim().max(1000).nullable().optional(),
});

/** Step 1 — validate + freeze the order (reserves stock until payment window passes). */
ordersRouter.post("/checkout", requireAuth, wrap(async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.unprocessable("validation_error", "Please fix the highlighted fields.", parsed.error.flatten());
  }
  const data = parsed.data;
  const lines = await cartSnapshot(req.user!.id);
  if (!lines.length) throw HttpError.badRequest("empty_cart", "Your cart is empty.");

  const active = lines.filter((l) => l.status === "active");
  const blocked = lines.filter((l) => l.status !== "active");
  if (blocked.length) {
    throw HttpError.conflict("item_unavailable", `"${blocked[0].title}" is no longer available. Remove it and retry.`);
  }
  if (data.fulfilment === "shipping") {
    const noShip = active.filter((l) => !l.ship_available);
    if (noShip.length) {
      throw HttpError.unprocessable(
        "no_shipping",
        `"${noShip[0].title}" doesn't support shipping — use campus pickup for it or remove it.`,
      );
    }
  }
  for (const l of active) {
    if (Number(l.qty) > Number(l.quantity)) {
      throw HttpError.unprocessable("stock_exceeded", `Only ${l.quantity} of "${l.title}" left.`);
    }
  }
  const subtotal = active.reduce((s, l) => s + Number(l.price_kobo) * Number(l.qty), 0);
  const shipAny = active.some((l) => l.ship_available);
  const shipping = data.fulfilment === "shipping" ? shippingForSubtotal(subtotal, shipAny) : 0;
  const serviceFee = Math.round((subtotal * config.serviceFeeRatePercent) / 100);
  const total = subtotal + shipping + serviceFee;

  const orderId = crypto.randomUUID();
  const orderNo = nextOrderNo();

  await withTx(async (q) => {
    // atomically re-check + reserve stock
    for (const l of active) {
      const res = await q<{ ok: boolean }>(
        `UPDATE listings SET quantity = quantity - $1,
                status = CASE WHEN quantity - $1 <= 0 THEN 'paused' ELSE status END
          WHERE id = $2 AND status = 'active' AND deleted_at IS NULL AND quantity >= $3
          RETURNING TRUE AS ok`,
        [Number(l.qty), l.listing_id, Number(l.qty)],
      );
      if (!res.length) throw HttpError.conflict("stock_exceeded", `Not enough stock left for "${l.title}".`);
    }
    await q(
      `INSERT INTO orders (id, order_no, buyer_id, status, fulfilment, subtotal_kobo, shipping_kobo,
                           service_fee_kobo, total_kobo, contact_name, contact_phone, delivery_address,
                           campus_note, buyer_note, reserved_until)
       VALUES ($1,$2,$3,'pending_payment',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now() + interval '90 minutes')`,
      [
        orderId, orderNo, req.user!.id, data.fulfilment, subtotal, shipping, serviceFee, total,
        data.contactName, data.contactPhone, data.deliveryAddress || null, data.campusNote || null,
        data.buyerNote || null,
      ],
    );
    for (const l of active) {
      await q(
        `INSERT INTO order_items (order_id, listing_id, seller_id, title_snapshot, image_snapshot, unit_price_kobo, quantity, meetup_location)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          orderId, l.listing_id, l.seller_id, l.title, urlFor(l.cover_key),
          Number(l.price_kobo), Number(l.qty), l.meetup_location,
        ],
      );
      await q(
        `INSERT INTO order_events (order_id, to_status, note, actor_id)
         VALUES ($1,'pending_payment','Order created — awaiting payment',$2)`,
        [orderId, req.user!.id],
      );
    }
    await q(`DELETE FROM cart_items WHERE user_id = $1`, [req.user!.id]);
  });

  res.status(201).json({
    order: {
      id: orderId,
      orderNo,
      status: "pending_payment",
      totals: { subtotalKobo: subtotal, shippingKobo: shipping, serviceFeeKobo: serviceFee, totalKobo: total },
      reservedUntilMinutes: config.checkoutHoldMinutes,
    },
    paymentMethods: ["ojapay"],
  });
}));

/** Step 2 — sandbox "OjaPay" payment callback (dev gateway). Marks order paid + items sold. */
ordersRouter.post("/:id/pay-sandbox", requireAuth, wrap(async (req, res) => {
  const order = await queryOne<any>(
    `SELECT * FROM orders WHERE id = $1 AND buyer_id = $2`, [req.params.id, req.user!.id]);
  if (!order) throw HttpError.notFound("Order not found.");
  if (order.status === "paid" || order.status === "processing") {
    return res.json({ ok: true, order: { id: order.id, status: order.status } });
  }
  if (order.status !== "pending_payment") {
    throw HttpError.conflict("order_state", `This order can't be paid (state: ${order.status}).`);
  }
  const ref = `OJAPAY-${crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()}`;
  await withTx(async (q) => {
    await q(
      `INSERT INTO payments (order_id, payer_id, provider, reference, amount_kobo, status, meta, paid_at)
       VALUES ($1,$2,'ojapay',$3,$4,'success','{"gateway":"sandbox","mode":"demo"}'::jsonb, now())`,
      [order.id, req.user!.id, ref, order.total_kobo],
    );
    await q(
      `UPDATE orders SET status = 'paid', paid_at = now(), payment_method = 'ojapay' WHERE id = $1`,
      [order.id],
    );
    await q(
      `INSERT INTO order_events (order_id, to_status, note, actor_id) VALUES ($1,'paid','Payment confirmed via OjaPay',$2)`,
      [order.id, req.user!.id],
    );
    await q(
      `UPDATE listings SET status = 'sold', sold_at = now(), sold_price_kobo = price_kobo, buyer_id = $1
        WHERE id IN (SELECT listing_id FROM order_items WHERE order_id = $2)`,
      [req.user!.id, order.id],
    );
  });
  const sellers = await query<{ seller_id: string; title_snapshot: string }>(
    `SELECT DISTINCT seller_id, title_snapshot FROM order_items WHERE order_id = $1`, [order.id]);
  for (const s of sellers) {
    await notify(s.seller_id, "order", "You've made a sale! 🎉",
      `"${s.title_snapshot}" was paid for. ${order.fulfilment === "pickup" ? "Arrange a pickup time." : "Prepare for delivery."}`,
      `/dashboard/orders?seller=1`);
  }
  const items = await query<{ title_snapshot: string }>(
    `SELECT title_snapshot FROM order_items WHERE order_id = $1`, [order.id]);
  const firstTitle = items[0]?.title_snapshot ?? "your items";
  await notify(req.user!.id, "order", "Payment confirmed 🎉",
    items.length === 1
      ? `Your order for "${firstTitle}" (${order.order_no}) is confirmed.`
      : `Your order ${order.order_no} with ${items.length} items is confirmed.`,
    `/dashboard/orders`);
  res.json({ ok: true, reference: ref, order: { id: order.id, status: "paid" } });
}));

/** Future Paystack transaction initialisation (kept as an explicit seam). */
ordersRouter.post("/:id/pay-init", requireAuth, wrap(async (req, res) => {
  if (config.gatewayMode !== "paystack" || !config.paystackSecretKey) {
    throw HttpError.conflict("gateway_unavailable", "Live card payments aren't enabled yet — sandbox OjaPay is active.");
  }
  throw HttpError.conflict("gateway_unavailable", "Paystack integration pending — sandbox mode active.");
}));

// ---------------- order queries ----------------

async function hydrateOrder(o: any) {
  const items = await query<any>(
    `SELECT oi.*, l.status AS listing_status,
            EXISTS(SELECT 1 FROM listing_reviews lr WHERE lr.order_item_id = oi.id) AS reviewed
       FROM order_items oi
       LEFT JOIN listings l ON l.id = oi.listing_id
      WHERE oi.order_id = $1`, [o.id]);
  return {
    id: o.id,
    orderNo: o.order_no,
    status: o.status,
    fulfilment: o.fulfilment,
    totals: {
      subtotalKobo: Number(o.subtotal_kobo),
      shippingKobo: Number(o.shipping_kobo),
      serviceFeeKobo: Number(o.service_fee_kobo),
      totalKobo: Number(o.total_kobo),
    },
    contact: { name: o.contact_name, phone: o.contact_phone, address: o.delivery_address, campusNote: o.campus_note },
    paymentMethod: o.payment_method,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    cancelledAt: o.cancelled_at,
    completedAt: o.completed_at,
    items: items.map((i) => ({
      orderItemId: i.id,
      listingId: i.listing_id,
      title: i.title_snapshot,
      imageUrl: i.image_snapshot,
      unitPriceKobo: Number(i.unit_price_kobo),
      quantity: Number(i.quantity),
      sellerId: i.seller_id,
      meetupLocation: i.meetup_location,
      reviewed: !!i.reviewed,
    })),
  };
}

ordersRouter.get("/", requireAuth, wrap(async (req, res) => {
  const scope = req.query.scope === "seller" ? "seller" : "buyer";
  const status = (req.query.status as string) || undefined;
  const where = scope === "seller"
    ? `o.id IN (SELECT order_id FROM order_items WHERE seller_id = $1)`
    : `o.buyer_id = $1`;
  const params: unknown[] = [req.user!.id];
  if (status) params.push(status);
  const rows = await query<any>(
    `SELECT DISTINCT o.id, o.order_no, o.status, o.fulfilment, o.total_kobo, o.created_at, o.paid_at,
            o.buyer_id, o.contact_name,
            (SELECT u.full_name FROM users u WHERE u.id = o.buyer_id) AS buyer_name,
            (SELECT u.full_name FROM users u WHERE u.id = $1) AS actor_name
       FROM orders o
      WHERE ${where} ${status ? `AND o.status = $2` : ""}
      ORDER BY o.created_at DESC
      LIMIT 100`, params);
  const orders = [];
  for (const o of rows) {
    const h = await hydrateOrder(o);
    orders.push({ ...h, buyerName: o.buyer_name });
  }
  res.json({ orders });
}));

ordersRouter.get("/:id", requireAuth, wrap(async (req, res) => {
  const order = await queryOne<any>(
    `SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR $2 IN (SELECT seller_id FROM order_items WHERE order_id = orders.id))`,
    [req.params.id, req.user!.id],
  );
  if (!order) throw HttpError.notFound("Order not found.");
  const h = await hydrateOrder(order);
  const events = await query<any>(
    `SELECT to_status, note, created_at FROM order_events WHERE order_id = $1 ORDER BY created_at`, [order.id]);
  const payments = await query<any>(
    `SELECT provider, reference, status, amount_kobo, created_at FROM payments WHERE order_id = $1 ORDER BY created_at DESC`, [order.id]);
  res.json({ order: { ...h, events, payments } });
}));

/** Buyer confirms delivery for the whole order → completed. */
ordersRouter.post("/:id/confirm-delivery", requireAuth, wrap(async (req, res) => {
  const order = await queryOne<any>(
    `SELECT * FROM orders WHERE id = $1 AND buyer_id = $2 AND status IN ('paid','processing')`,
    [req.params.id, req.user!.id],
  );
  if (!order) throw HttpError.notFound("No pending order found for you.");
  await withTx(async (q) => {
    await q(`UPDATE orders SET status = 'completed', completed_at = now() WHERE id = $1`, [order.id]);
    await q(
      `INSERT INTO order_events (order_id, to_status, note, actor_id) VALUES ($1,'completed','Buyer confirmed delivery',$2)`,
      [order.id, req.user!.id],
    );
  });
  const sellers = await query<{ seller_id: string }>(
    `SELECT DISTINCT seller_id FROM order_items WHERE order_id = $1`, [order.id]);
  for (const s of sellers) {
    await notify(s.seller_id, "order", "Order completed ✅",
      `Order ${order.order_no} was confirmed delivered.`, `/dashboard/orders?seller=1`);
  }
  res.json({ ok: true });
}));

/** Cancel while pending payment (or paid-but-unfulfilled) — restores stock. */
ordersRouter.post("/:id/cancel", requireAuth, wrap(async (req, res) => {
  const order = await queryOne<any>(
    `SELECT * FROM orders WHERE id = $1 AND buyer_id = $2`, [req.params.id, req.user!.id]);
  if (!order) throw HttpError.notFound("Order not found.");
  if (!["pending_payment", "paid", "processing"].includes(order.status)) {
    throw HttpError.conflict("order_state", `Orders in "${order.status}" can't be cancelled — contact support.`);
  }
  await withTx(async (q) => {
    await q(`UPDATE orders SET status = 'cancelled', cancelled_at = now() WHERE id = $1`, [order.id]);
    await q(
      `INSERT INTO order_events (order_id, to_status, note, actor_id) VALUES ($1,'cancelled','Cancelled by buyer',$2)`,
      [order.id, req.user!.id],
    );
    const items = await q<{ listing_id: string; quantity: number }>(
      `SELECT listing_id, quantity FROM order_items WHERE order_id = $1`, [order.id]);
    for (const it of items) {
      await q(
        `UPDATE listings SET quantity = quantity + $1, status = 'active'
          WHERE id = $2 AND deleted_at IS NULL AND status <> 'deleted'`, [it.quantity, it.listing_id]);
    }
  });
  res.json({ ok: true });
}));

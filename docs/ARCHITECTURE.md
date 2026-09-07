# OjaX — Architecture

## 1. System overview

```
Browser (React SPA)
   │  same-origin in prod; Vite dev proxies /api /uploads /seed → :4000
   ▼
Express API (:4000) ─── PostgreSQL
   ├─ static: client/dist (production build, SPA fallback)
   ├─ static: server/uploads (full + thumb images, long cache)
   └─ API routes: /api/auth /api/users /api/listings /api/orders
                  /api/messages /api/events /api/notifications /api/meta
```

Two processes in dev (`npm run dev`), one process in production (`npm start` after `npm run build`).
The API serves the built SPA, so there is a **single origin** → cookies "just work", no CORS in prod.

## 2. Key decisions

| Decision | Why |
|---|---|
| **Money as integer kobo** | Floating-point naira causes rounding bugs (0.1 + 0.2). All prices stored/transported as `*_kobo`; formatting happens only at the edge (`lib/money.ts`, `lib/format.ts`). |
| **JWT access token + rotating refresh cookie** | Short access token (12h dev), httpOnly refresh cookie scoped to `/api/auth`; every refresh rotates the token *family* (DB-backed, revocable, replay-safe). |
| **Uploads: memory → disk + DB registry** | Multer buffers to memory, Sharp validates/rotates/re-encodes into `uploads/full` (max 1800px, progressive JPEG) and `uploads/thumb` (600×600 centre/attention crop). The `uploads` table tracks owner, purpose and attachment so orphan cleanup + ownership checks are possible. Listing photos attach after the listing row exists (upload first → pass ids → create). |
| **Cart → checkout freezes stock** | Checkout decrements stock in the same transaction that creates the order (90-minute reservation window). Payment success marks items `sold` + `buyer_id`; cancel or timeout restores stock and re-activates paused listings. |
| **Sandbox gateway with Paystack seam** | `POST /api/orders/:id/pay-sandbox` simulates a provider callback and exercises the exact post-payment path (payments row, order events, seller notifications, listing sold). `pay-init` is the Paystack seam — swap in the init call and webhook signature verification to go live. |
| **Snapshots on order items** | `title_snapshot` / `image_snapshot` preserve what the buyer saw even if the listing is later edited or deleted. |
| **Relative media URLs** | DB stores upload *keys* (`full/202609/<uuid>.jpg`); routes expose `/uploads/<key>`. Works in dev via Vite proxy and in prod same-origin. `PUBLIC_BASE_URL` only used where an absolute URL is truly needed. |
| **SQL migrations** | `schema_migrations` table; plain SQL files in `db/migrations`, applied idempotently at boot and via `npm run db:migrate`. Seed runs only when no `@ojax.demo` user exists. |

## 3. Data model (core tables)

- `users` — identity, campus profile, role (`student`/`admin`), `is_org` flag, verification flags.
- `refresh_tokens`, `email_tokens` — session families; email verification & password resets.
- `uploads` — media registry (owner, purpose, keys, dims, attached flag).
- `listings` — marketplace item (category/subcategory, condition, price kobo, quantity, status
  active/paused/sold/deleted, ship flag, meetup details, view counter); `listing_images` (ordered);
  `favorites` (user×listing).
- `cart_items`, `orders`, `order_items`, `order_events`, `payments` — commerce. Order statuses:
  `pending_payment → paid → processing → completed` (or `cancelled`). Fulfilment: `pickup` | `shipping`.
- `conversations`, `conversation_members`, `messages` — two-person chats tied to a listing; unread counts
  derived from `read_at`, member `last_read_at` drives the UI badge.
- `events`, `event_rsvps` — org-published campus events + student RSVPs (capacity-checked).
- `notifications` — in-app feed (orders, messages, events, system).
- `listing_view_events` — analytics-lite for trending (popularity sort uses views + favorites).

## 4. Core flows

### Listing → sale (pickup or delivery)
1. Seller uploads photos (`POST /api/listings/photos`), creates listing with `imageIds`.
2. Buyer adds to cart (`POST /api/orders/cart`) — stock + "not your own item" checks.
3. Checkout (`POST /api/orders/checkout`): validate fulfilment rules (shipping only for ship-enabled items),
   reserve stock atomically, create order + item snapshots + timeline event, clear cart.
4. Pay sandbox (`POST /api/orders/:id/pay-sandbox`) → `payments.success`, order `paid`, listing `sold`
   (sold price + buyer), both sides notified. (Live: `pay-init` + webhook → same state machine.)
5. Seller arranges pickup / ships; buyer confirms delivery (`confirm-delivery`) → `completed`.
   Cancel before fulfilment restores stock.

### Messaging
`POST /api/messages/start` opens an existing conversation for (listing, seller, buyer) or creates one;
send/list mark reads; `read_at` stamps power unread badges. Polling every ~6s in the demo client
(documented seam for WebSockets/SSE).

### Events
Orgs (`is_org`) create events (dates validated end>start, capacity ≥ 1, price kobo). Students RSVP
(unique per user; capacity guard); org sees counts and can cancel (status `cancelled`).

## 5. Auth & security posture

- Passwords: bcrypt (cost 11). Access tokens: HS256, short TTL. Refresh tokens: random family id in DB,
  rotated on use, revoked on logout/password change/reset.
- SQL: parameterised everywhere; UUID PKs (no enumeration leaks); ownership checks on every mutation
  (`seller_id = user`, `org_id = user`).
- HTTP: helmet, CORS locked to `CLIENT_ORIGIN`, JSON body cap 2MB, per-route rate limits, upload MIME +
  size limits (10MB/file), image bombs guarded by `limitInputPixels`.
- Secrets: `.env` only, never committed; `.env.example` documents every knob.

## 6. Scaling notes (when you grow)

- Read path is trivial to cache (listings/events pages) at the CDN/reverse-proxy layer with ETags.
- Move uploads to S3-compatible object storage: keep `uploads` table, swap file IO for a storage client.
- Chat → WebSocket/SSE fan-out on Postgres `LISTEN/NOTIFY` or a small Redis pub/sub.
- Search → Postgres trigram is fine to ~100k rows; then switch to Meilisearch/OpenSearch.
- Payloads stay slim (pageSize ≤ 48; listings serialised without description in lists).

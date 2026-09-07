# OjaX API

Base path: `/api` · JSON body · auth via `Authorization: Bearer <accessToken>`
(refresh happens automatically client-side via the httpOnly cookie at `POST /api/auth/refresh`).

Errors are always `{ "error": { "code", "message", "details?" } }` with a stable machine code.

Money fields are **kobo** (₦1 = 100 kobo).

---

## Auth — `/api/auth`
| Method & path | Auth | Description |
|---|---|---|
| POST `/register` | – | Create account (`fullName,email,password,universityCode?,department?,level?,isOrg?,orgName?`) |
| POST `/login` | – | `email,password` → `{accessToken,user}` + refresh cookie |
| POST `/refresh` | cookie | Rotate refresh → new access token |
| POST `/logout` | cookie | Revoke refresh family |
| GET `/me` | opt | Current user or `{user:null}` |
| POST `/verify-email` / `/verify-email/resend` | ✓ | Email verification (tokens logged in dev) |
| POST `/forgot-password` | – | Sends reset token (always 200 — no user enumeration) |
| POST `/reset-password` | – | `email,token,password` |
| POST `/change-password` | ✓ | `currentPassword,newPassword` (revokes other sessions) |

## Users — `/api/users`
| Method & path | Auth | Description |
|---|---|---|
| GET `/:id` | opt | Public profile + `stats{activeListings,soldItems}` |
| GET `/me/dashboard` | ✓ | Counts: listings, sold, favorites, unread, cart, sales revenue |
| PATCH `/me` | ✓ | Update profile fields |
| POST `/me/avatar` | ✓ | multipart `file` → new avatar (old file cleaned) |

## Catalog / meta — `/api/meta`
GET `/catalog` → categories (+subs +icons), conditions, event categories.
GET `/universities` → Nigerian universities list.

## Listings — `/api/listings`
| Method & path | Auth | Description |
|---|---|---|
| POST `/photos` | ✓ | multipart `files[]` (≤8, ≤10MB) → upload ids (unattached until listing uses them) |
| DELETE `/photos/:id` | ✓ | Delete an unattached upload |
| POST `/` | ✓ | Create listing (`title,description,category,subcategory,conditionCode,priceKobo,negotiable,quantity,shipAvailable,meetupLocation,imageIds[]`) |
| GET `/` | opt | Search/filter/sort/paginate. Query: `q, category, subcategory, condition, min, max, negotiable=1, ships=1, sort=newest|price_asc|price_desc|popular, page, pageSize`; `mine=1` (owned), `favorites=1`, `sellerId=…` |
| GET `/:id` | opt | Detail + `related`; increments views (not for owner); `isFavorite`, `myListing` |
| PATCH `/:id` | ✓ owner | Update (partial). `imageIds` fully replaces photo set |
| DELETE `/:id` | ✓ owner | Soft-delete + clean photos/favorites/cart (sold items can't be deleted) |
| POST `/:id/pause` · `/:id/activate` | ✓ owner | Status switch |
| POST `/:id/sold` | ✓ owner | Mark sold |
| POST `/:id/favorite` | ✓ | Toggle favorite → `{favorite}` |

## Orders — `/api/orders`
| Method & path | Auth | Description |
|---|---|---|
| GET `/cart` | ✓ | Live cart lines + `totals` + `rules{shippingKobo,freeAboveKobo}` |
| POST `/cart` | ✓ | Add `listingId,quantity` (stock + not-own checks) |
| PATCH/DELETE `/cart/:listingId`, DELETE `/cart` | ✓ | Update/remove/clear |
| POST `/checkout` | ✓ | Validate + freeze (stock reserve, 90-min) → `{order,totals,paymentMethods}` |
| POST `/:id/pay-sandbox` | ✓ buyer | Simulate successful payment (demo gateway) |
| POST `/:id/pay-init` | ✓ buyer | Paystack seam (enabled when gateway=paystack) |
| GET `/` | ✓ | `?scope=buyer|seller&status=` order history |
| GET `/:id` | ✓ | Order + items + timeline events + payments |
| POST `/:id/confirm-delivery` | ✓ buyer | Order → completed |
| POST `/:id/cancel` | ✓ buyer | Cancel (restores stock) while pending/paid/processing |

## Messages — `/api/messages`
| Method & path | Auth | Description |
|---|---|---|
| GET `/conversations` | ✓ | Thread list + peer + unread + last message |
| GET `/conversations/:id` | ✓ | Messages (marks peer messages read) |
| POST `/conversations/:id/messages` | ✓ | Send `{body}` |
| POST `/start` | ✓ | `{listingId,message?}` → existing/new conversation (can't chat your own listing) |

## Events — `/api/events`
| Method & path | Auth | Description |
|---|---|---|
| GET `/` | opt | `mode=upcoming|past, category, university, mine=1` (org only) |
| GET `/:id` | opt | Detail + `myRsvp` |
| POST `/` | ✓ org | Publish (`title,description,category,startsAt,endsAt?,venue,universityCode?,capacity?,priceKobo,posterUrl?`) |
| PATCH `/:id` | ✓ org owner | Edit incl. `status=cancelled` |
| POST `/:id/rsvp` | ✓ | RSVP (capacity guard) |
| DELETE `/:id/rsvp` | ✓ | Cancel RSVP |

## Reviews — `/api/reviews` (real purchases only)
| Method & path | Auth | Description |
|---|---|---|
| POST `/order/:orderId` | ✓ buyer | Rate a seller `{orderItemId, rating 1–5, comment?}` — allowed only after the order is `completed`; one review per order item (409 `already_reviewed` / `not_completed` otherwise). Seller gets a notification. |
| GET `/seller/:sellerId` | – | Rating summary (`avg`, `count`) + recent reviews with buyer + item snapshots. |

Reviews are never seeded and can't be bought/edited — they exist to make trust *real*.

## Notifications — `/api/notifications`
GET `/` (unread count + latest) · POST `/read` (`{id?}` — all when omitted).

## System
`GET /healthz` — liveness.

## Status codes used
200/201 · 400 `validation/invalid_body` · 401 `unauthorized/session_expired` · 403 · 404 ·
409 (`email_taken`, `item_sold`, `event_full`, `item_unavailable`, `order_state`) · 410 `gone` · 422 · 429.

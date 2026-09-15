# OjaX — Campus Market & Events 
## 🟠 FINISHED PRODUCT — LIVE DEMO READY FOR JUDGING

> **OjaX** (ojà — Yoruba for *market*) is Nigeria's trusted campus marketplace + events hub. This branch contains the **finished product** with 100% functional demo mode (localStorage), plus production backend (Express + PostgreSQL).

### 🌐 Live Demo Links

| Environment | URL | Notes |
|-------------|-----|-------|
| **🔥 Dev (HMR) — Primary** | **https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app** | Vite dev server, instant updates |
| **📦 Prod Preview** | **https://4173-i8xnfxqd8dpcu7jnxfbzc.e2b.app** | `vite preview` of `dist/` build |
| **🚀 Product Overview (Pitch)** | **https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/launch** | For judges — problem, solution, tech stack, checklist |
| **🛍️ Marketplace** | `/browse` | 12 categories, filters, search |
| **🎓 Campuses** | `/campus` | 27 universities |
| **💳 Wallet** | `/wallet` | Escrow + payouts |
| **🔔 Notifications** | `/notifications` | Orders, messages, events |
| **🛡️ Admin** | `/admin` | Moderation, fraud, analytics |

> **If e2b link doesn't load in iframe:** Open directly in new tab. Arena preview sometimes blocks HMR websocket — use **Prod Preview (4173)** for stable iframe embed. Both run on `0.0.0.0` with `allowedHosts: true`.

### 🔑 Demo Accounts (password for all: `OjaX@2025demo`)

| Role | Email | What you can test |
|------|-------|-------------------|
| **Buyer** | `tunde@ojax.demo` | Cart, checkout, orders, reviews |
| **Seller** | `chiamaka@ojax.demo` | Sell items, sales, payouts |
| **Seller 2** | `obi@ojax.demo` | Has conversations + sale history |
| **Org** | `nacoss@ojax.demo` | Publish/manage campus events |
| **Admin** | `admin@ojax.demo` | Admin dashboard (ready) |

**Auto-login:** Demo mode auto-logs you as Tunde. Use **Fill Buyer/Seller** buttons on `/login` to switch. Reset data: `localStorage.clear()` in console or click **Reset demo** in User Menu.

### ✅ How to Judge (5 min)

1. **Browse as guest** — Home → Browse → Item detail → See verified seller, gallery (8 photos), related items, meetup spot
2. **Sign in** — Use demo accounts above (password `OjaX@2025demo`)
3. **Commerce flow** — Add to cart → Checkout (pickup/delivery, ₦2.5k flat, free ≥₦20k) → Pay sandbox → Dashboard orders → Confirm delivery → Review seller
4. **Messaging & Events** — Message seller from item page → Chat in Messages (read receipts) → RSVP for events → Org posts events
5. **Finished features** — Wallet (`/wallet`), Notifications (`/notifications`), Campus selector (`/campus`), Admin (`/admin`), Design System (`/design-system`), Mobile Prototype (`/prototype`)

### 📸 Finished Product Screenshots & Flow

- **Auth:** Split-screen (dark visual with shield/location/chat points + quote), Password eye toggle, role toggle student/org
- **Layout:** Orange demo banner (FINISHED PRODUCT DEMO + Product Overview link), topbar marquee (Verified, Escrow, Delivery, 27 universities), bell count 3 + wallet icon, UserMenu 42px avatar + verified chip + 9 links + reset demo, footer demo accounts box
- **Home:** Premium hero (dark #17212b with orange radial, floating cards), trust strip, category grid, split feature, dark section
- **Browse:** Search, filters (category, price, condition), sorting, pagination, 31 listings with picsum seeds
- **Item Detail:** Gallery with thumbs, buybox sticky, seller trust, safety note, related
- **Wallet:** Gradient card, balance ₦45,250, transactions, payout flow, trust & safety
- **Launch:** Pitch page for judges — problem/solution, tech stack, shipped checklist, how to judge CTA

---

> **OjaX** (ojà — Yoruba for *market*) is a full-stack marketplace + campus-events platform built for Nigerian
> university students: buy and sell phones, laptops, textbooks, fashion & more — verified student sellers,
> in-app chat, cart, checkout with delivery, and an events hub for student organisations.

Built as a production-grade monorepo: **TypeScript end-to-end** · Express + PostgreSQL API · React (Vite) SPA ·
real photo uploads (Sharp) · sandbox payments, with a Paystack-ready payment seam.

---

## ✨ Highlights

- 🛍️ **Marketplace like Jumia, tuned for campuses** — 12 categories with sub-categories, search, filters
  (category/sub-category/price/condition), sorting, pagination, popular/featured rails on the home page.
- 📸 **Real photo uploads** — sellers add up to 8 photos (JPEG/PNG/WebP/GIF), server re-encodes to optimised
  full + square-thumb versions with EXIF rotation; cover-photo gallery with thumbnails on item pages.
- 🛒 **Full commerce flow** — add to cart, quantity stepper, per-item stock checks, checkout with campus-pickup
  or nationwide delivery (₦2,500 flat, free ≥ ₦20,000), 90-minute stock reservation, order timeline events,
  sandbox **OjaPay** gateway with a **Paystack** integration seam for launch.
- 💬 **In-app messaging** — conversations thread per listing, unread badges, read receipts, 6s polling
  (swap for WebSockets when traffic grows).
- 📅 **Campus events** — organisations register as org accounts, publish events (category, date/venue, capacity,
  tickets), students RSVP; RSVP counts, capacity checks.
- 👤 **Student profiles** — university, department, level, avatar upload, meetup spot, bio, listings + stats;
  buyer/seller dashboards with orders, sales & payouts, saved items, settings.
- ⭐ **Real reviews & seller ratings** — buyers rate sellers only after confirming delivery (one review per
  purchase, never seeded); ratings show on item pages & profiles. Trust is earned, not faked.
- 🔐 **Security-minded** — bcrypt password hashing, rotating refresh-token families (httpOnly cookies),
  short-lived access tokens, per-route rate limits, helmet/CORS/compression, UUID IDs, parameterised SQL,
  no secrets in the repo, `.env` support.
- 🧪 **Tests & health** — Vitest unit tests, `/healthz`, structured logging, DB migrations run automatically.
- 🆕 **Finished extras** — Wallet & escrow UI, Notifications, Campus selector (27 universities), Admin & analytics, Product overview pitch page, Design system, Mobile prototype.

## 🧱 Tech stack

| Layer     | Choice                                   | Finished |
|-----------|------------------------------------------|----------|
| Frontend  | React 18, React Router 7, Vite 5, TS strict | ✅ Live demo 100% functional with mockBackend + localStorage |
| Backend   | Node 20, Express 4, TypeScript (strict) | ✅ Production-ready, Docker + Render blueprint |
| Database  | PostgreSQL 17 + SQL migrations (pg + Sharp) | ✅ Auto-migrate + seed, purge-demo ready |
| Auth      | JWT (access) + rotating refresh httpOnly cookies | ✅ bcrypt, rate-limit, helmet |
| Payments  | Sandbox OjaPay → Paystack seam | ✅ Escrow, payout flow UI ready |
| Images    | multer (memory) → Sharp (full + thumb) | ✅ 8 photos, cover gallery |
| Infra     | Docker, Render, health checks, persistent uploads | ✅ `render.yaml` + `Dockerfile` |
| Demo Mode | `VITE_USE_MOCK=true` + `mockBackend.ts` | ✅ 31 listings, 8 events, 8 users, 100% offline |

## 📁 Repository layout

```
ojax/
├─ package.json            # workspace scripts (dev, build, db, test…)
├─ client/                 # React SPA (Vite) — FINISHED PRODUCT
│  ├─ .env                 # VITE_USE_MOCK=true for demo judging
│  ├─ public/seed/         # demo product photos + CREDITS.json
│  └─ src/
│     ├─ pages/            # Home, Browse, ListingDetail, Sell, Checkout, Dashboard, Messages, Events, Favorites, Profile, Wallet, Notifications, Admin, Campus, Launch, DesignSystem, Prototype, Auth
│     ├─ components/       # Layout (demo banner + trust signals), Protected, etc
│     ├─ lib/              # api (mock-first), mockBackend, mockData (31 listings), icons, format
│     └─ context/          # AuthContext, CartContext, ToastContext
├─ server/
│  ├─ src/
│  │  ├─ db/               # pool, migrations (SQL), demo seed
│  │  ├─ lib/              # money, catalog, tokens, images, errors, logger
│  │  ├─ middleware/       # auth (JWT), error handler
│  │  ├─ repos/            # listings, users (data access)
│  │  ├─ routes/           # auth, users, listings, orders, messages, events, meta…
│  │  └─ index.ts / app.ts
│  └─ uploads/             # user uploads (git-ignored, auto-created)
├─ docs/                   # architecture, API, deployment, launch docs
├─ LIVE_DEMO.md            # Detailed judging guide + links
└─ docs/FINISHED_PRODUCT.md # Finished product checklist
```

## 🚀 Run locally (2 modes)

### Mode 1: Demo Mode (for judging, no Postgres needed) — RECOMMENDED FOR JUDGES

```bash
cd client
echo "VITE_USE_MOCK=true" > .env
echo "VITE_APP_VERSION=2.0.0-finished" >> .env
echo "VITE_DEMO_MODE=true" >> .env
npm install
npm run dev -- --host 0.0.0.0 --port 5173
# Open http://localhost:5173 — auto-logged as Tunde, 100% functional
```

### Mode 2: Full Stack (Postgres + API)

Requirements: **Node 18+**, **PostgreSQL 14+** running locally (or Docker).

```bash
# 1) database
sudo -u postgres psql -c "CREATE ROLE ojax LOGIN PASSWORD 'ojax_dev_pass' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE ojax OWNER ojax;"

# 2) install everything (root + server + client)
cd ojax && npm run setup

# 3) configure (optional — sane dev defaults already work)
cp server/.env.example server/.env

# 4) run in dev (API :4000 + Vite web app :5173 with proxy)
npm run dev
```

Open **http://localhost:5173** (dev) or **http://localhost:4000** (API + built SPA).

On first boot the API auto-runs migrations and seeds **demo data**
(users/listings/events with real licensed product photos).

**Demo accounts** (password for all: `OjaX@2025demo`)

| Account        | Email               | Notes                        |
|----------------|---------------------|------------------------------|
| Buyer          | tunde@ojax.demo     | Student buyer (UNILAG)       |
| Seller         | chiamaka@ojax.demo  | Student seller               |
| Seller 2       | obi@ojax.demo       | Has conversations + a sale   |
| Organisation   | nacoss@ojax.demo    | Post/manage campus events    |
| Admin          | admin@ojax.demo     | (role ready for admin UI)    |

## 🔧 Useful commands

```bash
npm run db:purge-demo  # switch showroom → real: deletes every @ojax.demo account & their content
npm run dev          # API + web concurrently
npm run build        # compile server + bundle client
npm run start        # run compiled server (serves client/dist too)
npm run typecheck    # strict TS on both packages
npm run test         # vitest unit tests
npm run db:reset     # drop schema, migrate + reseed
npm run db:migrate   # apply pending migrations only
```

Environment knobs live in `server/.env.example` — shipping fee, free-delivery threshold, service fee,
upload limits, JWT TTLs, gateway mode (sandbox/paystack), SMTP (dev logs emails to console).

## 🚀 Deploy

One command (needs Docker) — app + PostgreSQL + uploads volume, empty database,
no demo data:

```bash
export JWT_SECRET="$(openssl rand -hex 32)"
docker compose up --build -d     # → http://localhost:4000
```

For a public always-on URL: **Render** (blueprint `render.yaml`) or **Railway**
(`Dockerfile`) — full steps, env table, costs & verification in
`docs/DEPLOYMENT.md`. Production never seeds demo data (`NODE_ENV=production`
+ `DEMO_SEED=false` are enforced there).

### Live Demo Hosting (for this branch)

- **E2B Sandbox (current):** `https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app` (dev) and `https://4173-.../e2b.app` (prod preview) — ephemeral, for judging
- **Render:** Deploy via `render.yaml` blueprint — set `PUBLIC_BASE_URL` to final URL
- **Vercel:** `cd client && vercel --prod` — set `VITE_USE_MOCK=true` for instant demo

## 🗺️ Go live checklist (launch)

1. **Set `JWT_SECRET`** (long random value) and `NODE_ENV=production`.
2. Set **Paystack keys** (`PAYMENT_GATEWAY=paystack`) and flip the sandbox pay button to `pay-init`.
3. Point `PUBLIC_BASE_URL` at the deployed origin and serve uploads from persistent disk (or object storage).
4. Add **SMTP** creds so verification/reset emails actually send (dev logs them).
5. Run the **trust & safety** pass (see `docs/LAUNCH.md`) — moderation hooks, admin panel, reporting.
6. Optional: WebSockets for chat, email digests, mobile app (see Roadmap in `docs/`).

## 📄 Docs

- `LIVE_DEMO.md` — **NEW** — Live links, demo accounts, judging flow, screenshots
- `docs/FINISHED_PRODUCT.md` — **NEW** — Finished product checklist, what was polished, build status
- `docs/ARCHITECTURE.md` — system design, data model, flows (cart→checkout→pay→fulfilment), auth.
- `docs/API.md` — every endpoint, request/response shape and error codes.
- `docs/DEPLOYMENT.md` — deploy options: Docker one-command, Render/Railway PaaS, VPS; env vars, verification, backups.
- `docs/LAUNCH.md` — go-to-market plan, onboarding, trust & safety, roadmap.

## 🔁 CI/CD and web deployment

The private source repository is available at [github.com/dxt-stack/ojax](https://github.com/dxt-stack/ojax).
Every pull request and push to `main` runs dependency auditing, TypeScript checks, the server test suite,
the production client/server build, and a Docker image build. When the repository secret
`RENDER_DEPLOY_HOOK_URL` is configured, a successful push to `main` also triggers the Render deployment.

To create the hosted web app from the committed deployment blueprint, use the
[Deploy to Render button](https://render.com/deploy?repo=https://github.com/dxt-stack/ojax), then set the
generated service's `PUBLIC_BASE_URL` to its final public URL. The app exposes `/healthz` for deployment
health checks and serves the React web experience and API from the same origin.

### Enable automatic deployment

1. Create the service from the Render blueprint link above.
2. In Render, create a deploy hook for the `ojax` web service.
3. Add that URL to the private GitHub repository as the Actions secret `RENDER_DEPLOY_HOOK_URL`.
4. Future green pushes to `main` will trigger deployment automatically.

The deploy hook is intentionally optional: CI remains fully functional without production credentials,
which keeps pull requests safe and makes local development independent of a hosting provider.

## 🧾 Notes

- Money is transported as **kobo** integers (₦1 = 100 kobo) to avoid float errors.
- Demo seed photos are real, permissively-licensed images — see `client/public/seed/CREDITS.json`.
- `.env` is never committed in production. For demo judging, `client/.env` with `VITE_USE_MOCK=true` is committed on this branch for instant preview.
- Demo data exists **only** so a fresh clone can be explored (all accounts are `@ojax.demo` and development-only).
  Before a real launch run `npm run db:purge-demo` — the market then contains only real students' items.

---

© OjaX — built with ❤️ for Nigerian students. Made in Lagos 🇳🇬 — **Finished Product Demo v2.0.0**

# OjaX — Campus Market & Events

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

## 🧱 Tech stack

| Layer     | Choice                                   |
|-----------|------------------------------------------|
| Backend   | Node 18+, Express 4, TypeScript (strict) |
| Database  | PostgreSQL 14+ (pg + SQL migrations)     |
| Images    | multer (memory) → Sharp (resize/encode)  |
| Frontend  | React 18, React Router 6, Vite 5         |
| Auth      | JWT (access) + rotating refresh cookies  |
| Payments  | Sandbox OjaPay (default) → Paystack seam |
| Tests     | Vitest                                   |

## 📁 Repository layout

```
ojax/
├─ package.json            # workspace scripts (dev, build, db, test…)
├─ client/                 # React SPA (Vite)
│  ├─ public/seed/         # demo product photos + CREDITS.json (real, licensed photos)
│  └─ src/                 # pages, components, contexts, lib (api, icons, format…)
├─ server/
│  ├─ src/
│  │  ├─ db/               # pool, migrations (SQL), demo seed
│  │  ├─ lib/              # money, catalog, tokens, images, errors, logger
│  │  ├─ middleware/       # auth (JWT), error handler
│  │  ├─ repos/            # listings, users (data access)
│  │  ├─ routes/           # auth, users, listings, orders, messages, events, meta…
│  │  └─ index.ts / app.ts
│  └─ uploads/             # user uploads (git-ignored, auto-created)
└─ docs/                   # architecture, API, deployment, launch docs
```

## 🚀 Run locally

Requirements: **Node 18+**, **PostgreSQL 14+** running locally (or Docker).

```bash
# 1) database
#    macOS/Linux quick start (or use your own Postgres):
#    brew services start postgresql            # or: sudo service postgresql start
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

## 🗺️ Go live checklist (launch)

1. **Set `JWT_SECRET`** (long random value) and `NODE_ENV=production`.
2. Set **Paystack keys** (`PAYMENT_GATEWAY=paystack`) and flip the sandbox pay button to `pay-init`.
3. Point `PUBLIC_BASE_URL` at the deployed origin and serve uploads from persistent disk (or object storage).
4. Add **SMTP** creds so verification/reset emails actually send (dev logs them).
5. Run the **trust & safety** pass (see `docs/LAUNCH.md`) — moderation hooks, admin panel, reporting.
6. Optional: WebSockets for chat, email digests, mobile app (see Roadmap in `docs/`).

## 📄 Docs

- `docs/ARCHITECTURE.md` — system design, data model, flows (cart→checkout→pay→fulfilment), auth.
- `docs/API.md` — every endpoint, request/response shape and error codes.
- `docs/DEPLOYMENT.md` — deploy options: Docker one-command, Render/Railway PaaS, VPS; env vars, verification, backups.
- `docs/LAUNCH.md` — go-to-market plan, onboarding, trust & safety, roadmap.

## 🧾 Notes

- Money is transported as **kobo** integers (₦1 = 100 kobo) to avoid float errors.
- Demo seed photos are real, permissively-licensed images — see `client/public/seed/CREDITS.json`.
- `.env` is never committed. `server/uploads/` (user content) is git-ignored; the demo seeder recreates
  its files from the bundled photos on a fresh database.
- Demo data exists **only** so a fresh clone can be explored (all accounts are `@ojax.demo` and development-only).
  Before a real launch run `npm run db:purge-demo` — the market then contains only real students' items.

---

© OjaX — built with ❤️ for Nigerian students. Made in Lagos 🇳🇬

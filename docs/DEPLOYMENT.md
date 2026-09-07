# OjaX — Deployment Guide

OjaX ships as a **single container** (API + built web app + uploads) with a
separate PostgreSQL. Migrations run automatically at boot; **production never
seeds demo data** (double-guarded: `NODE_ENV=production` and `DEMO_SEED=false`).

Pick one path:

| Path | Effort | Cost | Best for |
|---|---|---|---|
| [A. Docker Compose (local)](#a-docker-compose-local--one-command) | 1 min | ₦0 | Running it yourself, staging, LAN demo |
| [B. Render (managed PaaS)](#b-render--blueprint) | 10 min | ~$7/mo web + ~$7/mo Postgres | Public always-on URL, auto-HTTPS |
| [C. Railway (managed PaaS)](#c-railway--manual) | 10 min | similar to Render | Public always-on URL |
| [D. VPS / single VM](#d-vps--single-vm) | 1–2 h | ~$5–10/mo | Full control, low traffic, ₦ hosting |

> **Honest cost note (Sept 2026):** Render/Railway free tiers no longer run
> always-on web services, and free managed Postgres expires. Budget
> ~$15/mo total on a PaaS, or use a small VPS.

---

## Environment variables (all paths)

| Var | Required | Notes |
|---|---|---|
| `NODE_ENV` | **yes** | `production`. Prevents demo seeding, enables CSP + caching. |
| `DATABASE_URL` | **yes** | `postgres://user:pass@host:5432/ojax` |
| `JWT_SECRET` | **yes** | Generate: `openssl rand -hex 32` |
| `DEMO_SEED` | yes | `false` in production (belt & braces). |
| `PORT` | no | PaaS sets it (Render/Railway inject `PORT`); default `4000`. |
| `UPLOAD_ROOT` | no | Default `./uploads`. **Point at a persistent volume** — user photos/avatars are user content. |
| `PUBLIC_BASE_URL` | no | Public https URL — used in email/notification links. |
| `TRUST_PROXY` | no | Default `true` — correct behind Render/Railway/Nginx. |
| `SMTP_HOST/PORT/USER/PASS/FROM` | no | Leave empty: dev mailer logs to console instead of sending. |
| `PAYMENT_GATEWAY` | no | `sandbox` (default, fake gateway) or `paystack` + `PAYSTACK_SECRET_KEY`/`PUBLIC_KEY` to take real payments. |
| `MAX_*`, `SHIPPING_FEE_KOBO`, etc. | no | Business rules, see `server/.env.example`. |

---

## A. Docker Compose (local) — one command

Requires Docker. Two containers: `postgres:17` + the OjaX image.

```bash
# 1. from the repo root
export JWT_SECRET="$(openssl rand -hex 32)"
docker compose up --build -d

# 2. open it
open http://localhost:4000          # health: http://localhost:4000/healthz
```

- Migrations apply automatically; the database starts **empty** — register the
  first real account (there is deliberately no admin/demo user in production).
- `docker compose logs -f web` to watch boot; `docker compose down` to stop.
- Photos & avatars live in the `uploads` volume; database in `db-data`.
  Back them up (`docker compose exec db pg_dump -U ojax ojax > ojax.sql`).

---

## B. Render — Blueprint

1. Push the repo to GitHub (see `push-to-github.sh`).
2. Create a Render account and connect GitHub.
3. Use the blueprint deploy URL with your repo:
   `https://render.com/deploy?repo=<YOUR_GITHUB_REPO_URL>`
   — or in the dashboard: **New → Blueprint** and paste the repo.
   It reads `render.yaml`: creates the Postgres DB (`ojax-db`), the web service
   (`ojax`, Docker, `starter` plan), a 1 GB disk at `/data` for uploads, and
   generates `JWT_SECRET` automatically.
4. After first deploy, set `PUBLIC_BASE_URL` to
   `https://ojax.onrender.com` (or your custom domain in **Settings → Custom
   Domain**).
5. Verify: open `https://ojax.onrender.com/healthz` → `{"ok":true,...}`,
   then register an account and post a listing with a photo.

Plans: `starter` web ~$7/mo, `basic-256mb` Postgres ~$7/mo. Free plans spin
down after 15 min and free Postgres expires — fine for a demo, not for launch.

---

## C. Railway — manual

1. Push the repo to GitHub; **New Project → Deploy from GitHub repo**.
   Railway detects the `Dockerfile` automatically.
2. Add **PostgreSQL** plugin → copy its `DATABASE_URL`.
3. Service → **Variables**:
   - `NODE_ENV=production`, `DEMO_SEED=false`
   - `DATABASE_URL` (from the plugin)
   - `JWT_SECRET` = `openssl rand -hex 32`
   - `PUBLIC_BASE_URL=https://<your-service>.up.railway.app`
4. Service → **Settings → Mounts**: add a volume mounted at `/data`
   (`UPLOAD_ROOT` already defaults to `/data/uploads` in the image).
5. Deploy; check **Deployments → logs** for `OjaX API listening`, then open the
   generated URL. Health check path: `/healthz`.

---

## D. VPS / single VM

```bash
sudo apt update && sudo apt install -y nginx postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE ROLE ojax LOGIN PASSWORD '<strong-password>' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE ojax OWNER ojax;"

cd /srv && git clone git@github.com:<you>/ojax.git && cd ojax
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
npm run setup
cp server/.env.example server/.env
# edit server/.env: NODE_ENV=production, DATABASE_URL, JWT_SECRET, PUBLIC_BASE_URL, SMTP_*…
npm run build
npm i -g pm2
pm2 start "npm --prefix server run start" --name ojax && pm2 save && pm2 startup
```

Caddy reverse proxy (auto-HTTPS, replace domain):

```caddyfile
market.ojax.app {
    reverse_proxy 127.0.0.1:4000
    encode gzip
    header /uploads/* Cache-Control "public, max-age=2592000, immutable"
}
```

---

## Verify a production deployment (2 minutes)

```bash
curl -s https://YOUR-URL/healthz                 # {"ok":true,...}
# Must be EMPTY of demo accounts — production never seeds:
# (DB is private on PaaS; locally:)
docker compose exec db psql -U ojax -c "SELECT count(*) FROM users;"
```

1. Register a fresh account → dashboard loads.
2. Post a listing with photos → images appear (uploads volume writable).
3. Buy via a second account → sandbox pay → confirm → rate the seller →
   rating appears on their profile.
4. Reload the SPA route directly (e.g. `/listings/some-slug`) → no 404
   (SPA fallback works).

If step 1 shows demo users, `NODE_ENV` is not `production` — fix it, purge with
`npm run db:purge-demo`, and redeploy.

---

## Going live with real payments

The default `PAYMENT_GATEWAY=sandbox` simulates card payment with a fake
gateway. To accept real money via Paystack (NGN):

1. Set `PAYMENT_GATEWAY=paystack`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
   (server signs + verifies transactions; no card data ever touches OjaX).
2. Add `https://YOUR-URL/api/paystack/webhook` as a Paystack webhook.
3. Test with Paystack's test keys first (₦ amounts only, `TEST` mode).

Email (`SMTP_*`) can stay unset at launch — verification codes log to the
server console instead of being sent.

---

## Backups

```bash
# nightly cron on a VPS (PaaS: use their built-in DB backups)
pg_dump -U ojax ojax | gzip > /srv/backups/ojax-$(date +%F).sql.gz
find /srv/backups -name '*.sql.gz' -mtime +14 -delete
```

Uploads live wherever `UPLOAD_ROOT` points (a volume on PaaS, `server/uploads/`
on a VPS) — back them up with the same cadence.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Boot log `Cannot reach PostgreSQL` | Wrong `DATABASE_URL` or DB not reachable from the service |
| Boot log `Seeding demo data…` in prod | `NODE_ENV` isn't `production` — set it, purge, redeploy |
| SPA routes 404 on refresh | Old image/deploy before SPA fallback; rebuild |
| Photos 500/`ENOENT` after redeploy | No persistent volume at `UPLOAD_ROOT` — mount one |
| Everything 429s | Rate limiter sees one proxy IP — confirm `TRUST_PROXY=true` |
| `jwt` errors on login | `JWT_SECRET` changed between deploys — keep it stable |

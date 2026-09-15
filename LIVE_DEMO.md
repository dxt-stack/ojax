# OjaX — Live Demo & Judging Guide
## Finished Product v2.0.0 — Ready for Judging

**Branch:** `arena/01a0a2ca-ojax`  
**Last Build:** ✅ Vite build passed (425kb → 122kb gzip, CSS 66kb)  
**Demo Mode:** 100% functional, localStorage persistence, no backend needed

---

## 🌐 Live Links (E2B Sandbox)

These links are ephemeral (tied to sandbox `i8xnfxqd8dpcu7jnxfbzc`). If they expire, run locally with `VITE_USE_MOCK=true`.

| Link | URL | Purpose |
|------|-----|---------|
| **🔥 Primary — Dev HMR** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app | Main judging link, HMR, fastest |
| **📦 Prod Preview** | https://4173-i8xnfxqd8dpcu7jnxfbzc.e2b.app | Production build preview, stable for iframe |
| **🚀 Pitch / Product Overview** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/launch | For judges: problem, solution, tech stack, checklist |
| **🛍️ Browse** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/browse | Marketplace |
| **🎓 Campuses** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/campus | 27 universities |
| **💳 Wallet** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/wallet | Escrow + payouts (auth) |
| **🔔 Notifications** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/notifications | Orders, messages, events |
| **🛡️ Admin** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/admin | Moderation, fraud, analytics |
| **🎨 Design System** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/design-system | Colors, typography, components |
| **📱 Prototype** | https://5173-i8xnfxqd8dpcu7jnxfbzc.e2b.app/prototype | Mobile interactive prototype |

### Why two ports?

- **5173 (dev):** Vite dev server with HMR, instant reload, best for development. Sometimes Arena's iframe preview blocks websocket — open in new tab if blank.
- **4173 (prod):** `vite preview` serving `dist/` — no HMR, pure static, always embeddable, best for judging in sandbox.

**Vite config already has:**
```ts
server: {
  host: "0.0.0.0",
  port: 5173,
  allowedHosts: true, // allows e2b.app host
}
```

If preview shows "Host not allowed" or blank, open link directly in browser, not inside Arena iframe.

---

## 🔑 Demo Accounts

Password for **all**: `OjaX@2025demo`

| Role | Email | Use Case |
|------|-------|----------|
| Buyer | `tunde@ojax.demo` | Add to cart, checkout, orders, reviews, favorites |
| Seller | `chiamaka@ojax.demo` | Sell items, view sales, payouts, profile stats |
| Seller 2 | `obi@ojax.demo` | Has conversations + sale history |
| Org | `nacoss@ojax.demo` | Publish events, manage RSVPs |
| Admin | `admin@ojax.demo` | Admin dashboard (role ready) |

**Auto-login:** Demo mode auto-logs as Tunde (`u1`). Switch via Login page → **Fill Buyer/Seller** buttons.

**Reset demo data:**
- Click avatar → **Reset demo** (clears localStorage)
- Or console: `localStorage.clear(); location.reload()`

---

## ✅ Judging Flow (5 min)

### 1. Browse as guest (no login)
- Home (`/`) → Premium hero, trust strip, category grid, split feature, dark section
- Browse (`/browse`) → 31 listings, search, filters (category, price, condition), sorting, pagination
- Item Detail (`/item/:id`) → Gallery with thumbs (8 photos), buybox sticky, seller trust card, safety note, related items

### 2. Sign in
- `/login` → Split-screen auth (left: dark visual with shield/location/chat points + UNILAG quote, right: form)
- Click **Fill Buyer** → `tunde@ojax.demo` + password auto-filled → Sign in
- Check UserMenu: 42px avatar, verified chip `VERIFIED • UNILAG`, 9 links, wallet/bell icons

### 3. Commerce flow
- Add item to cart → Cart count updates → `/checkout` → Choose pickup/delivery (₦2,500 flat, free ≥₦20k) → Pay sandbox → Order created → Dashboard (`/dashboard`) orders → Confirm delivery → Review seller (real reviews, one per purchase, not seeded)

### 4. Messaging & Events
- From item page → **Message seller** → Thread per listing → `/messages` → Unread badges, read receipts, 6s polling
- `/events` → 8 events, RSVP with capacity checks → Org account can publish
- `/campus` → 27 universities, city/state, popular listings

### 5. Finished extras
- `/wallet` → Gradient card, balance ₦45,250, transactions, payout flow, trust & safety, bank account
- `/notifications` → Mark-read, tabs (orders, messages, events, system)
- `/admin` → Moderation queue, verification, fraud flags, launch checklist
- `/design-system` → Colors, typography, components
- `/prototype` → Mobile interactive prototype (splash, onboarding, home, browse, detail, sell, events, chat, profile)
- `/launch` → Pitch page: problem/solution, tech stack, shipped checklist, how to judge CTA

---

## 🛠️ What was fixed & polished for finished product

### Critical blockers fixed
- **CSS corruption:** `index.css` had `.chat-main { border: 1px solid va background: var(--ink)` + duplicated `.catsnav`/`.footer` causing `Expected }` — fixed, build clean
- **Auth.tsx duplication:** 519 lines with duplicated Register/Forgot/Reset causing `Unexpected } at 439` — trimmed to clean 340 lines, added `PasswordInput` eye toggle, split-screen visual

### New pages (5)
- `Launch.tsx` — standalone pitch outside Layout, hero with floating cards, problem/solution, tech stack, checklist, judging CTA
- `Campus.tsx` — 27 universities grid, city/state, popular listings, search
- `Wallet.tsx` — escrow wallet UI, gradient balance card, transactions, payout flow
- `Notifications.tsx` — mark-read, tabs, unread dot
- `Admin.tsx` — moderation queue, verification, fraud flags, launch checklist

### Layout.tsx enhanced
- Demo banner: gradient `#e95b2b→#f08a4d`, FINISHED PRODUCT DEMO + Product Overview link + demo creds
- Topbar marquee: Verified, Escrow, Delivery, 27 universities, Campus events
- Header: cart + bell (count 3) + wallet navicons, UserMenu 42px avatar + verified chip + 9 links + reset demo
- Footer: demo accounts box + trust chips + product links

### Auth.tsx polished
- Split-screen: left dark `#17212b` with radial gradients, brand, 36px h2 with orange em, lede, 3 points (shield/location/chat), quote
- Right: auth-card2 20px radius, demo-box with codes, role-toggle student/org
- Login: Fill Buyer/Seller buttons

### index.css extras
- `.auth-shell` grid 1fr 1.1fr, responsive <900px
- `.demo-banner`, `.wallet-grid`, `.campus-grid`, `.launch-hero`, `.notif-list` etc
- Build: 66kb CSS gzipped 14kb, 425kb JS gzipped 122kb

---

## 🚀 Run locally (judges)

### Option A: Demo Mode (no Postgres, instant) — RECOMMENDED
```bash
git clone https://github.com/dxt-stack/ojax.git
cd ojax
git checkout arena/01a0a2ca-ojax
cd client
npm install
echo "VITE_USE_MOCK=true" > .env
echo "VITE_APP_VERSION=2.0.0-finished" >> .env
echo "VITE_DEMO_MODE=true" >> .env
npm run dev -- --host 0.0.0.0 --port 5173
# Open http://localhost:5173
```

### Option B: Full Stack
```bash
cd ojax
npm run setup
cp server/.env.example server/.env
npm run dev
# API :4000 + Web :5173
```

---

## 📦 Production Deploy

- **Docker one-command:** `docker compose up --build -d` → http://localhost:4000
- **Render:** Use `render.yaml` blueprint, set `PUBLIC_BASE_URL`
- **Vercel:** `cd client && vercel --prod` with `VITE_USE_MOCK=true` for instant demo
- **E2B (current):** Ephemeral, for judging only

---

## 🔗 GitHub Links

- **Repo:** https://github.com/dxt-stack/ojax
- **This branch:** https://github.com/dxt-stack/ojax/tree/arena/01a0a2ca-ojax
- **Live Demo MD:** https://github.com/dxt-stack/ojax/blob/arena/01a0a2ca-ojax/LIVE_DEMO.md
- **Finished Product MD:** https://github.com/dxt-stack/ojax/blob/arena/01a0a2ca-ojax/docs/FINISHED_PRODUCT.md
- **README:** https://github.com/dxt-stack/ojax/blob/arena/01a0a2ca-ojax/README.md
- **Launch page (in-app):** `/launch` route

---

## 🐛 Troubleshooting Preview

**If https://5173-...e2b.app shows blank or "Host not allowed":**
1. Open in new tab, not iframe
2. Try prod preview: https://4173-i8xnfxqd8dpcu7jnxfbzc.e2b.app
3. Check vite config has `allowedHosts: true` and `host: "0.0.0.0"` (it does)
4. Restart dev server: `pkill -f vite; cd client && npx vite --host 0.0.0.0 --port 5173`
5. Build & preview: `npm run build && npx vite preview --host 0.0.0.0 --port 4173`

**If you see old UI:**
- Hard reload (Ctrl+Shift+R)
- Clear localStorage: `localStorage.clear()`

---

© OjaX — Finished Product Demo v2.0.0 — Built for Nigerian students 🇳🇬

/**
 * OjaX demo seed — realistic campus data so a fresh clone feels alive.
 * Runs automatically on dev boot (DEMO_SEED=true) unless the DB already has
 * seeded listings, or `npm run db:seed -- --fresh` resets everything first.
 *
 * All listing photos are real, permissively-licensed product photos bundled
 * with the repo (see client/public/seed/CREDITS.json). Seller "on campus"
 * data is fictional.
 */
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { pool, query, queryOne } from "./pool.js";
import { config } from "../config.js";
import { logger } from "../lib/logger.js";

const here = path.dirname(fileURLToPath(import.meta.url));

export const DEMO_PASSWORD = "OjaX@2025demo";
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const fmt = (d: Date) => d.toISOString();

interface SeedUser {
  key: string;
  fullName: string;
  email: string;
  university: string;
  department: string;
  level: string;
  isOrg?: boolean;
  orgName?: string;
  avatar?: string;
  bio?: string;
  meetup?: string;
  phone?: string;
}

const SEED_USERS: SeedUser[] = [
  { key: "tunde", fullName: "Tunde Bakare", email: "tunde@ojax.demo", university: "UNILAG", department: "Computer Engineering", level: "400L", phone: "0803 000 0001", meetup: "UNILAG — in front of the main library", bio: "CE 400L. Upgrading my setup so old gear must go. Meet at the library." },
  { key: "chiamaka", fullName: "Chiamaka Okafor", email: "chiamaka@ojax.demo", university: "UNILAG", department: "Mass Communication", level: "300L", bio: "Mass Comm 300L, photography side-hustle. Everything listed is clean." },
  { key: "femi", fullName: "Femi Adeyemi", email: "femi@ojax.demo", university: "LASU", department: "Electrical & Electronics Engineering", level: "500L", meetup: "LASU main gate, Ojo" },
  { key: "amara", fullName: "Amara Eze", email: "amara@ojax.demo", university: "COVENANT", department: "Accounting", level: "200L" },
  { key: "david", fullName: "David Uche", email: "david@ojax.demo", university: "UNIBEN", department: "Mechanical Engineering", level: "300L" },
  { key: "zainab", fullName: "Zainab Abdullahi", email: "zainab@ojax.demo", university: "ABU", department: "Medicine & Surgery", level: "400L" },
  { key: "seun", fullName: "Seun Alabi", email: "seun@ojax.demo", university: "UI", department: "Political Science", level: "200L" },
  { key: "nneka", fullName: "Nneka Obi", email: "nneka@ojax.demo", university: "UNN", department: "Law", level: "400L" },
  { key: "emeka", fullName: "Emeka Nwosu", email: "emeka@ojax.demo", university: "OAU", department: "Computer Science", level: "500L" },
  { key: "kemi", fullName: "Kemi Bello", email: "kemi@ojax.demo", university: "UNILAG", department: "Creative Arts", level: "300L" },
  { key: "ismail", fullName: "Ismail Suleiman", email: "ismail@ojax.demo", university: "BUK", department: "Biochemistry", level: "300L" },
  { key: "grace", fullName: "Grace Adekunle", email: "grace@ojax.demo", university: "UI", department: "Nursing", level: "300L" },
  { key: "obi", fullName: "Obi Nwankwo", email: "obi@ojax.demo", university: "UNILAG", department: "Systems Engineering", level: "500L" },
  { key: "halima", fullName: "Halima Yusuf", email: "halima@ojax.demo", university: "UNIMAID", department: "Architecture", level: "400L" },
  { key: "sam", fullName: "Samuel Johnson", email: "sam@ojax.demo", university: "UNILORIN", department: "Computer Science", level: "200L" },
];

const ORGS: SeedUser[] = [
  { key: "nacoss", fullName: "NACOSS UNILAG", email: "nacoss@ojax.demo", university: "UNILAG", department: "Association", level: "", isOrg: true, orgName: "Nigeria Association of Computing Students — UNILAG Chapter" },
  { key: "eesa", fullName: "EESA UNILAG", email: "eesa@ojax.demo", university: "UNILAG", department: "Association", level: "", isOrg: true, orgName: "Electrical Engineering Students' Association, UNILAG" },
  { key: "jci", fullName: "JCI Unilag", email: "jci@ojax.demo", university: "UNILAG", department: "Association", level: "", isOrg: true, orgName: "Junior Chamber International, University of Lagos" },
  { key: "masscomm", fullName: "MassComm Press", email: "press@ojax.demo", university: "UNILAG", department: "Association", level: "", isOrg: true, orgName: "Department of Mass Communication Press Crew" },
];

interface SeedListing {
  seller: string;
  title: string;
  desc: string;
  cat: string;
  sub?: string;
  cond: string;
  price: number; // naira
  negotiable?: boolean;
  qty?: number;
  ship?: boolean;
  img?: string; // slug of photo
  createdAtDaysAgo: number;
  views: number;
  featured?: boolean;
  spot?: string;
}

const SEED_LISTINGS: SeedListing[] = [
  { seller: "tunde", title: "iPhone 13 — 128GB, Midnight", desc: "Bought in 2022, battery health 86%. No scratches on the screen — always had a glass + case. Face ID works perfectly. Comes with original box and a spare case. Reason for sale: upgraded to a 15 Pro.\n\nYou can check it before paying at the main library.", cat: "phones", sub: "smartphones", cond: "used-excellent", price: 340_000, negotiable: true, img: "google-pixel-8-pro", createdAtDaysAgo: 2, views: 312, spot: "UNILAG — main library" },
  { seller: "femi", title: "Dell XPS 13 (2021) — Core i7 / 16GB / 512GB", desc: "The classic XPS 13 9310. i7-1165G7, 16GB RAM, 512GB NVMe, 4K touch display. Light, fast, battery still gives 6–7 hours. Selling because I got a work laptop. Original charger included.\n\nOpen to serious offers. Check it at LASU main gate.", cat: "computing", sub: "laptops", cond: "used-good", price: 580_000, negotiable: true, ship: true, img: "dell-xps-13", createdAtDaysAgo: 5, views: 489, spot: "LASU main gate, Ojo" },
  { seller: "amara", title: "iPad Pro 13-inch (2020) + Apple Pencil", desc: "iPad Pro M1 era 13\" with 128GB. Used mainly for lectures and Procreate. Screen is flawless, battery solid. Apple Pencil 2 included (tip recently replaced). Selling to focus on ACCA.\n\nSeries: 2020 4th gen.", cat: "phones", sub: "tablets", cond: "used-excellent", price: 620_000, negotiable: true, ship: true, img: "ipad-pro-2020", createdAtDaysAgo: 8, views: 267, spot: "Covenant — Chapel of Light lobby" },
  { seller: "chiamaka", title: "Google Pixel 8 Pro — 128GB, Bay Blue", desc: "Imported in January. Clean Google phone, 7 years of updates, best camera on campus honestly. Bay blue, 128GB. Selling because I shoot with a camera now.\n\nComes with a Spigen case + original cable.", cat: "phones", sub: "smartphones", cond: "like-new", price: 610_000, negotiable: true, img: "google-pixel-7a", createdAtDaysAgo: 12, views: 420, spot: "UNILAG — faculty of arts quad" },
  { seller: "david", title: "PS4 Pro 1TB with 2 controllers + 6 games", desc: "Console in excellent shape, cleaned regularly. 1TB PS4 Pro. Comes with 2 DualShock 4s, FIFA 25, GTA V, God of War Ragnarök, Call of Duty MW3, UFC 5 and FC 24 (digital + disc mix).\n\nReason: final year, no time. Serious buyers only.", cat: "electronics", sub: "gaming", cond: "used-good", price: 250_000, negotiable: true, ship: true, img: "ps4-console", createdAtDaysAgo: 3, views: 671, spot: "UNIBEN — TETFUND building" },
  { seller: "kemi", title: "Sennheiser HD 598 open-back headphones", desc: "Beautiful open-back studio headphones — perfect for mixing or just enjoying music in a quiet room. Cable and 6.3mm adapter included. Pads recently replaced with genuine spares.", cat: "electronics", sub: "audio", cond: "used-good", price: 45_000, negotiable: true, img: "sennheiser-hd598", createdAtDaysAgo: 4, views: 133 },
  { seller: "seun", title: "Campus starter: Kånken backpack + water bottle", desc: "Fjällräven Kånken in classic style — the grey one everyone loves. Bought for my first year, still very strong. Slight fray on one zip pull but everything works. Also throwing in a steel water bottle.", cat: "fashion", sub: "bags", cond: "used-good", price: 28_000, negotiable: true, img: "kanken-backpack", createdAtDaysAgo: 7, views: 98 },
  { seller: "zainab", title: "Physics + Chemistry textbooks bundle (400L)", desc: "University Physics (Young & Freedman 13th ed), Organic Chemistry (Clayden), and a brand-new Schaum's outline set. Kept in great condition — highlighters used lightly. Selling as a bundle for ₦18k or separately.", cat: "textbooks", sub: "sciences", cond: "used-good", price: 18_000, negotiable: true, img: "college-textbooks", createdAtDaysAgo: 1, views: 76, spot: "ABU — Kongo campus bookshop" },
  { seller: "obi", title: "AirPods Pro (2nd gen, USB-C)", desc: "Genuine AirPods Pro 2 with the USB-C case. ANC is elite for the library. Tip size M used. Bought two months ago — selling because I lost the left one and bought a replacement pair (found the old one after 😅).", cat: "electronics", sub: "audio", cond: "like-new", price: 145_000, negotiable: false, ship: true, img: "airpods-pro-2", createdAtDaysAgo: 2, views: 205 },
  { seller: "grace", title: "Canon Pixma inkjet printer — good for printouts", desc: "Canon Pixma inkjet, works perfectly. I used it for handouts and project printing. Comes with one black + one colour cartridge. Selling because the faculty office printing is cheaper for me now.", cat: "computing", sub: "printers", cond: "used-good", price: 65_000, negotiable: true, img: "canon-pixma-printer", createdAtDaysAgo: 9, views: 88, spot: "UI — Dugbe campus" },
  { seller: "emeka", title: "DJI Mavic Air 2 fly-more combo", desc: "Mavic Air 2 with 3 batteries, ND filters, controller and bag. Flown maybe 10 times — final-year project drone. Clean flight logs, no crashes. Selling with everything in the fly-more combo box.", cat: "electronics", sub: "cameras", cond: "used-excellent", price: 720_000, negotiable: true, ship: true, img: "dji-mavic-air-2", createdAtDaysAgo: 6, views: 333, spot: "OAU — gate" },
  { seller: "halima", title: "JBL Flip 4 Bluetooth speaker", desc: "Good little party speaker. Bass still hits. Minor cosmetic marks on the mesh. Battery lasts ~8 hours. Perfect for hostel hangouts.", cat: "electronics", sub: "audio", cond: "used-good", price: 26_000, negotiable: true, img: "jbl-flip-4", createdAtDaysAgo: 11, views: 91 },
  { seller: "ismail", title: "Canon EOS 7D body only — for photography lovers", desc: "Canon 7D body, shutter count ~48k. Works perfectly — I upgraded to mirrorless. No lens included. Great for learning photography properly. Includes battery + charger + body cap.", cat: "electronics", sub: "cameras", cond: "used-fair", price: 165_000, negotiable: true, img: "canon-eos-7d", createdAtDaysAgo: 13, views: 154 },
  { seller: "sam", title: "Nike Air Force 1 — UK 9, white", desc: "Classic all-white AF1s. UK 9. Worn about 6 times, still crisp. Selling because they're slightly big for me (I'm a UK 8.5). Original box included.", cat: "fashion", sub: "shoes", cond: "like-new", price: 58_000, negotiable: true, ship: true, img: "air-force-1", createdAtDaysAgo: 3, views: 178 },
  { seller: "nneka", title: "Casio Edifice chronograph — near mint", desc: "Casio Edifice WR100M chronograph. Gift from my dad, but I wear my G-Shock more. Full box + extra links. Battery fine. Classy for interviews/CI&P.", cat: "fashion", sub: "accessories-fashion", cond: "like-new", price: 42_000, negotiable: true, img: "casio-edifice-watch", createdAtDaysAgo: 10, views: 66 },
  { seller: "obi", title: "Logitech mechanical keyboard (G413-ish, brown switches)", desc: "Logitech mechanical with tactile switches. RGB? No — clean white backlight, honestly nicer for the hostel. Great typing feel for long assignments. USB cable, excellent condition.", cat: "computing", sub: "peripherals", cond: "used-good", price: 34_000, negotiable: true, img: "logitech-keyboard", createdAtDaysAgo: 1, views: 145 },
  { seller: "zainab", title: "Razer BlackWidow Ultimate 2014 — RGB mechanical", desc: "Vintage RGB board that still shreds. Cherry? No — Razer green switches (clicky). Great for gaming, annoying for your roommate. Selling after upgrading. Lights all work.", cat: "electronics", sub: "gaming", cond: "used-fair", price: 24_000, negotiable: true, img: "razer-blackwidow", createdAtDaysAgo: 14, views: 87 },
  { seller: "david", title: "Xbox 360 wireless controller — PC ready", desc: "Spare Xbox 360 controller, works on PC/Xbox. Slight stick wear but no drift. ₦12k or best offer. Comes with wireless receiver dongle.", cat: "electronics", sub: "gaming", cond: "used-good", price: 12_000, negotiable: true, img: "xbox-360-controller", createdAtDaysAgo: 5, views: 54 },
  { seller: "amara", title: "AKG C214 studio condenser mic + shock mount", desc: "AKG C214 — the budget studio classic. Used for podcasting and vocals. Comes with H85 shock mount and padded case. Sound is warm, no issues at all.", cat: "hobbies", sub: "instruments", cond: "used-good", price: 210_000, negotiable: true, ship: true, img: "akg-c214-mic", createdAtDaysAgo: 6, views: 112 },
  { seller: "grace", title: "Sony A99 full-frame camera + 50mm f/1.8", desc: "Full-frame Sony A99 body + Sony 50mm f/1.8. Beautiful colours, great for portraits. Selling to fund a Fuji. Body has normal wear, sensor clean — I'll show you test shots.", cat: "electronics", sub: "cameras", cond: "used-good", price: 450_000, negotiable: true, ship: true, img: "sony-a99-camera", createdAtDaysAgo: 9, views: 98 },
  { seller: "femi", title: "Standing fan — like new, cool as anything", desc: "Brand-new-style standing fan (used one harmattan season). Strong breeze, quiet on low. Selling because my flat now has AC. Pickup at Ojo.", cat: "home", sub: "appliances", cond: "used-excellent", price: 22_000, negotiable: true, img: "standing-fan", createdAtDaysAgo: 7, views: 60, spot: "LASU — Ojo" },
  { seller: "kemi", title: "Electric steam iron — dorm essential", desc: "Steam iron in great condition. Non-stick plate, works on all voltages. Perfect for pressing your shirts before interviews (iykyk).", cat: "home", sub: "appliances", cond: "used-good", price: 8_000, negotiable: true, img: "steam-iron", createdAtDaysAgo: 4, views: 44 },
];

interface SeedEvent {
  org: string;
  title: string;
  desc: string;
  cat: string;
  daysFromNow: number; // start offset days
  durationHrs: number;
  venue: string;
  city?: string;
  capacity?: number;
  poster?: string;
  priceN?: number;
}

const SEED_EVENTS: SeedEvent[] = [
  { org: "nacoss", title: "TechTrek 2025 — Code, Ship, Repeat", desc: "NACOSS UNILAG presents a full-day tech conference: keynote from alumni founders, parallel tracks in web dev, AI and cybersecurity, a mini-hackathon with prizes, and a career fair with 10+ companies. Free for NACOSS members. Registration closes a day before.", cat: "hackathons", daysFromNow: 6, durationHrs: 9, venue: "Main Auditorium, UNILAG", capacity: 800, poster: "/seed/event-hackathon.jpg" },
  { org: "eesa", title: "EESA Career Clinic: Power Sector Edition", desc: "Meet engineers from TCN, Ikeja Electric and an energy startup. Panel + networking + CV review. Bring your CVs!", cat: "career", daysFromNow: 2, durationHrs: 4, venue: "Engineering Lecture Theatre 2", capacity: 300 },
  { org: "masscomm", title: "Flick & Frame: MassComm Film Night", desc: "Short films by students, live music by the school band, and a photography exhibition. Snacks on us. Dress: smart casual.", cat: "arts", daysFromNow: 10, durationHrs: 5, venue: "New Hall Marquee", capacity: 500, poster: "/seed/event-filmnight.jpg" },
  { org: "jci", title: "JCILAG Leadership Bootcamp", desc: "A one-day leadership intensive for student leaders: communication, project management, and negotiation skills with certified trainers.", cat: "career", daysFromNow: 16, durationHrs: 8, venue: "JCI House, Akoka", capacity: 120, priceN: 2000 },
  { org: "nacoss", title: "Code & Chill: Weekly Hack Night", desc: "Every Friday, NACOSS opens the lab for a community coding night. Bring your laptop, pair with a mentor, ship something small. Beginners very welcome.", cat: "hackathons", daysFromNow: 12, durationHrs: 5, venue: "CS Lab 3, UNILAG" },
  { org: "eesa", title: "Inter-Faculty Football Cup — Group Stage", desc: "The Engineering faculty's football cup kicks off! Come cheer for your faculty. Entry is free; food stalls available.", cat: "sports-events", daysFromNow: 20, durationHrs: 6, venue: "UNILAG Sports Centre Pitch" },
];

async function seedRun() {
  logger.info("Seeding demo data...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const hash = await bcrypt.hash(DEMO_PASSWORD, 8);
    const ids: Record<string, string> = {};

    // users
    const insertUser = `INSERT INTO users (full_name, email, password_hash, university_code, department, level, is_org, org_name, phone, bio, meetup_spot, verified, email_verified, onboarded)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, TRUE, TRUE, TRUE) RETURNING id`;

    for (const u of [...SEED_USERS, ...ORGS]) {
      const r = await client.query(insertUser, [
        u.fullName, u.email, hash, u.university || null, u.department || null, u.level || null,
        !!u.isOrg, u.orgName || null, u.phone || null, u.bio || "", u.meetup || null,
      ]);
      ids[u.key] = r.rows[0].id as string;
    }

    // admin
    const adminR = await client.query(insertUser, [
      "OjaX Admin", "admin@ojax.demo", hash, "UNILAG", "Administration", null, false, null, null,
      "Platform administrator.", null,
    ]);
    ids["admin"] = adminR.rows[0].id as string;

    // seed listing photos: copy bundled photo -> uploads/full + thumb, register uploads row
    const seedDir = path.resolve(here, "../../../client/public/seed");
    const uploadRoot = config.uploadRoot;
    const ym = new Date().toISOString().slice(0, 7).replace("-", "");
    const fullDir = path.join(uploadRoot, "full", ym);
    const thumbDir = path.join(uploadRoot, "thumb", ym);
    fs.mkdirSync(fullDir, { recursive: true });
    fs.mkdirSync(thumbDir, { recursive: true });

    const uploadCache: Record<string, { fullKey: string; thumbKey: string }> = {};
    async function ensureSeedPhoto(slug: string) {
      if (!slug) return null;
      if (uploadCache[slug]) return uploadCache[slug];
      const src = path.join(seedDir, `${slug}.jpg`);
      if (!fs.existsSync(src)) return null;
      const id = crypto.randomUUID();
      const fullKey = `full/${ym}/${id}.jpg`;
      const thumbKey = `thumb/${ym}/${id}.jpg`;
      const img = sharp(src).rotate();
      const meta = await img.metadata();
      const w = meta.width ?? 1200;
      const h = meta.height ?? 900;
      const maxDim = 1600;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      await img
        .resize({ width: Math.round(w * scale), height: Math.round(h * scale), fit: "inside" })
        .jpeg({ quality: 82 })
        .toFile(path.join(fullDir, `${id}.jpg`));
      await sharp(src).rotate().resize(700, 700, { fit: "cover", position: "centre" })
        .jpeg({ quality: 80 })
        .toFile(path.join(thumbDir, `${id}.jpg`));
      uploadCache[slug] = { fullKey, thumbKey };
      return uploadCache[slug];
    }

    // listings
    const insertUpload = `INSERT INTO uploads (owner_id, purpose, original_name, mime, size_bytes, full_key, thumb_key, width, height)
      VALUES ($1,'listing',$2,'image/jpeg',0,$3,$4,0,0) RETURNING id`;
    const insertListing = `INSERT INTO listings
      (seller_id, title, description, category, subcategory, condition_code, price_kobo, negotiable,
       quantity, ship_available, meetup_location, is_featured, views, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now() - ($14 || ' days')::interval)
      RETURNING id`;

    for (const l of SEED_LISTINGS) {
      const sellerId = ids[l.seller];
      if (!sellerId) continue;
      const listingR = await client.query(insertListing, [
        sellerId, l.title, l.desc, l.cat, l.sub || null, l.cond, Math.round(l.price * 100),
        !!l.negotiable, l.qty || 1, !!l.ship, l.spot || null, !!l.featured, l.views, l.createdAtDaysAgo,
      ]);
      const listingId = listingR.rows[0].id as string;
      if (l.img) {
        const keys = await ensureSeedPhoto(l.img);
        if (keys) {
          const upR = await client.query(insertUpload, [sellerId, `${l.img}.jpg`, keys.fullKey, keys.thumbKey]);
          await client.query(
            `INSERT INTO listing_images (listing_id, upload_id, position) VALUES ($1,$2,0)`,
            [listingId, upR.rows[0].id],
          );
          await client.query(`UPDATE uploads SET attached = TRUE WHERE id = $1`, [upR.rows[0].id]);
        }
      }
    }

    // events + RSVPs
    const insertEvent = `INSERT INTO events
      (org_id, title, description, category, starts_at, ends_at, venue, university_code, capacity, price_kobo, poster_url)
      VALUES ($1,$2,$3,$4, now() + ($5 || ' days')::interval, now() + ($5 || ' days')::interval + ($6 || ' hours')::interval,
              $7,$8,$9,$10,$11) RETURNING id`;
    const eventIds: string[] = [];
    for (const ev of SEED_EVENTS) {
      const orgId = ids[ev.org];
      if (!orgId) continue;
      const r = await client.query(insertEvent, [
        orgId, ev.title, ev.desc, ev.cat, ev.daysFromNow, ev.durationHrs, ev.venue,
        ev.org === "jci" ? "UNILAG" : "UNILAG", ev.capacity || null, Math.round((ev.priceN || 0) * 100),
        ev.poster || null,
      ]);
      eventIds.push(r.rows[0].id as string);
      // some rsvps
      const rsvpUsers = SEED_USERS.slice(0, 6 + (ev.capacity ? 12 : 3));
      for (const u of rsvpUsers) {
        const uid = ids[u.key];
        if (uid) await client.query(`INSERT INTO event_rsvps (event_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [r.rows[0].id, uid]);
      }
    }

    // favorites + conversations for realism
    const favPairs: [string, number][] = [["tunde", 5], ["chiamaka", 2], ["seun", 7]];
    for (const [ukey, idx] of favPairs) {
      const sellerId = ids[ukey];
      const listing = await client.query(
        `SELECT id FROM listings WHERE status = 'active' AND seller_id <> $1 ORDER BY created_at LIMIT 1 OFFSET $2`,
        [sellerId, idx]);
      if (listing.rows[0]) {
        await client.query(`INSERT INTO favorites (user_id, listing_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [sellerId, listing.rows[0].id]);
      }
    }

    await client.query("COMMIT");
    logger.info(`Seeded: ${SEED_USERS.length + ORGS.length + 1} users, ${SEED_LISTINGS.length} listings, ${eventIds.length} events. Demo login: tunde@ojax.demo / ${DEMO_PASSWORD}`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/** Called at boot — only seed once per database. */
export async function ensureSeed() {
  const r = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM users WHERE email LIKE '%@ojax.demo'`);
  if (Number(r?.count ?? 0) > 0) return;
  await seedRun();
}

// CLI: tsx src/db/seed.ts [--reset]
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url);
if (isMain) {
  (async () => {
    if (process.argv.includes("--reset")) {
      const { migrate } = await import("./migrate.js");
      await migrate({ fresh: true });
    }
    await seedRun();
    process.exit(0);
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

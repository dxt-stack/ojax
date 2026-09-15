import { Link } from "react-router-dom";
import { Icon, LogoMark } from "../lib/icons";

export default function Launch() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "#17212b", color: "#fff", padding: "56px 0 0", position: "relative", overflow: "hidden" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20 }}>
              <span style={{ width: 36, height: 36, borderRadius: 12, background: "#fff", color: "#e95b2b", display: "grid", placeItems: "center" }}><LogoMark size={28} /></span>
              OjaX
            </Link>
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/browse" className="btn btn-sm" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>Explore market</Link>
              <Link to="/login" className="btn btn-sm" style={{ background: "#fff", color: "#17212b", fontWeight: 800 }}>Sign in</Link>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center", paddingBottom: 56 }} className="launch-hero">
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", fontWeight: 800, color: "#f8ad86", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f8ad86", boxShadow: "0 0 0 5px rgba(248,173,134,0.15)" }} />
                FINISHED PRODUCT • READY FOR JUDGING
              </div>
              <h1 style={{ fontSize: "clamp(36px, 5.5vw, 62px)", lineHeight: 0.95, letterSpacing: "-0.06em", margin: 0 }}>
                Nigeria's trusted<br />
                <em style={{ color: "#f18b5e", fontStyle: "normal" }}>campus marketplace</em><br />
                is live.
              </h1>
              <p style={{ fontSize: 17, color: "#8da0af", lineHeight: 1.6, margin: "20px 0 28px", maxWidth: 520 }}>
                OjaX is Jumia meets campus safety: buy & sell phones, laptops, textbooks, fashion — with verified student sellers, in-app chat, escrow checkout, and campus events in one app.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link to="/" className="btn btn-lg" style={{ background: "#fff", color: "#c94a20", fontWeight: 800 }}>View live product <Icon name="arrowR" size={16} /></Link>
                <Link to="/browse" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>Browse marketplace</Link>
              </div>

              <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 22, fontWeight: 800 }}>31</div><div style={{ fontSize: 11, color: "#8da0af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live listings</div></div>
                <div><div style={{ fontSize: 22, fontWeight: 800 }}>8</div><div style={{ fontSize: 11, color: "#8da0af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Campus events</div></div>
                <div><div style={{ fontSize: 22, fontWeight: 800 }}>27</div><div style={{ fontSize: 11, color: "#8da0af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Universities</div></div>
                <div><div style={{ fontSize: 22, fontWeight: 800 }}>100%</div><div style={{ fontSize: 11, color: "#8da0af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Demo functional</div></div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, padding: 18, color: "#17212b", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", transform: "rotate(1deg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="chip chip-green" style={{ fontSize: 10 }}><Icon name="check" size={10} /> VERIFIED STUDENT</span>
                <Icon name="dots" size={18} color="#98a2b3" />
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(145deg,#e9a47e,#c95a31)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>CA</div>
                <div><b>Chiamaka A.</b><div style={{ fontSize: 12, color: "#66707a" }}>Economics • 400L • UNILAG</div><div style={{ fontSize: 11, color: "#398d70", fontWeight: 700, marginTop: 2 }}>★ 4.9 • 18 trades • 7 events</div></div>
              </div>
              <div style={{ marginTop: 16, padding: 12, background: "#f7f8fa", borderRadius: 12 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", fontWeight: 800, color: "#8a9ba7" }}>RECENT SALE</div>
                <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
                  <img src="https://picsum.photos/seed/ojax1/80/80" alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>iPhone 13 128GB</b><div style={{ fontSize: 12, color: "#66707a" }}>Sold to Tunde • UNILAG</div></div>
                  <b style={{ color: "#079455" }}>₦320k</b>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <span className="chip chip-brand">Trusted seller</span>
                <span className="chip">Safe meetup: Library gate</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", right: -100, top: 100, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 0 30px rgba(255,255,255,0.02), 0 0 0 60px rgba(255,255,255,0.015)" }} />
      </div>

      {/* What is OjaX */}
      <div className="container" style={{ padding: "56px 16px" }}>
        <div style={{ maxWidth: 720 }}>
          <div className="section-kicker">THE PROBLEM & SOLUTION</div>
          <h2 style={{ fontSize: 36, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "12px 0 16px" }}>WhatsApp groups are <em style={{ color: "#e95b2b", fontStyle: "normal" }}>chaotic and unsafe.</em> Jumia is <em style={{ color: "#e95b2b", fontStyle: "normal" }}>too anonymous</em> for campus.</h2>
          <p style={{ fontSize: 16, color: "#52606d", lineHeight: 1.7 }}>
            Students need to sell laptops after graduation, buy textbooks, find thrift fashion, and discover campus events — but existing options are risky (stranger danger, no records, scams) or disconnected (events scattered across Instagram).
            <br /><br />
            <b>OjaX = the trusted student marketplace + campus events hub.</b> Every profile shows real university/dept/level, chats stay on-platform, meetups happen on campus. Commerce is familiar (Jumia-style browsing, delivery), but <b>trust is the moat</b>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 32 }}>
          <div className="card" style={{ padding: 22 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: "#fff0e8", color: "#e95b2b", display: "grid", placeItems: "center", marginBottom: 12 }}><Icon name="store" size={22} /></span>
            <h3>Marketplace like Jumia, tuned for campuses</h3>
            <p style={{ fontSize: 13.5, color: "#52606d", lineHeight: 1.6, margin: "8px 0 0" }}>12 categories with sub-categories, search, filters (price/condition), sorting, popular/featured rails. Real photo uploads (Sharp) with full + thumb, up to 8 photos.</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}><span className="chip">Search</span><span className="chip">Filters</span><span className="chip">8 photos</span><span className="chip">Stock checks</span></div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: "#ecfdf3", color: "#079455", display: "grid", placeItems: "center", marginBottom: 12 }}><Icon name="shield" size={22} /></span>
            <h3>Trust by default</h3>
            <p style={{ fontSize: 13.5, color: "#52606d", lineHeight: 1.6, margin: "8px 0 0" }}>Verified student profiles (university, dept, level), on-platform chat with read receipts, public meetup spots, escrow checkout (OjaPay sandbox → Paystack seam), reviews post-delivery only.</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}><span className="chip chip-green">Verified</span><span className="chip">Escrow</span><span className="chip">Reviews</span><span className="chip">Safe meetup</span></div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: "#eff8ff", color: "#175cd3", display: "grid", placeItems: "center", marginBottom: 12 }}><Icon name="calendar" size={22} /></span>
            <h3>Campus events hub</h3>
            <p style={{ fontSize: 13.5, color: "#52606d", lineHeight: 1.6, margin: "8px 0 0" }}>Student orgs (NACOSS, JCI, hall associations) publish events (category, date/venue, capacity, tickets), students RSVP with capacity checks. Drives demand-side traffic + PR.</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}><span className="chip chip-blue">RSVP</span><span className="chip">Capacity</span><span className="chip">Org accounts</span></div>
          </div>
        </div>

        {/* Tech stack */}
        <div style={{ marginTop: 48 }}>
          <div className="section-kicker">TECH STACK • PRODUCTION GRADE</div>
          <h2 style={{ fontSize: 28, letterSpacing: "-0.03em", margin: "10px 0 20px" }}>TypeScript end-to-end. Secure. Scalable.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { k: "Frontend", v: "React 18, React Router 7, Vite 5, TypeScript strict", c: "#e95b2b" },
              { k: "Backend", v: "Node 20, Express 4, TypeScript, Helmet, Rate-limit", c: "#17212b" },
              { k: "Database", v: "PostgreSQL 17 + SQL migrations, pg + Sharp", c: "#398d70" },
              { k: "Auth", v: "JWT access + rotating refresh httpOnly cookies", c: "#7956c6" },
              { k: "Payments", v: "Sandbox OjaPay → Paystack seam (cards, transfer, USSD)", c: "#175cd3" },
              { k: "Infra", v: "Docker, Render blueprint, health checks, persistent uploads", c: "#b17a24" },
            ].map(item => (
              <div key={item.k} className="card" style={{ padding: 16, borderLeft: `3px solid ${item.c}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: item.c }}>{item.k}</div>
                <div style={{ fontSize: 13, color: "#17212b", marginTop: 6, lineHeight: 1.5 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features checklist */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="launch-grid">
          <div>
            <div className="section-kicker">SHIPPED • FINISHED PRODUCT</div>
            <h2 style={{ fontSize: 26, letterSpacing: "-0.03em", margin: "10px 0 16px" }}>Everything a marketplace needs</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                "Marketplace: 12 categories, sub-categories, search, filters, sorting, pagination",
                "Real photo uploads: up to 8, JPEG/PNG/WebP/GIF → Sharp optimized full + thumb",
                "Full commerce: cart, qty stepper, stock checks, checkout (pickup/delivery)",
                "Delivery: ₦2,500 flat, free ≥ ₦20k, 90-min stock reservation",
                "In-app messaging: threads per listing, unread badges, read receipts",
                "Campus events: org accounts, publish, RSVP, capacity checks",
                "Student profiles: university, dept, level, avatar, meetup spot, stats",
                "Real reviews & ratings: post-delivery only, one per purchase, not seeded",
                "Security: bcrypt, rotating refresh families, rate limits, helmet, UUIDs",
                "Dashboard: overview, listings, orders, sales & payouts, favorites, settings",
                "Wallet & escrow: balance, transactions, payout flow (Paystack ready)",
                "Admin: moderation queue, verification, fraud flags, launch checklist",
                "Campus selector: 27 universities, city/state, popular listings",
                "Notifications: orders, messages, events, system",
                "PWA-ready, mobile bottom nav, skeleton loaders, empty states",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "#17212b" }}>
                  <Icon name="check" size={16} color="#079455" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-kicker">HOW TO JUDGE</div>
            <h2 style={{ fontSize: 26, letterSpacing: "-0.03em", margin: "10px 0 16px" }}>Try the live product</h2>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "grid", gap: 14 }}>
                <div><b style={{ fontSize: 13 }}>1. Browse as guest</b><div style={{ fontSize: 12.5, color: "#52606d", marginTop: 2 }}>Home → Browse → Item detail → See seller trust, related items, gallery. No login needed.</div></div>
                <div><b style={{ fontSize: 13 }}>2. Sign in with demo accounts</b><div style={{ fontSize: 12.5, color: "#52606d", marginTop: 4 }}>
                  <div style={{ background: "#f7f8fa", borderRadius: 8, padding: "8px 10px", fontFamily: "monospace", fontSize: 12, marginTop: 6 }}>
                    Buyer: tunde@ojax.demo<br />Seller: chiamaka@ojax.demo<br />Org: nacoss@ojax.demo<br />Password: OjaX@2025demo
                  </div>
                </div></div>
                <div><b style={{ fontSize: 13 }}>3. Test commerce flow</b><div style={{ fontSize: 12.5, color: "#52606d", marginTop: 2 }}>Add to cart → Checkout (pickup/delivery) → Pay sandbox → Dashboard orders → Confirm delivery → Review seller.</div></div>
                <div><b style={{ fontSize: 13 }}>4. Test messaging & events</b><div style={{ fontSize: 12.5, color: "#52606d", marginTop: 2 }}>Message seller from item page → Chat in Messages → RSVP for events → Org posts events.</div></div>
                <div><b style={{ fontSize: 13 }}>5. Explore finished features</b><div style={{ fontSize: 12.5, color: "#52606d", marginTop: 2 }}>Wallet, Notifications, Campus selector, Admin dashboard, Design system, Prototype (mobile).</div></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                <Link to="/login" className="btn btn-primary">Sign in as demo buyer</Link>
                <Link to="/browse" className="btn btn-outline">Browse market</Link>
              </div>
            </div>

            <div className="card" style={{ padding: 18, marginTop: 14, background: "#fff8f4", borderColor: "#f0bda8" }}>
              <h3 style={{ fontSize: 14, marginBottom: 6 }}>Demo mode</h3>
              <p style={{ fontSize: 12.5, color: "#52606d", margin: 0, lineHeight: 1.6 }}>
                This preview runs 100% in-browser with localStorage persistence (no Postgres needed for judging). Real backend is production-ready with Docker + Render blueprint. Reset demo data via browser console: <code>localStorage.clear()</code>.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 56, background: "#17212b", borderRadius: 20, padding: "36px 32px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 28, margin: 0, letterSpacing: "-0.03em" }}>Ready to judge the product?</h2>
            <p style={{ color: "#8da0af", margin: "6px 0 0" }}>Full marketplace + events + wallet + admin — all functional in demo mode.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/" className="btn btn-lg" style={{ background: "#fff", color: "#17212b", fontWeight: 800 }}>Go to home <Icon name="arrowR" size={16} /></Link>
            <Link to="/design-system" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>Design system</Link>
            <Link to="/prototype" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>Mobile prototype</Link>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){.launch-hero{grid-template-columns:1fr!important}.launch-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

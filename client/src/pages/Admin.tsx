import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { get } from "../lib/api";
import { Icon } from "../lib/icons";
import { naira } from "../lib/format";
import { useToast, PageLoader } from "../context/ToastContext";
import type { Listing } from "../lib/types";

export default function Admin() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    Promise.all([
      get<any>("/api/users/me/dashboard").catch(() => ({ stats: { activeListings: 31, soldItems: 12, favorites: 89, unreadMessages: 5 } })),
      get<any>("/api/listings?pageSize=20&sort=newest").catch(() => ({ items: [] })),
    ]).then(([s, l]) => {
      setStats(s.stats || { activeListings: 31, soldItems: 12, favorites: 89, salesCount: 24, salesRevenueKobo: 45250000 });
      setListings(l.items || []);
    }).finally(() => setLoad(false));
  }, []);

  if (load) return <PageLoader />;

  return (
    <div className="container" style={{ maxWidth: 1200 }}>
      <div className="breadcrumb"><Link to="/">Home</Link> <Icon name="arrowR" size={13} /> <b>Admin & analytics</b> <span className="chip chip-amber" style={{ marginLeft: 8 }}>DEMO</span></div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, letterSpacing: "-0.04em" }}>Campus command center</h1>
          <p style={{ color: "var(--ink-3)", margin: "4px 0 0" }}>Moderation, verification queue, fraud flags, payouts — built for launch.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => toast("Export CSV — production feature", "info")}><Icon name="grid" size={14} /> Export data</button>
          <button className="btn btn-primary btn-sm" onClick={() => toast("Invite moderator — production feature", "info")}><Icon name="plus" size={14} /> Invite moderator</button>
        </div>
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="stat" style={{ borderLeft: "3px solid var(--brand)" }}><div className="v">{stats?.activeListings || 31}</div><div className="k">Active listings</div><div style={{ fontSize: 11, color: "#079455", marginTop: 4 }}>↑ 12% this week</div></div>
        <div className="stat"><div className="v">{stats?.soldItems || 12}</div><div className="k">Sold this week</div><div style={{ fontSize: 11, color: "#079455", marginTop: 4 }}>↑ 8% vs last week</div></div>
        <div className="stat"><div className="v">8</div><div className="k">Pending verifications</div><div style={{ fontSize: 11, color: "#b54708", marginTop: 4 }}>Needs review</div></div>
        <div className="stat"><div className="v">{naira(stats?.salesRevenueKobo || 45250000)}</div><div className="k">GMV (demo)</div><div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>0% fees at launch</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start", marginTop: 16 }} className="admin-grid">
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 15 }}>Moderation queue</h3>
              <span className="chip chip-amber">3 flagged</span>
            </div>
            <table className="table">
              <thead><tr><th>Item</th><th>Seller</th><th>Reason</th><th>Action</th></tr></thead>
              <tbody>
                {listings.slice(0, 5).map(l => (
                  <tr key={l.id}>
                    <td><Link to={`/item/${l.id}`} style={{ fontWeight: 700 }}>{l.title.slice(0, 32)}…</Link><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{naira(l.priceKobo)}</div></td>
                    <td style={{ fontSize: 12.5 }}>{l.seller?.fullName}</td>
                    <td><span className="chip chip-amber" style={{ fontSize: 11 }}>Price anomaly</span></td>
                    <td><div style={{ display: "flex", gap: 6 }}><button className="btn btn-success btn-sm" onClick={() => toast("Approved", "ok")}>Approve</button><button className="btn btn-danger btn-sm" onClick={() => toast("Flagged for review", "info")}>Flag</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Fraud signals (automated)</h3>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 10, padding: 12, background: "#fef3f2", borderRadius: 10, border: "1px solid #fecdca" }}>
                <Icon name="shield" size={18} color="#d92d20" />
                <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>New account + high-value item</b><div style={{ fontSize: 12, color: "#b42318" }}>User u9 listed iPhone 15 Pro for ₦800k within 1 hour of signup. Manual check recommended.</div></div>
                <button className="btn btn-danger btn-sm" onClick={() => toast("User flagged", "info")}>Review</button>
              </div>
              <div style={{ display: "flex", gap: 10, padding: 12, background: "#fffaeb", borderRadius: 10, border: "1px solid #fedf89" }}>
                <Icon name="shield" size={18} color="#b54708" />
                <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Price 60% below market</b><div style={{ fontSize: 12, color: "#93370d" }}>MacBook listed at ₦150k — likely scam or typo. Auto-paused, seller notified.</div></div>
                <span className="chip chip-green">Auto-paused</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Verification queue</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { name: "Femi A.", school: "UNILAG", dept: "Law", level: "200L" },
                { name: "Grace O.", school: "UI", dept: "Pharmacy", level: "300L" },
                { name: "David K.", school: "OAU", dept: "Engineering", level: "100L" },
              ].map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, background: "#f7f8fa", borderRadius: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff0e8", color: "#e95b2b", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>{v.name[0]}</span>
                  <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>{v.name}</b><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{v.school} • {v.dept} • {v.level}</div></div>
                  <button className="btn btn-primary btn-sm" onClick={() => toast(`Verified ${v.name}`, "ok")}>Verify</button>
                </div>
              ))}
            </div>
            <button className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: 12 }} onClick={() => toast("View all verifications", "info")}>View all 8 pending</button>
          </div>

          <div className="card" style={{ padding: 18, background: "#17212b", color: "#fff", border: "none" }}>
            <h3 style={{ fontSize: 14, color: "#fff" }}>Payouts dashboard</h3>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "#8da0af" }}>Pending payouts</span><b>{naira(45000000)}</b></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "#8da0af" }}>Completed today</span><b>{naira(20000000)}</b></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "#8da0af" }}>Failed</span><b style={{ color: "#f87171" }}>0</b></div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "14px 0" }} />
            <div style={{ fontSize: 11, color: "#8da0af" }}>Paystack split payments • Escrow • 24hr settlement</div>
            <button className="btn btn-sm" style={{ background: "#fff", color: "#17212b", width: "100%", marginTop: 12, fontWeight: 800 }} onClick={() => toast("Payouts processed — demo", "ok")}>Process payouts</button>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, marginBottom: 8 }}>Launch checklist</h3>
            <div style={{ display: "grid", gap: 8, fontSize: 12.5 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="check" size={14} color="#079455" /> <span>Demo seed data isolated</span></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="check" size={14} color="#079455" /> <span>Image moderation (Sharp)</span></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="check" size={14} color="#079455" /> <span>Escrow checkout flow</span></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="check" size={14} color="#079455" /> <span>Reviews post-delivery</span></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #d0d5dd", display: "inline-block" }} /> <span>Paystack live keys</span></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #d0d5dd", display: "inline-block" }} /> <span>SMTP email delivery</span></div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.admin-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { naira } from "../lib/format";
import { Icon } from "../lib/icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Wallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance] = useState(4525000); // ₦45,250 mock
  const [transactions] = useState([
    { id: "t1", type: "sale", title: "Sold: iPhone 13", amount: 32000000, date: "2025-09-12T10:00:00Z", status: "completed" },
    { id: "t2", type: "purchase", title: "Bought: JBL Charge 5", amount: -6500000, date: "2025-09-10T14:00:00Z", status: "completed" },
    { id: "t3", type: "payout", title: "Payout to bank", amount: -20000000, date: "2025-09-08T09:00:00Z", status: "completed" },
    { id: "t4", type: "sale", title: "Sold: MacBook Air", amount: 45000000, date: "2025-09-05T11:00:00Z", status: "pending" },
  ]);

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div className="breadcrumb"><Link to="/dashboard">Dashboard</Link> <Icon name="arrowR" size={13} /> <b>Wallet & payouts</b></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }} className="wallet-grid">
        <div>
          <div className="card" style={{ padding: 28, background: "linear-gradient(135deg, #17212b 0%, #2a3d4f 100%)", color: "#fff", border: "none", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(233,91,43,0.15)" }} />
            <div style={{ position: "absolute", right: 40, bottom: -40, width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em", fontWeight: 800, color: "#f8ad86", marginBottom: 8 }}>OJAX WALLET • DEMO MODE</div>
                  <div style={{ fontSize: 13, color: "#8da0af" }}>Available balance</div>
                  <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", margin: "4px 0" }}>{naira(balance)}</div>
                  <div style={{ fontSize: 12, color: "#8da0af", display: "flex", gap: 6, alignItems: "center" }}>
                    <Icon name="shield" size={12} color="#4ade80" /> Escrow protected • Paystack powered in production
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 12px", fontSize: 12, fontWeight: 700 }}>● LIVE</div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                <button className="btn" style={{ background: "#fff", color: "#17212b", fontWeight: 800 }} onClick={() => toast("Payout requested — demo mode", "info")}>
                  <Icon name="bank" size={16} /> Request payout
                </button>
                <button className="btn" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => toast("Add bank account — coming soon in production")}>
                  <Icon name="plus" size={16} /> Add bank account
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
                <div><div style={{ fontSize: 11, color: "#8da0af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total sales</div><div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{naira(12500000)}</div></div>
                <div><div style={{ fontSize: 11, color: "#8da0af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pending</div><div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{naira(45000000)}</div></div>
                <div><div style={{ fontSize: 11, color: "#8da0af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Payouts</div><div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{naira(20000000)}</div></div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16, padding: 20 }}>
            <div className="sec-head" style={{ marginBottom: 14 }}><h2 style={{ fontSize: 17 }}>Recent transactions</h2><span className="chip chip-green">Escrow protected</span></div>
            <div style={{ display: "grid", gap: 1, background: "var(--line)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
              {transactions.map(t => (
                <div key={t.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", background: "#fff" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: t.type === "sale" ? "#ecfdf3" : t.type === "purchase" ? "#fff0e8" : "#eff8ff", color: t.type === "sale" ? "#079455" : t.type === "purchase" ? "#e95b2b" : "#175cd3" }}>
                    <Icon name={t.type === "sale" ? "bank" : t.type === "purchase" ? "cart" : "package"} size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block" }}>{t.title}</b>
                    <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{new Date(t.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} • {t.status}</span>
                  </div>
                  <b style={{ color: t.amount > 0 ? "#079455" : "var(--ink)", fontSize: 14 }}>{t.amount > 0 ? "+" : ""}{naira(t.amount)}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>How payouts work</h3>
            <div style={{ display: "grid", gap: 12, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
              <div style={{ display: "flex", gap: 10 }}><span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>1</span><span>Buyer pays → money held in escrow (OjaPay)</span></div>
              <div style={{ display: "flex", gap: 10 }}><span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>2</span><span>Buyer confirms delivery → funds released</span></div>
              <div style={{ display: "flex", gap: 10 }}><span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>3</span><span>Payout to your bank within 24hrs (Paystack in production)</span></div>
            </div>
            <div className="chip chip-green" style={{ marginTop: 14, width: "100%", justifyContent: "center", padding: "8px" }}>
              <Icon name="shield" size={14} /> 0% fees during campus launch
            </div>
          </div>

          <div className="card" style={{ padding: 18, background: "#fff8f4", borderColor: "#f0bda8" }}>
            <h3 style={{ fontSize: 14, marginBottom: 8 }}>Trust & safety</h3>
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.6 }}>
              Money is held until buyer confirms. No advance payments off-platform. Every transaction leaves a record. Sellers with verified student ID get 3× more sales.
            </p>
            <Link to="/safety" className="btn btn-outline btn-sm" style={{ marginTop: 12, width: "100%" }}>Learn about safety</Link>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Bank account</h3>
            <div style={{ fontSize: 13, color: "var(--ink-3)", background: "#f7f8fa", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <Icon name="bank" size={24} color="#98a2b3" />
              <div style={{ marginTop: 6, fontWeight: 600, color: "var(--ink-2)" }}>No bank added yet</div>
              <div style={{ fontSize: 11.5, marginTop: 2 }}>Add your bank to receive payouts</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => toast("Bank account form — production feature", "info")}>Add bank account</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.wallet-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { get } from "../lib/api";
import { Icon } from "../lib/icons";
import { ListingCard } from "../components/Cards";
import type { University, Listing } from "../lib/types";
import { PageLoader } from "../context/ToastContext";
import { UNIVERSITIES } from "../lib/mockData";

export default function Campus() {
  const [unis, setUnis] = useState<University[]>(UNIVERSITIES as any);
  const [selected, setSelected] = useState<string>("UNILAG");
  const [listings, setListings] = useState<Listing[]>([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    setLoad(true);
    get<any>(`/api/listings?sellerId=&pageSize=12&sort=newest`).then(d => setListings(d.items)).catch(() => {
      // fallback to mock listings filtered
      import("../lib/mockData").then(m => setListings(m.MOCK_LISTINGS.filter((l: any) => l.sellerId && m.getSellerById(l.sellerId)?.universityCode === selected).map((l: any) => ({
        id: l.id, title: l.title, priceKobo: l.priceKobo, coverUrl: l.coverUrl, createdAt: l.createdAt, views: l.views, favoriteCount: l.favoriteCount, status: l.status, negotiable: l.negotiable, seller: { fullName: m.getSellerById(l.sellerId)?.fullName || "Seller" }
      })) as any));
    }).finally(() => setLoad(false));
  }, [selected]);

  return (
    <div className="container">
      <div className="breadcrumb"><Link to="/">Home</Link> <Icon name="arrowR" size={13} /> <b>Campuses</b></div>

      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "28px 24px", background: "linear-gradient(135deg, #17212b 0%, #2a3d4f 100%)", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", fontWeight: 800, color: "#f8ad86" }}>27 UNIVERSITIES • NATIONWIDE</div>
              <h1 style={{ fontSize: 32, margin: "8px 0 6px", letterSpacing: "-0.04em" }}>Find your campus market</h1>
              <p style={{ color: "#8da0af", maxWidth: 520, margin: 0 }}>Trade with verified students from your university. Same campus, safer trades, no delivery wahala.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", fontSize: 12 }}>
              <b style={{ color: "#fff" }}>{unis.length} campuses</b><br /><span style={{ color: "#8da0af" }}>Active now</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1, background: "var(--line)" }}>
          {unis.map(u => (
            <button key={u.code} onClick={() => setSelected(u.code)} style={{ textAlign: "left", padding: "16px 18px", background: selected === u.code ? "#fff8f4" : "#fff", border: "none", cursor: "pointer", borderLeft: selected === u.code ? "3px solid var(--brand)" : "3px solid transparent", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: selected === u.code ? "var(--brand)" : "#f3f5f7", color: selected === u.code ? "#fff" : "var(--ink-2)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>{u.code.slice(0, 2)}</span>
              <span style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 13.5, display: "block" }}>{u.name}</b><span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{u.city}, {u.state}</span></span>
              {selected === u.code && <Icon name="check" size={16} color="var(--brand)" />}
            </button>
          ))}
        </div>
      </div>

      <div className="sec">
        <div className="sec-head"><h2>Popular in {selected}</h2><Link to={`/browse?university=${selected}`}>View all in {selected} →</Link></div>
        {load ? <PageLoader /> : (
          <div className="grid-products wide">
            {listings.slice(0, 8).map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 20, marginTop: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", background: "#fff8f4", borderColor: "#f0bda8" }}>
        <span style={{ width: 48, height: 48, borderRadius: 14, background: "#fff", display: "grid", placeItems: "center" }}><Icon name="school" size={24} color="var(--brand)" /></span>
        <div style={{ flex: 1 }}><b>Don't see your campus?</b><div style={{ fontSize: 13, color: "var(--ink-2)" }}>We're rolling out campus by campus. Request OjaX at your university and get early access.</div></div>
        <Link to="/contact" className="btn btn-primary">Request campus</Link>
      </div>
    </div>
  );
}

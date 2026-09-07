import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api, del, get, patch, post } from "../lib/api";
import type { EventItem, Listing, Order, OrderItem, Page, University, User } from "../lib/types";
import { fmtDateTime, naira, timeAgo } from "../lib/format";
import { Icon } from "../lib/icons";
import { useAuth } from "../context/AuthContext";
import { useToast, ErrBox, PageLoader, Empty } from "../context/ToastContext";
import { Avatar } from "../components/Layout";
import { universities } from "../lib/meta";
import { Stars } from "../components/Stars";

interface Stats {
  activeListings: number; soldItems: number; favorites: number; unreadMessages: number;
  cartItems: number; salesCount: number; salesRevenueKobo: number;
}

const TABS = [
  ["overview", "grid", "Overview"],
  ["listings", "store", "My listings"],
  ["orders", "package", "Orders I've placed"],
  ["sales", "bank", "Sales & payouts"],
  ["favorites", "heart", "Saved items"],
  ["events", "calendar", "Events (org)"],
  ["settings", "user", "Profile & settings"],
] as const;

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const loc = useLocation();
  const [sp] = useSearchParams();
  const { toast } = useToast();
  const nav = useNavigate();
  const isSettings = loc.pathname.startsWith("/settings");
  const isOrgPage = loc.pathname.startsWith("/org");
  const [tab, setTabRaw] = useState(isSettings ? "settings" : isOrgPage ? "events" : (sp.get("tab") || "overview"));

  useEffect(() => {
    const t = isSettings ? "settings" : isOrgPage ? "events" : sp.get("tab") || "overview";
    setTabRaw(t);
  }, [sp, isSettings, isOrgPage]);

  return (
    <div className="container" style={{ maxWidth: 1120 }}>
      <div className="breadcrumb"><span>Home</span> <Icon name="arrowR" size={13} /> <b>Dashboard</b></div>
      <div className="dash-grid">
        <div>
          <div className="card" style={{ padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <Avatar name={user!.fullName} url={user!.avatarUrl} size={48} />
              <div style={{ minWidth: 0 }}>
                <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user!.fullName}</b>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{user!.isOrg ? user!.orgName || "Organisation" : `${user!.universityCode || "Campus"} · ${user!.level || ""}`}</span>
              </div>
            </div>
          </div>
          <nav className="dash-nav">
            {TABS.map(([code, ic, label]) => (
              (code === "events" && !user!.isOrg) ? null : (
                <a key={code} className={tab === code ? "active" : ""} onClick={() => setTabRaw(code)} role="button">
                  <Icon name={ic} size={17} /> {label}
                </a>
              )
            ))}
            <a role="button" className={tab === "logout" ? "active" : ""} style={{ color: "var(--red)" }}
              onClick={() => { logout().then(() => nav("/")); }}>
              <Icon name="logout" size={17} /> Sign out
            </a>
          </nav>
        </div>
        <div>
          {tab === "overview" && <OverviewTab user={user!} setTab={setTabRaw} />}
          {tab === "listings" && <ListingsTab />}
          {tab === "orders" && <OrdersTab scope="buyer" />}
          {tab === "sales" && <OrdersTab scope="seller" />}
          {tab === "favorites" && <FavList />}
          {tab === "events" && user!.isOrg && <OrgEvents setTab={setTabRaw} />}
          {tab === "settings" && <SettingsTab user={user!} updateUser={updateUser} />}
        </div>
      </div>
    </div>
  );
}

function Stat({ v, k }: { v: string | number; k: string }) {
  return <div className="stat"><div className="v">{v}</div><div className="k">{k}</div></div>;
}

function OverviewTab({ user, setTab }: { user: User; setTab: (t: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    get<{ stats: Stats }>("/api/users/me/dashboard").then((d) => setStats(d.stats)).catch(() => {});
  }, []);
  const s = stats || { activeListings: 0, soldItems: 0, favorites: 0, unreadMessages: 0, cartItems: 0, salesCount: 0, salesRevenueKobo: 0 };
  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 14 }}>Welcome back{user.fullName.split(" ")[0] ? `, ${user.fullName.split(" ")[0]}` : ""} 👋</h1>
      {user.isOrg ? (
        <div className="promo-band" style={{ marginTop: 0 }}>
          <div><h3>Post your next campus event</h3><p>Reach thousands of students — it takes 2 minutes.</p></div>
          <button className="btn" style={{ background: "#fff", color: "var(--brand-strong)" }} onClick={() => setTab("events")}>Manage events</button>
        </div>
      ) : (
        <div className="promo-band" style={{ marginTop: 0 }}>
          <div><h3>Got something to sell?</h3><p>List free and reach every student on your campus.</p></div>
          <Link to="/sell" className="btn" style={{ background: "#fff", color: "var(--brand-strong)" }}>+ Sell now</Link>
        </div>
      )}
      <div className="stat-row">
        <Stat v={s.activeListings} k="Active listings" />
        <Stat v={s.soldItems} k="Items sold" />
        {user.isOrg ? <Stat v={s.salesCount} k="Orders received" /> : <Stat v={s.favorites} k="Saved items" />}
        <Stat v={s.unreadMessages} k="Unread chats" />
      </div>
      <div className="card" style={{ padding: 18 }}>
        <b>Quick actions</b>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setTab("listings")}>Manage listings</button>
          <button className="btn btn-outline btn-sm" onClick={() => setTab("orders")}>My orders</button>
          {!user.isOrg && <button className="btn btn-outline btn-sm" onClick={() => setTab("sales")}>Seller sales</button>}
          <Link to="/messages" className="btn btn-outline btn-sm">Messages</Link>
          <button className="btn btn-outline btn-sm" onClick={() => setTab("settings")}>Edit profile</button>
        </div>
      </div>
    </div>
  );
}

function ListingsTab() {
  const [items, setItems] = useState<Listing[]>([]);
  const [load, setLoad] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const nav = useNavigate();

  const refresh = useCallback(() => {
    setLoad(true);
    get<Page<Listing>>("/api/listings?mine=1&pageSize=48")
      .then((d) => setItems(d.items))
      .catch(() => toast("Failed to load listings", "err"))
      .finally(() => setLoad(false));
  }, [toast]);

  useEffect(refresh, [refresh]);

  const act = async (fn: () => Promise<unknown>, okMsg: string) => {
    try { await fn(); toast(okMsg); refresh(); } catch (e: any) { toast(e.message || "Failed", "err"); }
  };

  const list = filter === "all" ? items : items.filter((l) => l.status === filter);
  const STATUS_LABEL: Record<string, string> = { active: "Live", paused: "Paused", sold: "Sold" };

  if (load) return <PageLoader />;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="sec-head"><h2>My listings ({items.length})</h2><Link to="/sell" className="btn btn-primary btn-sm">+ New item</Link></div>
      <div className="filter-bar">
        {["all", "active", "paused", "sold"].map((k) => (
          <button key={k} className={`chip ${filter === k ? "chip-ink" : ""}`} style={{ border: 0, cursor: "pointer" }} onClick={() => setFilter(k)}>
            {k === "all" ? "All" : STATUS_LABEL[k]}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty icon="store" title="No listings here yet" text="Post your first item — it's free.">
          <Link to="/sell" className="btn btn-primary">Sell an item</Link>
        </Empty>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {list.map((l) => (
            <div key={l.id} className="cart-row" style={{ gridTemplateColumns: "64px 1fr auto", border: "1px solid var(--line)", borderRadius: 14, marginBottom: 0 }}>
              <Link to={`/item/${l.id}`} style={{ width: 64, height: 64, borderRadius: 11, overflow: "hidden", background: "#f2f4f7", display: "grid", placeItems: "center" }}>
                {l.coverUrl ? <img src={l.coverUrl} style={{ width: 64, height: 64, objectFit: "cover" }} alt="" /> : <Icon name="camera" size={20} color="#d0d5dd" />}
              </Link>
              <div style={{ minWidth: 0 }}>
                <Link to={`/item/${l.id}`} style={{ fontWeight: 700, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</Link>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{naira(l.priceKobo)} · {l.views} views · {timeAgo(l.createdAt)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  <span className={`chip ${l.status === "active" ? "chip-green" : l.status === "paused" ? "chip-amber" : "chip-red"}`}>
                    {STATUS_LABEL[l.status] || l.status}
                  </span>
                  {l.status === "active" && <span className="chip">favoriteCount {l.favoriteCount}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {l.status === "active" && <button className="btn btn-success btn-sm" onClick={() => act(() => post(`/api/listings/${l.id}/sold`), "Marked as sold 🎉")}>Sold ✓</button>}
                {l.status === "paused" && <button className="btn btn-outline btn-sm" onClick={() => act(() => post(`/api/listings/${l.id}/activate`), "Republished")}>Activate</button>}
                {l.status === "active" && <button className="btn btn-outline btn-sm" onClick={() => act(() => post(`/api/listings/${l.id}/pause`), "Paused")}>Pause</button>}
                <button className="btn btn-outline btn-sm" onClick={() => nav(`/sell/${l.id}/edit`)}><Icon name="edit" size={14} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("Delete this listing permanently?")) act(() => del(`/api/listings/${l.id}`), "Deleted"); }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab({ scope }: { scope: "buyer" | "seller" }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [load, setLoad] = useState(true);
  const { toast } = useToast();
  const [reviewTarget, setReviewTarget] = useState<{ order: Order; item: OrderItem } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    get<{ orders: Order[] }>(`/api/orders?scope=${scope}`)
      .then((d) => setOrders(d.orders))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [scope]);

  const confirmDelivery = async (o: Order) => {
    if (!confirm(`Confirm you received everything in order ${o.orderNo}?`)) return;
    try { await post(`/api/orders/${o.id}/confirm-delivery`); toast("Order completed 🎉"); setLoad(true);
      get<{ orders: Order[] }>(`/api/orders?scope=${scope}`).then((d) => setOrders(d.orders)).finally(() => setLoad(false));
    } catch (e: any) { toast(e.message, "err"); }
  };

  const cancel = async (o: Order) => {
    if (!confirm("Cancel this order? Any reserved stock returns to the market.")) return;
    try { await post(`/api/orders/${o.id}/cancel`); toast("Order cancelled"); window.location.reload(); } catch (e: any) { toast(e.message, "err"); }
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setReviewing(true);
    try {
      await post(`/api/reviews/order/${reviewTarget.order.id}`, {
        orderItemId: reviewTarget.item.orderItemId,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast("Thanks — review published ⭐");
      setReviewTarget(null);
      setReviewComment("");
      const d = await get<{ orders: Order[] }>(`/api/orders?scope=buyer`);
      setOrders(d.orders);
    } catch (e: any) {
      toast(e.message || "Couldn't publish review", "err");
    } finally {
      setReviewing(false);
    }
  };

  if (load) return <PageLoader />;
  return (
    <div>
      <div className="sec-head"><h2>{scope === "seller" ? "Sales & payouts 💰" : "Orders I've placed"}</h2></div>
      {scope === "seller" && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--ink-2)" }}>
            <Icon name="bank" size={18} color="var(--green)" />
            Payouts: when a buyer confirms delivery, the amount lands in your wallet (demo: auto). Seller fees are 0% at launch.
          </div>
        </div>
      )}
      {orders.length === 0 ? (
        <Empty icon="package" title={scope === "seller" ? "No sales yet" : "No orders yet"} text={scope === "seller" ? "When students buy your items, they'll appear here." : "When you buy something, track it here."} />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {orders.map((o) => {
            const statCls = o.status === "completed" ? "chip-green" : o.status === "cancelled" ? "chip-red" : o.status === "paid" ? "chip-blue" : "chip-amber";
            return (
              <div className="card" key={o.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  <div>
                    <b>{o.orderNo}</b> <span className={`chip ${statCls}`}>{o.status.replace("_", " ")}</span>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{fmtDateTime(o.createdAt)} · {o.fulfilment === "pickup" ? "🤝 Campus pickup" : "🚚 Delivery"}{o.buyerName ? ` · Buyer: ${o.buyerName}` : ""}</div>
                  </div>
                  <b style={{ fontSize: 18 }}>{naira(o.totals.totalKobo)}</b>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {o.items.map((it) => (
                    <div key={it.listingId} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      {it.imageUrl ? <img src={it.imageUrl} alt="" style={{ width: 46, height: 46, borderRadius: 9, objectFit: "cover" }} /> : <span style={{ width: 46, height: 46, borderRadius: 9, background: "#f2f4f7" }} />}
                      <Link to={`/item/${it.listingId}`} style={{ flex: 1, fontSize: 13.5, fontWeight: 600, minWidth: 120 }}>{it.title} × {it.quantity}</Link>
                      <span style={{ fontSize: 13 }}>{naira(it.unitPriceKobo * it.quantity)}</span>
                      {scope === "buyer" && o.status === "completed" && !it.reviewed && (
                        <button className="btn btn-outline btn-sm" onClick={() => { setReviewRating(5); setReviewComment(""); setReviewTarget({ order: o, item: it }); }}>
                          <Icon name="star" size={14} /> Rate seller
                        </button>
                      )}
                      {scope === "buyer" && it.reviewed && <span className="chip chip-green" style={{ fontSize: 11 }}>Reviewed ⭐</span>}
                    </div>
                  ))}
                </div>
                {o.contact?.phone && scope === "buyer" && <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 8 }}>Contact: {o.contact.phone} {o.contact.campusNote ? `· ${o.contact.campusNote}` : ""}</div>}
                {o.contact?.address && scope === "buyer" && <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>Ship to: {o.contact.address}</div>}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}>
                  {scope === "buyer" && (o.status === "paid" || o.status === "processing") && (
                    <button className="btn btn-success btn-sm" onClick={() => confirmDelivery(o)}><Icon name="check" size={14} /> Confirm delivery</button>
                  )}
                  {scope === "buyer" && o.status === "pending_payment" && (
                    <button className="btn btn-primary btn-sm" onClick={() => (window.location.href = "/checkout")}>Complete payment</button>
                  )}
                  {(scope === "buyer" && ["pending_payment", "paid", "processing"].includes(o.status)) && (
                    <button className="btn btn-outline btn-sm" onClick={() => cancel(o)}>Cancel order</button>
                  )}
                  {scope === "seller" && o.status === "paid" && (
                    <span className="chip chip-amber">⏳ Awaiting buyer pickup/delivery confirmation</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <div className="modal-backdrop" onClick={() => setReviewTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setReviewTarget(null)}>✕</button>
            <h3>Rate this seller ⭐</h3>
            <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: "2px 0 14px" }}>
              About your purchase: <b>{reviewTarget.item.title}</b> — order {reviewTarget.order.orderNo}
            </p>
            <div style={{ textAlign: "center", margin: "8px 0 14px" }}>
              <Stars value={reviewRating} onChange={setReviewRating} size={34} />
            </div>
            <div className="field">
              <label>Comment (optional)</label>
              <textarea className="textarea" rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="How was the item, communication and meetup? Real reviews build the campus community." maxLength={1000} />
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 0 }}>
              🛡️ Reviews appear on the seller's public profile and can't be edited — they're tied to verified, delivered purchases.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setReviewTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitReview} disabled={reviewing}>
                {reviewing ? "Publishing…" : "Publish review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FavList() {
  const [items, setItems] = useState<any[]>([]);
  const [load, setLoad] = useState(true);
  useEffect(() => {
    get<Page<Listing>>("/api/listings?favorites=1")
      .then((d) => setItems(d.items as any))
      .finally(() => setLoad(false));
  }, []);
  if (load) return <PageLoader />;
  return (
    <div>
      <div className="sec-head"><h2>Saved items ❤️ ({items.length})</h2></div>
      {items.length === 0 ? (
        <Empty icon="heart" title="Nothing saved yet" text="Tap the ♥ on any item to save it here.">
          <Link to="/browse" className="btn btn-primary">Browse the market</Link>
        </Empty>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((l) => (
            <Link to={`/item/${l.id}`} key={l.id} className="cart-row" style={{ gridTemplateColumns: "64px 1fr auto", border: "1px solid var(--line)", borderRadius: 14 }}>
              <span style={{ width: 64, height: 64, borderRadius: 11, overflow: "hidden", background: "#f2f4f7", display: "grid", placeItems: "center" }}>
                {l.coverUrl ? <img src={l.coverUrl} style={{ width: 64, height: 64, objectFit: "cover" }} alt="" /> : <Icon name="camera" size={20} color="#d0d5dd" />}
              </span>
              <span style={{ minWidth: 0 }}>
                <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</b>
                <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{naira(l.priceKobo)}{l.status !== "active" ? ` · ${l.status}` : ""}</span>
              </span>
              <b>{naira(l.priceKobo)}</b>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OrgEvents({ setTab }: { setTab: (t: string) => void }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [load, setLoad] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const [f, setF] = useState({
    title: "", description: "", category: "socials", venue: "", startsAt: "", endsAt: "",
    universityCode: "UNILAG", city: "Lagos", capacity: "", price: "", posterUrl: "", onlineUrl: "",
  });
  const [cats, setCats] = useState<{ code: string; label: string }[]>([]);

  useEffect(() => {
    get<{ items: EventItem[] }>("/api/events?mine=1")
      .then((d) => setEvents(d.items))
      .finally(() => setLoad(false));
    get<{ eventCategories: { code: string; label: string }[] }>("/api/meta/catalog")
      .then((d) => setCats(d.eventCategories))
      .catch(() => {});
  }, []);

  const publish = async () => {
    setBusy(true);
    try {
      await post("/api/events", {
        ...f,
        capacity: f.capacity ? Number(f.capacity) : null,
        priceKobo: f.price ? Math.round(Number(f.price) * 100) : 0,
        posterUrl: f.posterUrl || null,
      });
      toast("Event published 🎉");
      setShowForm(false);
      const d = await get<{ items: EventItem[] }>("/api/events?mine=1");
      setEvents(d.items);
    } catch (e: any) { toast(e.message || "Failed to publish", "err"); } finally { setBusy(false); }
  };

  const cancelEvent = async (id: string) => {
    if (!confirm("Cancel this event? Students will see it as cancelled.")) return;
    try {
      await patch(`/api/events/${id}`, { status: "cancelled" });
      toast("Event cancelled");
      const d = await get<{ items: EventItem[] }>("/api/events?mine=1");
      setEvents(d.items);
    } catch (e: any) { toast(e.message, "err"); }
  };

  if (load) return <PageLoader />;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="sec-head"><h2>My organisation's events</h2><button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ New event</button></div>

      {showForm && (
        <div className="card" style={{ padding: 18, marginBottom: 18, border: "2px solid var(--brand)" }}>
          <h3 style={{ marginBottom: 14 }}>Publish a campus event</h3>
          <div className="field"><label>Event title *</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. TechTrek 2025 — Code, Ship, Repeat" /></div>
          <div className="field"><label>Description</label><textarea className="textarea" rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field"><label>Category</label>
              <select className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {cats.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div className="field"><label>Venue *</label><input className="input" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} placeholder="e.g. Main Auditorium, UNILAG" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field"><label>Starts *</label><input className="input" type="datetime-local" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} /></div>
            <div className="field"><label>Ends</label><input className="input" type="datetime-local" value={f.endsAt} onChange={(e) => setF({ ...f, endsAt: e.target.value })} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="field"><label>University</label><input className="input" value={f.universityCode} onChange={(e) => setF({ ...f, universityCode: e.target.value })} /></div>
            <div className="field"><label>Capacity</label><input className="input" type="number" value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} placeholder="e.g. 300" /></div>
            <div className="field"><label>Ticket price (₦)</label><input className="input" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="0 = free" /></div>
          </div>
          <div className="field"><label>Flyer/poster image URL (optional)</label><input className="input" value={f.posterUrl} onChange={(e) => setF({ ...f, posterUrl: e.target.value })} placeholder="https://… or /uploads/…" />
            <div className="hint">Uploads: poster photos use the same endpoint as listings (planned UI) — for now paste a hosted flyer URL.</div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy || !f.title || !f.venue || !f.startsAt} onClick={publish}>
              {busy ? "Publishing…" : "Publish event 🚀"}
            </button>
          </div>
        </div>
      )}

      {events.length === 0 && !showForm ? (
        <Empty icon="calendar" title="No events yet" text="Student organisations use OjaX to promote events — publish your first one." />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {events.map((e) => (
            <div key={e.id} className="cart-row" style={{ gridTemplateColumns: "1fr auto", border: "1px solid var(--line)", borderRadius: 14 }}>
              <div>
                <Link to={`/events/${e.id}`} style={{ fontWeight: 800 }}>{e.title}</Link>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{fmtDateTime(e.startsAt)} · {e.venue} · {e.rsvpCount} RSVPs</div>
                <span className={`chip ${e.status === "cancelled" ? "chip-red" : "chip-green"}`}>{e.status}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Link to={`/events/${e.id}`} className="btn btn-outline btn-sm">View</Link>
                {e.status === "published" && <button className="btn btn-danger btn-sm" onClick={() => cancelEvent(e.id)}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ user, updateUser }: { user: User; updateUser: (p: Partial<User>) => void }) {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [unis, setUnis] = useState<University[]>([]);
  const [f, setF] = useState({
    fullName: user.fullName, phone: user.phone || "", whatsapp: user.whatsapp || "",
    universityCode: user.universityCode || "", department: user.department || "", level: user.level || "",
    bio: user.bio || "", meetupSpot: user.meetupSpot || "", orgName: user.orgName || "",
  });
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "" });

  useEffect(() => { universities().then(setUnis); }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const d = await patch<{ user: User }>("/api/users/me", f);
      updateUser(d.user);
      toast("Profile updated ✨");
    } catch (e: any) { toast(e.message, "err"); } finally { setSaving(false); }
  };

  const uploadAvatar = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const d = await api<{ avatarUrl: string }>("/api/users/me/avatar", { method: "POST", formData: fd });
      updateUser({ avatarUrl: d.avatarUrl });
      toast("Profile photo updated");
    } catch (e: any) { toast(e.message, "err"); }
  };

  const changePw = async () => {
    try {
      await post("/api/auth/change-password", pw);
      toast("Password changed 🔒");
      setPw({ current: "", next: "" });
    } catch (e: any) { toast(e.message, "err"); }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>Profile photo</h2>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar name={user.fullName} url={user.avatarUrl} size={72} />
          <div>
            <label className="btn btn-outline btn-sm" style={{ display: "inline-flex", cursor: "pointer" }}>
              <Icon name="camera" size={15} /> Change photo
              <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            </label>
            <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "6px 0 0" }}>JPG or PNG. Shown on listings &amp; chats.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>My details</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Full name</label><input className="input" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>University</label>
            <select className="select" value={f.universityCode} onChange={(e) => setF({ ...f, universityCode: e.target.value })}>
              <option value="">—</option>
              {unis.map((u) => <option key={u.code} value={u.code}>{u.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Department / level</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} placeholder="Dept" />
              <input className="input" style={{ width: 110 }} value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })} placeholder="Level" />
            </div>
          </div>
        </div>
        {user.isOrg && (
          <div className="field"><label>Organisation name</label><input className="input" value={f.orgName} onChange={(e) => setF({ ...f, orgName: e.target.value })} /></div>
        )}
        <div className="field"><label>Bio</label><textarea className="textarea" rows={3} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="A line about you/your hustle — buyers see it on your profile." maxLength={600} /></div>
        <div className="field"><label>Usual meetup spot</label><input className="input" value={f.meetupSpot} onChange={(e) => setF({ ...f, meetupSpot: e.target.value })} placeholder="e.g. UNILAG main library" /></div>
        <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>Change password</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div className="field" style={{ margin: 0 }}><label>Current password</label><input className="input" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
          <div className="field" style={{ margin: 0 }}><label>New password</label><input className="input" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
          <button className="btn btn-outline" onClick={changePw} disabled={!pw.current || pw.next.length < 8}>Update</button>
        </div>
      </div>

      <div className="card" style={{ padding: 20, borderColor: "#fecdca" }}>
        <h2 style={{ fontSize: 19, marginBottom: 6 }}>Danger zone</h2>
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 10px" }}>Need to sign out of this device?</p>
        <button className="btn btn-danger" onClick={() => logout().then(() => (window.location.href = "/"))}><Icon name="logout" size={15} /> Sign out</button>
      </div>
    </div>
  );
}

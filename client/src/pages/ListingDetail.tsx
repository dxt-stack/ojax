import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { del, get, patch, post } from "../lib/api";
import type { Listing, RatingSummary } from "../lib/types";
import { fmtDateTime, naira, timeAgo } from "../lib/format";
import { Icon } from "../lib/icons";
import { RatingLine } from "../components/Stars";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Avatar } from "../components/Layout";
import { Empty, PageLoader } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { ListingCard } from "../components/Cards";

export default function ListingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const cart = useCart();
  const [data, setData] = useState<{ listing: Listing; related: Listing[] } | null>(null);
  const [load, setLoad] = useState(true);
  const [err, setErr] = useState("");
  const [imgIdx, setImgIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [fav, setFav] = useState(false);
  const [qty, setQty] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [modal, setModal] = useState<null | "delete" | "chat">(null);

  useEffect(() => {
    let dead = false;
    setLoad(true);
    setErr("");
    get<{ listing: Listing; related: Listing[] }>(`/api/listings/${id}`)
      .then((d) => { if (!dead) { setData(d); setFav(!!d.listing.isFavorite); } })
      .catch((e) => { if (!dead) setErr(e.message); })
      .finally(() => { if (!dead) setLoad(false); });
    return () => { dead = true; };
  }, [id]);

  // live rating summary for the seller (real reviews only)
  const [sellerRating, setSellerRating] = useState<RatingSummary>({ avg: null, count: 0 });
  useEffect(() => {
    const sid = data?.listing?.seller?.id;
    if (!sid) return;
    get<{ rating: RatingSummary }>(`/api/users/${sid}`)
      .then((d) => setSellerRating(d.rating || { avg: null, count: 0 }))
      .catch(() => {});
  }, [data?.listing?.seller?.id]);

  if (load) return <PageLoader />;
  if (err || !data) return <Empty icon="search" title="Not found" text={err || "This item is gone."} />;

  const l = data.listing;
  const mine = l.myListing || (user && l.seller?.id === user.id);
  const sold = l.status === "sold";

  const addToCart = async () => {
    if (!user) return nav("/login?next=" + encodeURIComponent(`/item/${l.id}`));
    setBusy(true);
    try {
      const r = await post<{ count: number }>("/api/orders/cart", { listingId: l.id, quantity: qty });
      cart.bump();
      toast("Added to cart ");
      nav("/checkout");
    } catch (e: any) {
      toast(e.message || "Couldn't add to cart", "err");
    } finally {
      setBusy(false);
    }
  };

  const toggleFav = async () => {
    if (!user) return nav("/login?next=/browse");
    try {
      const d = await post<{ favorite: boolean }>(`/api/listings/${l.id}/favorite`);
      setFav(d.favorite);
      toast(d.favorite ? "Saved " : "Removed");
    } catch { toast("Try again", "err"); }
  };

  const doChat = async () => {
    setBusy(true);
    try {
      const d = await post<{ conversationId: string }>("/api/messages/start", { listingId: l.id, message: chatMsg || undefined });
      nav(`/messages/${d.conversationId}`);
    } catch (e: any) {
      toast(e.message || "Couldn't start chat", "err");
    } finally { setBusy(false); }
  };

  const markSold = async () => {
    if (!confirm("Mark this item as sold? It stays in your records.")) return;
    setBusy(true);
    try {
      await post(`/api/listings/${l.id}/sold`);
      toast("Marked as sold ");
      nav("/dashboard");
    } catch (e: any) { toast(e.message, "err"); } finally { setBusy(false); }
  };

  const delListing = async () => {
    setBusy(true);
    try {
      await del(`/api/listings/${l.id}`);
      toast("Listing deleted");
      nav("/dashboard");
    } catch (e: any) { toast(e.message, "err"); } finally { setBusy(false); }
  };

  const sellerLink = l.seller?.id ? `/profile/${l.seller.id}` : "#";
  const imgs = l.images.length ? l.images : [{ fullUrl: "", thumbUrl: "" }];

  return (
    <div className="container" style={{ paddingTop: 8 }}>
      <div className="breadcrumb">
        <Link to="/">Home</Link> <Icon name="arrowR" size={13} />
        <Link to={`/browse?category=${l.category}`}>{l.category}</Link> <Icon name="arrowR" size={13} />
        <b>{l.title.slice(0, 40)}{l.title.length > 40 ? "…" : ""}</b>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(300px, 380px)", gap: 20, alignItems: "start" }} className="detail-grid">
        <div>
          <div className="gallery">
            <div className="main">
              {l.coverUrl || imgs[0].fullUrl ? (
                <img key={imgIdx} src={imgs[imgIdx].fullUrl || imgs[imgIdx].thumbUrl} alt={l.title} />
              ) : (
                <div style={{ color: "var(--ink-3)", display: "grid", placeItems: "center", height: "100%" }}>
                  <Icon name="camera" size={60} color="#e0b39c" />
                </div>
              )}
              {sold && <div className="sold-ribbon"><span>SOLD</span></div>}
            </div>
            {imgs.length > 1 && (
              <div className="thumbs">
                {imgs.map((im, i) => (
                  <button key={i} className={i === imgIdx ? "on" : ""} onClick={() => setImgIdx(i)}>
                    <img src={im.thumbUrl} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 20, marginTop: 16 }}>
            <h1 style={{ fontSize: 21 }}>{l.title}</h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0" }}>
              <span className="chip chip-brand">{l.conditionLabel || l.condition}</span>
              {l.negotiable && <span className="chip">Price negotiable</span>}
              {l.shipAvailable && <span className="chip chip-green"> Ships</span>}
              {l.quantity > 1 && <span className="chip">Qty {l.quantity}</span>}
              <span className="chip"><Icon name="eye" size={14} /> {l.views} views</span>
              <span className="chip">{timeAgo(l.createdAt)}</span>
            </div>
            <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "14px 0" }} />
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Description</h3>
            <div style={{ whiteSpace: "pre-wrap", color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.65 }}>{l.description || "No description provided."}</div>
            {l.meetupNotes && (
              <div className="ok-box" style={{ marginTop: 14 }}> <b>Meetup note:</b> {l.meetupNotes}</div>
            )}
          </div>
        </div>

        <div className="buybox">
          {sold ? (
            <><div style={{ fontSize: 18, fontWeight: 800 }}>Sold </div>
              <p style={{ color: "var(--ink-3)", fontSize: 14 }}>This item already found a new owner.</p></>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 600 }}>Price</span>
                <button className="fav" onClick={toggleFav} aria-label="Save" style={{ background: "none", border: 0, color: fav ? "var(--red)" : "var(--ink-3)" }}>
                  <Icon name="heart" size={20} />
                </button>
              </div>
              <div className="price">{naira(l.priceKobo)}</div>
              {l.negotiable && <span style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 700 }}>Negotiable — chat the seller</span>}

              <div className="meta-line">
                <span className="chip chip-green"> Seller verified student</span>
                {l.shipAvailable && <span className="shiptag"><Icon name="truck" size={14} /> Delivery available</span>}
              </div>

              {!mine && l.quantity > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Qty</span>
                  <div className="qty">
                    <button onClick={() => setQty((x) => Math.max(1, x - 1))}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty((x) => Math.min(l.quantity, x + 1))}>+</button>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{l.quantity} available</span>
                </div>
              )}

              {mine ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <div className="chip chip-blue" style={{ justifyContent: "center", padding: 10 }}>This is your listing</div>
                  <Link to={`/sell/${l.id}/edit`} className="btn btn-dark btn-block"><Icon name="edit" size={16} /> Edit item</Link>
                  {l.status === "active" && <button className="btn btn-success btn-block" onClick={markSold} disabled={busy}><Icon name="check" size={16} /> Mark as sold</button>}
                  <button className="btn btn-danger btn-block" onClick={() => setModal("delete")} disabled={busy}><Icon name="trash" size={16} /> Delete listing</button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 9, marginTop: 6 }}>
                  <button className="btn btn-primary btn-lg btn-block" onClick={addToCart} disabled={busy}>
                    <Icon name="cart" size={19} /> {busy ? "Adding…" : "Add to cart"}
                  </button>
                  <button className="btn btn-outline btn-block" onClick={() => { if (!user) nav("/login?next=" + encodeURIComponent(`/item/${l.id}`)); else setModal("chat"); }}>
                    <Icon name="chat" size={17} /> Message seller
                  </button>
                </div>
              )}
              <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--ink-3)", display: "flex", gap: 7, alignItems: "center" }}>
                <Icon name="shield" size={15} color="var(--green)" />
                Safe trade: meet in public campus spots &amp; inspect before paying.
              </div>
            </>
          )}

          <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "16px 0" }} />
          <Link to={sellerLink} style={{ display: "flex", gap: 11, alignItems: "center" }}>
            <Avatar name={l.seller?.fullName || "?"} url={l.seller?.avatarUrl} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>{l.seller?.fullName} {l.seller?.verified && <span title="Verified student" style={{ color: "var(--green)" }}></span>}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {l.seller?.universityCode || "Student"} {l.seller?.level ? `· ${l.seller.level}` : ""}
              </div>
              {sellerRating.count > 0 ? (
                <div style={{ marginTop: 3 }}><RatingLine avg={sellerRating.avg} count={sellerRating.count} /></div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Student on OjaX</div>
              )}
            </div>
          </Link>
          {l.meetupLocation && (
            <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-2)", display: "flex", gap: 7 }}>
              <Icon name="location" size={15} color="var(--brand)" /> Meetup: {l.meetupLocation}
            </div>
          )}
        </div>
      </div>

      {data.related.length > 0 && (
        <section className="sec">
          <div className="sec-head"><h2>Similar items nearby</h2></div>
          <div className="grid-products wide">
            {data.related.map((r) => <ListingCard key={r.id} listing={r} />)}
          </div>
        </section>
      )}

      {modal === "chat" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setModal(null)}></button>
            <h3>Message {l.seller?.fullName?.split(" ")[0]}</h3>
            <p style={{ color: "var(--ink-3)", fontSize: 13.5 }}>About: <b>{l.title}</b></p>
            <div className="field">
              <textarea className="textarea" rows={4} value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder={`Hi! Is "${l.title}" still available? Can we meet up?`} />
            </div>
            <button className="btn btn-primary btn-block" onClick={doChat} disabled={busy}><Icon name="send" size={16} /> Start chat</button>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this listing?</h3>
            <p style={{ color: "var(--ink-2)" }}>"<b>{l.title}</b>" will be removed from the market permanently. This can't be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setModal(null)}>Keep it</button>
              <button className="btn btn-danger" onClick={delListing} disabled={busy}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@media (max-width:980px){.detail-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

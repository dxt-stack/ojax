import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { del, get, patch, post } from "../lib/api";
import type { CartLine, Order, Totals } from "../lib/types";
import { naira, nairaCompact } from "../lib/format";
import { Icon } from "../lib/icons";
import { useToast, ErrBox, PageLoader } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

interface CartData {
  items: CartLine[];
  totals: Totals;
  rules: { shippingKobo: number; freeAboveKobo: number };
}

export default function Checkout() {
  const { toast } = useToast();
  const { user } = useAuth();
  const nav = useNavigate();
  const cartCtx = useCart();
  const [data, setData] = useState<CartData | null>(null);
  const [load, setLoad] = useState(true);
  const [step, setStep] = useState<"cart" | "details" | "pay">("cart");
  const [form, setForm] = useState({ fulfilment: "pickup", contactName: "", contactPhone: "", deliveryAddress: "", campusNote: "", buyerNote: "" });
  const [order, setOrder] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [paidOrder, setPaidOrder] = useState<Order | null>(null);

  const refresh = useCallback(async () => {
    try {
      const d = await get<CartData>("/api/orders/cart");
      setData(d);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // prefill from profile
  useEffect(() => {
    if (user && data) {
      setForm((f) => ({
        ...f,
        contactName: f.contactName || user.fullName,
        contactPhone: f.contactPhone || user.phone || "",
        campusNote: f.campusNote || (user.universityCode ? `Meet on ${user.universityCode} campus` : ""),
      }));
    }
  }, [user, data]);

  const setQty = async (line: CartLine, qty: number) => {
    if (qty < 1 || qty > line.stock) return toast(`Only ${line.stock} in stock`, "err");
    await patch(`/api/orders/cart/${line.listingId}`, { quantity: qty }).catch((e: any) => toast(e.message, "err"));
    refresh();
  };

  const remove = async (listingId: string) => {
    await del(`/api/orders/cart/${listingId}`);
    cartCtx.bump();
    refresh();
  };

  const step1submit = () => {
    setErr("");
    if (!data || !data.items.length) return setErr("Your cart is empty.");
    if (data.items.some((i) => i.unavailable)) return setErr("Remove unavailable items first.");
    if (form.fulfilment === "shipping") {
      const noShip = data.items.find((i) => !i.shipAvailable);
      if (noShip) return setErr(`"${noShip.title}" can't be shipped — switch to pickup or remove it.`);
    }
    setStep("details");
  };

  const placeOrder = async () => {
    setErr("");
    setBusy(true);
    try {
      const d = await post<{ order: any }>("/api/orders/checkout", {
        ...form,
        contactName: form.contactName || user!.fullName,
        contactPhone: form.contactPhone,
        deliveryAddress: form.fulfilment === "shipping" ? form.deliveryAddress : null,
        campusNote: form.fulfilment === "pickup" ? form.campusNote : null,
      });
      setOrder(d.order);
      setStep("pay");
      cartCtx.bump();
    } catch (e: any) {
      setErr(e.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  const paySandbox = async () => {
    setBusy(true);
    setErr("");
    try {
      const d = await post<{ order: { id: string; status: string }; reference: string }>(`/api/orders/${order.id}/pay-sandbox`);
      setPaidOrder({ ...order, id: d.order.id, status: d.order.status } as Order);
      setStep("cart");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (load) return <PageLoader />;

  const empty = !data || !data.items.length;

  return (
    <div className="container" style={{ maxWidth: 1080 }}>
      <div className="breadcrumb">
        <Link to="/browse">Marketplace</Link> <Icon name="arrowR" size={13} /> <b>Cart &amp; checkout</b>
      </div>

      {paidOrder && (
        <div className="card" style={{ padding: 34, textAlign: "center", marginTop: 10 }}>
          <div style={{ fontSize: 60 }}></div>
          <h1 style={{ fontSize: 26, margin: "8px 0 4px" }}>Payment successful!</h1>
          <p style={{ color: "var(--ink-3)" }}>Order <b>{paidOrder.orderNo}</b> is confirmed. Sellers have been notified to arrange {paidOrder.fulfilment === "pickup" ? "pickup" : "delivery"}.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
            <Link to="/dashboard?tab=orders" className="btn btn-primary">Track my order</Link>
            <Link to="/browse" className="btn btn-outline">Keep shopping</Link>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 16 }}>
            Demo payment — in production this is Paystack with cards, transfer &amp; USSD.
          </p>
        </div>
      )}

      {step === "cart" && !paidOrder && (
        <div className="card">
          <div className="sec-head" style={{ padding: "16px 16px 0" }}>
            <h2>My cart {data?.items.length ? `(${data.items.length})` : ""}</h2>
          </div>
          {empty ? (
            <div className="empty" style={{ padding: "44px 16px" }}>
              <div className="big"></div>
              <h3>Your cart is empty</h3>
              <p>Items you add from the market will show up here.</p>
              <Link to="/browse" className="btn btn-primary">Start shopping</Link>
            </div>
          ) : (
            <div>
              {data!.items.map((line) => (
                <div className="cart-row" key={line.listingId} style={{ borderBottom: "1px solid var(--line)" }}>
                  <Link to={`/item/${line.listingId}`} style={{ width: 78, height: 78, borderRadius: 12, overflow: "hidden", background: "#f2f4f7", display: "grid", placeItems: "center" }}>
                    {line.coverUrl ? <img src={line.coverUrl} alt="" style={{ width: 78, height: 78, objectFit: "cover" }} /> : <Icon name="camera" size={24} color="#d0d5dd" />}
                  </Link>
                  <div style={{ minWidth: 0 }}>
                    <Link to={`/item/${line.listingId}`} style={{ fontWeight: 700, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line.title}</Link>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Sold by {line.sellerName}</div>
                    {line.unavailable && <span className="chip chip-red" style={{ marginTop: 4 }}>No longer available — remove</span>}
                    {line.shipAvailable && <span style={{ fontSize: 11.5, color: "var(--green)", fontWeight: 700 }}> delivery available</span>}
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
                      {!line.unavailable && (
                        <div className="qty">
                          <button onClick={() => setQty(line, line.qty - 1)}>−</button>
                          <span>{line.qty}</span>
                          <button onClick={() => setQty(line, line.qty + 1)}>+</button>
                        </div>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(line.listingId)}><Icon name="trash" size={15} /> Remove</button>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{naira(line.priceKobo * line.qty)}</div>
                    {line.qty > 1 && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{nairaCompact(line.priceKobo)} each</div>}
                  </div>
                </div>
              ))}
              <div className="summary-card" style={{ padding: "16px 16px 18px", position: "static" }}>
                <div className="lines">
                  <div className="li-row"><span>Subtotal ({data!.items.length} item{data!.items.length > 1 ? "s" : ""})</span><b>{naira(data!.totals.subtotalKobo)}</b></div>
                  <div className="li-row"><span>Delivery estimate</span><b>{data!.totals.shippingKobo === 0 && data!.items.some((i) => i.shipAvailable) ? "FREE " : naira(data!.totals.shippingKobo)}</b></div>
                  {data!.items.some((i) => i.shipAvailable) && data!.totals.subtotalKobo < data!.rules.freeAboveKobo && (
                    <div style={{ fontSize: 12.5, background: "var(--brand-soft)", borderRadius: 10, padding: "7px 11px", color: "var(--brand-strong)" }}>
                      Add {naira(data!.rules.freeAboveKobo - data!.totals.subtotalKobo)} more for free delivery
                    </div>
                  )}
                  <div className="li-row" style={{ fontSize: 17 }}><b>Total</b><b style={{ fontSize: 19 }}>{naira(data!.totals.totalKobo)}</b></div>
                </div>
                <button className="btn btn-primary btn-lg btn-block" disabled={data!.items.some((i) => i.unavailable)} onClick={step1submit}>
                  Checkout securely →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === "details" && !paidOrder && (
        <div className="checkout-grid">
          <div className="card" style={{ padding: 24 }}>
            <div className="steps">
              <span className="step on">1 · Cart </span>
              <span className="step on">2 · Details</span>
              <span className="step">3 · Pay</span>
            </div>
            {err && <ErrBox>{err}</ErrBox>}
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Delivery &amp; contact</h2>
            <div className="role-toggle" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button type="button" className={form.fulfilment === "pickup" ? "active" : ""} onClick={() => setForm({ ...form, fulfilment: "pickup" })}>
                 Campus pickup <span className="cap">meet the seller on campus</span>
              </button>
              <button type="button" className={form.fulfilment === "shipping" ? "active" : ""} onClick={() => setForm({ ...form, fulfilment: "shipping" })}>
                 Delivery <span className="cap">{nairaCompact(data!.rules.shippingKobo)} nationwide · free ≥ ₦20k</span>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>Full name *</label><input className="input" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></div>
              <div className="field"><label>Phone (WhatsApp ok) *</label><input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="0803 000 0000" /></div>
            </div>
            {form.fulfilment === "shipping" ? (
              <div className="field"><label>Delivery address *</label><textarea className="textarea" rows={3} value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} placeholder="Hostel, block/room or full address + nearest landmark" /></div>
            ) : (
              <div className="field"><label>Preferred campus &amp; spot</label><input className="input" value={form.campusNote} onChange={(e) => setForm({ ...form, campusNote: e.target.value })} placeholder="e.g. UNILAG — main library gate, 2pm weekdays" /></div>
            )}
            <div className="field"><label>Note for seller (optional)</label><input className="input" value={form.buyerNote} onChange={(e) => setForm({ ...form, buyerNote: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setStep("cart")}>← Back</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={placeOrder} disabled={busy || !form.contactName || !form.contactPhone || (form.fulfilment === "shipping" && !form.deliveryAddress)}>
                {busy ? "Checking…" : "Continue to payment"}
              </button>
            </div>
          </div>
          <div className="summary-card card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 10 }}>Order summary</h3>
            {data!.items.map((l) => (
              <div key={l.listingId} style={{ display: "flex", gap: 10, margin: "8px 0", alignItems: "center" }}>
                {l.coverUrl ? <img src={l.coverUrl} style={{ width: 42, height: 42, borderRadius: 9, objectFit: "cover" }} alt="" /> : <span style={{ width: 42, height: 42, borderRadius: 9, background: "#f2f4f7" }} />}
                <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title} × {l.qty}</span>
                <b style={{ fontSize: 13 }}>{naira(l.priceKobo * l.qty)}</b>
              </div>
            ))}
            <div className="li-row" style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 10 }}><span>Subtotal</span><b>{naira(data!.totals.subtotalKobo)}</b></div>
            <div className="li-row"><span>Delivery</span><b>{data!.totals.shippingKobo === 0 ? "FREE" : naira(data!.totals.shippingKobo)}</b></div>
            <div className="li-row" style={{ fontSize: 16 }}><b>Total</b><b style={{ fontSize: 18 }}>{naira(data!.totals.totalKobo)}</b></div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 10, display: "flex", gap: 6 }}><Icon name="shield" size={14} color="var(--green)" /> Secure OjaPay checkout (demo gateway).</div>
          </div>
        </div>
      )}

      {step === "pay" && !paidOrder && (
        <div className="checkout-grid">
          <div className="card" style={{ padding: 26 }}>
            <div className="steps">
              <span className="step on">1 · Cart </span>
              <span className="step on">2 · Details </span>
              <span className="step on">3 · Pay</span>
            </div>
            <h2 style={{ fontSize: 20 }}>Pay {naira(order.totals.totalKobo)}</h2>
            <p style={{ color: "var(--ink-3)", fontSize: 13.5 }}>Order <b>{order.orderNo}</b> is reserved for {order.reservedUntilMinutes} minutes.</p>
            {err && <ErrBox>{err}</ErrBox>}

            <div className="card" style={{ border: "2px solid var(--brand)", background: "var(--brand-soft)", padding: 16, margin: "16px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, background: "#fff", display: "grid", placeItems: "center", fontSize: 22 }}></span>
                <div style={{ flex: 1 }}>
                  <b>OjaPay — demo gateway</b>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>Sandbox mode: no real money moves. Tap to simulate a successful payment.</div>
                </div>
                <span className="chip chip-ink">DEMO</span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <button className="btn btn-primary btn-lg btn-block" onClick={paySandbox} disabled={busy}>
                <Icon name="lock" size={17} /> {busy ? "Processing…" : `Pay ${naira(order.totals.totalKobo)} — simulate success`}
              </button>
              <button className="btn btn-outline btn-block" disabled={busy} onClick={() => setStep("details")}>← Back to details</button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 14, display: "flex", gap: 6, alignItems: "center" }}>
              <Icon name="shield" size={15} color="var(--green)" />
              Live payments (cards, transfer, USSD via Paystack) switch on after launch approval — the code path is ready.
            </p>
          </div>
          <div className="summary-card card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Paying for</h3>
            <div className="li-row"><span>Subtotal</span><b>{naira(order.totals.subtotalKobo)}</b></div>
            <div className="li-row"><span>Delivery</span><b>{order.totals.shippingKobo === 0 ? "FREE" : naira(order.totals.shippingKobo)}</b></div>
            <div className="li-row"><span>Service fee</span><b>{order.totals.serviceFeeKobo === 0 ? "₦0 (launch)" : naira(order.totals.serviceFeeKobo)}</b></div>
            <div className="li-row" style={{ fontSize: 16 }}><b>Total</b><b style={{ fontSize: 18 }}>{naira(order.totals.totalKobo)}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}

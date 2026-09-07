import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, get, post } from "../lib/api";
import type { Category, Condition, Listing } from "../lib/types";
import { useToast, ErrBox, PageLoader } from "../context/ToastContext";
import { Icon } from "../lib/icons";
import { meta } from "../lib/meta";
import { useAuth } from "../context/AuthContext";

interface UploadedImg { id: string; fullUrl: string; thumbUrl: string }

const EMPTY = {
  title: "",
  description: "",
  category: "",
  subcategory: "",
  conditionCode: "used-good",
  price: "",
  negotiable: false,
  quantity: 1,
  shipAvailable: false,
  meetupLocation: "",
  meetupNotes: "",
};

export default function Sell() {
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [conds, setConds] = useState<Condition[]>([]);
  const [f, setF] = useState(EMPTY);
  const [images, setImages] = useState<UploadedImg[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [mode, setMode] = useState<"new" | "edit">(id ? "edit" : "new");
  const [origListing, setOrigListing] = useState<Listing | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    meta().then((m) => { setCats(m.categories); setConds(m.conditions as Condition[]); });
  }, []);

  useEffect(() => {
    if (id) {
      get<{ listing: Listing }>(`/api/listings/${id}`).then((d) => {
        const l = d.listing;
        if (!l.myListing) { toast("You can only edit your own items", "err"); nav("/dashboard"); return; }
        setOrigListing(l);
        setF({
          title: l.title, description: l.description, category: l.category, subcategory: l.subcategory || "",
          conditionCode: l.condition, price: String((l.priceKobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })).replace(/,/g, ""),
          negotiable: l.negotiable, quantity: l.quantity, shipAvailable: l.shipAvailable,
          meetupLocation: l.meetupLocation || "", meetupNotes: l.meetupNotes || "",
        });
        if (l.images.length) {
          setImages(l.images.map((im) => ({ id: "existing-" + im.position, fullUrl: im.fullUrl, thumbUrl: im.thumbUrl })));
        }
      }).catch(() => { toast("Item not found", "err"); nav("/dashboard"); });
    } else {
      setMode("new");
    }
  }, [id]);

  const set = (k: keyof typeof EMPTY, v: any) => setF((x) => ({ ...x, [k]: v }));
  const cat = cats.find((c) => c.code === f.category);

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remain = 8 - images.length;
    const list = Array.from(files).slice(0, remain);
    if (list.length < files.length) toast("Max 8 photos per listing", "info");
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      list.forEach((file) => fd.append("files", file));
      const d = await api<{ images: UploadedImg[] }>("/api/listings/photos", { method: "POST", formData: fd });
      setImages((prev) => [...prev, ...d.images]);
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImg = async (img: UploadedImg) => {
    setImages((prev) => prev.filter((x) => x.id !== img.id));
    if (!img.id.startsWith("existing-")) {
      await api(`/api/listings/photos/${img.id}`, { method: "DELETE" }).catch(() => {});
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (f.title.trim().length < 4) return setErr("Give the item a clear title (min 4 characters).");
    if (!f.category) return setErr("Choose a category.");
    const priceKobo = Math.round((Number(f.price.replace(/[₦,\s]/g, "")) || 0) * 100);
    if (priceKobo <= 0) return setErr("Enter a price greater than zero.");
    setBusy(true);
    const body = {
      title: f.title.trim(),
      description: f.description.trim(),
      category: f.category,
      subcategory: f.subcategory || null,
      conditionCode: f.conditionCode,
      priceKobo,
      negotiable: f.negotiable,
      quantity: f.quantity,
      shipAvailable: f.shipAvailable,
      meetupLocation: f.meetupLocation || null,
      meetupNotes: f.meetupNotes || null,
      imageIds: mode === "edit" && origListing ? undefined : images.filter((i) => !i.id.startsWith("existing-")).map((i) => i.id),
    };
    try {
      if (mode === "edit" && id) {
        const d = await api<{ listing: Listing }>(`/api/listings/${id}`, { method: "PATCH", body });
        toast("Listing updated ");
        nav(`/item/${d.listing.id}`);
      } else {
        const d = await api<{ listing: Listing }>("/api/listings", { method: "POST", body });
        toast("Your item is live! ");
        nav(`/item/${d.listing.id}`);
      }
    } catch (er: any) {
      setErr(er.message || "Couldn't save — try again");
    } finally {
      setBusy(false);
    }
  };

  if (mode === "edit" && !origListing) return <PageLoader />;

  return (
    <div className="container" style={{ maxWidth: 880 }}>
      <div className="breadcrumb">
        <span>Home</span> <Icon name="arrowR" size={13} /> <b>{mode === "edit" ? "Edit item" : "Sell an item"}</b>
      </div>
      <div className="card" style={{ padding: "26px 24px" }}>
        <h1 style={{ fontSize: 23 }}>{mode === "edit" ? "Edit your item " : "List an item for sale "}</h1>
        <p style={{ color: "var(--ink-3)", marginTop: 4 }}>Photos are key — sellers with clear photos sell 4× faster. Free to list.</p>
        {err && <ErrBox>{err}</ErrBox>}

        <form onSubmit={submit}>
          {/* Photos */}
          <h3 style={{ fontSize: 15, margin: "18px 0 10px" }}>Photos <span className="chip chip-brand" style={{ fontSize: 10.5 }}>{images.length}/8</span></h3>
          <div className="photo-drop" onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}>
            <Icon name="camera" size={30} color="var(--brand)" />
            <div style={{ fontWeight: 700, marginTop: 6 }}>{uploading ? "Uploading…" : "Tap to add photos"}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>JPG, PNG or GIF · up to 10MB each · the first photo is your cover</div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          </div>
          {images.length > 0 && (
            <div className="photo-grid">
              {images.map((img, i) => (
                <div className="photo-cell" key={img.id}>
                  <img src={img.thumbUrl || img.fullUrl} alt={`Photo ${i + 1}`} />
                  {i === 0 && <span className="cover-tag">COVER</span>}
                  <button type="button" className="rm" onClick={() => removeImg(img)} aria-label="Remove photo"></button>
                </div>
              ))}
              {images.length < 8 && (
                <button type="button" className="photo-cell" style={{ borderStyle: "dashed", background: "#fafbfc", color: "var(--ink-3)", display: "grid", placeItems: "center", fontSize: 26 }} onClick={() => fileRef.current?.click()}>+</button>
              )}
            </div>
          )}

          <h3 style={{ fontSize: 15, margin: "20px 0 10px" }}>Item details</h3>
          <div className="field">
            <label>Title <span className="req">*</span></label>
            <input className="input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. iPhone 13 128GB — good condition" maxLength={140} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="textarea" rows={5} value={f.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Condition, why you're selling, what's included, defects (be honest!), pickup details…" maxLength={8000} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Category <span className="req">*</span></label>
              <select className="select" value={f.category} onChange={(e) => { set("category", e.target.value); set("subcategory", ""); }}>
                <option value="">Choose…</option>
                {cats.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Sub-category</label>
              <select className="select" value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)} disabled={!cat}>
                <option value="">—</option>
                {cat?.sub.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Condition</label>
              <select className="select" value={f.conditionCode} onChange={(e) => set("conditionCode", e.target.value)}>
                {conds.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Quantity</label>
              <input className="input" type="number" min={1} max={999} value={f.quantity} onChange={(e) => set("quantity", Math.max(1, Number(e.target.value) || 1))} />
            </div>
          </div>
          <div className="field">
            <label>Price (₦) <span className="req">*</span></label>
            <input className="input" inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 45000" />
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", margin: "4px 0 12px" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600, fontSize: 14 }}>
              <input type="checkbox" checked={f.negotiable} onChange={(e) => set("negotiable", e.target.checked)} /> Price is negotiable
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600, fontSize: 14 }}>
              <input type="checkbox" checked={f.shipAvailable} onChange={(e) => set("shipAvailable", e.target.checked)} /> I can ship it (delivery)
            </label>
          </div>

          <h3 style={{ fontSize: 15, margin: "16px 0 10px" }}>Meetup &amp; safety</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Preferred meetup spot</label>
              <input className="input" value={f.meetupLocation} onChange={(e) => set("meetupLocation", e.target.value)} placeholder="e.g. UNILAG main library" />
            </div>
            <div className="field">
              <label>Extra notes for the buyer</label>
              <input className="input" value={f.meetupNotes} onChange={(e) => set("meetupNotes", e.target.value)} placeholder="e.g. Come with your own earpiece to test" />
            </div>
          </div>
          <div className="chip" style={{ marginBottom: 18, background: "var(--green-bg)", color: "var(--green)" }}>
            <Icon name="shield" size={14} /> Tip: always meet in a busy, public campus spot and inspect the item before paying.
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={() => nav(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy || uploading}>
              {busy ? "Saving…" : mode === "edit" ? "Save changes" : "Publish item "}
            </button>
          </div>
        </form>
      </div>
      <p style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>{user?.isOrg ? "Organisation accounts can also post events from the dashboard." : "Selling is free — no listing fees during our campus launch."}</p>
    </div>
  );
}

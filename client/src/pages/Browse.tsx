import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { get } from "../lib/api";
import type { Category, Listing, Page } from "../lib/types";
import { ListingCard } from "../components/Cards";
import { Empty, PageLoader } from "../context/ToastContext";
import { Icon } from "../lib/icons";
import { meta } from "../lib/meta";

const SORTS = [
  ["newest", "Newest first"],
  ["price_asc", "Price: low → high"],
  ["price_desc", "Price: high → low"],
  ["popular", "Most popular"],
];

const PRICE_TIERS: [string, number | null, number | null][] = [
  ["Any price", null, null],
  ["Under ₦10k", 0, 10_000_00],
  ["₦10k – ₦50k", 10_000_00, 50_000_00],
  ["₦50k – ₦150k", 50_000_00, 150_000_00],
  ["₦150k – ₦500k", 150_000_00, 500_000_00],
  ["Above ₦500k", 500_000_00, null],
];

export default function Browse() {
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState<Page<Listing> | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [load, setLoad] = useState(true);
  const [err, setErr] = useState("");

  const q = sp.get("q") || "";
  const category = sp.get("category") || "";
  const sub = sp.get("sub") || "";
  const sort = sp.get("sort") || "newest";
  const page = Number(sp.get("page") || "1");
  const price = sp.get("price") || "";
  const [searchBox, setSearchBox] = useState(q);

  useEffect(() => {
    meta().then((m) => setCats(m.categories));
  }, []);

  useEffect(() => {
    let dead = false;
    setLoad(true);
    setErr("");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sub) params.set("subcategory", sub);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));

    // price tier -> min/max
    const pr = PRICE_TIERS.find((p) => p[0] === price);
    if (pr && (pr[1] !== null || pr[2] !== null)) {
      if (pr[1] !== null) params.set("min", String(pr[1]));
      if (pr[2] !== null) params.set("max", String(pr[2]));
    }
    const qs = params.toString();
    get<Page<Listing>>(`/api/listings?${qs}`)
      .then((d) => { if (!dead) setData(d); })
      .catch((e) => { if (!dead) { setErr(e.message); setData(null); } })
      .finally(() => { if (!dead) setLoad(false); });
    return () => { dead = true; };
  }, [q, category, sub, sort, page, price]);

  const setParam = (key: string, value: string) => {
    const n = new URLSearchParams(sp);
    if (value) n.set(key, value);
    else n.delete(key);
    n.delete("page");
    setSp(n, { replace: true });
  };

  const currentCat = cats.find((c) => c.code === category);
  const title = q ? `Results for "${q}"` : currentCat?.label || "All items";

  const grid = useMemo(
    () => (
      <div className="grid-products wide">
        {(data?.items || []).map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    ),
    [data],
  );

  return (
    <div className="container">
      <div className="breadcrumb">
        <span>Home</span> <Icon name="arrowR" size={13} /> <span>Marketplace</span>{" "}
        <Icon name="arrowR" size={13} /> <b>{title}</b>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="filter-bar">
          <form
            style={{ display: "flex", flex: 1, minWidth: 220, gap: 8 }}
            onSubmit={(e) => { e.preventDefault(); setParam("q", searchBox); }}
          >
            <input className="input" value={searchBox} onChange={(e) => setSearchBox(e.target.value)} placeholder="Search the market…" aria-label="Search items" />
            <button className="btn btn-primary" type="submit"><Icon name="search" size={17} /> Search</button>
          </form>
        </div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))" }}>
          <label style={{ display: "grid", gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>Category</span>
            <select className="select" value={category} onChange={(e) => { setParam("category", e.target.value); setParam("sub", ""); }}>
              <option value="">All categories</option>
              {cats.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </label>
          {currentCat && (
            <label style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>Sub-category</span>
              <select className="select" value={sub} onChange={(e) => setParam("sub", e.target.value)}>
                <option value="">All in {currentCat.label}</option>
                {currentCat.sub.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
              </select>
            </label>
          )}
          <label style={{ display: "grid", gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>Price</span>
            <select className="select" value={price} onChange={(e) => setParam("price", e.target.value)}>
              {PRICE_TIERS.map(([label]) => <option key={label} value={label}>{label}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>Sort</span>
            <select className="select" value={sort} onChange={(e) => setParam("sort", e.target.value)}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <h2>{title} <span style={{ color: "var(--ink-3)", fontSize: 14, fontWeight: 600 }}>({data?.total ?? "…"} items)</span></h2>
          <a style={{ cursor: "pointer" }} onClick={() => { setParam("q", ""); setSearchBox(""); setParam("category", ""); setParam("sub", ""); setParam("price", ""); }}>Clear filters</a>
        </div>
        {load ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 14 }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card"><div className="skeleton" style={{ aspectRatio: "1" }} /><div className="skeleton" style={{ height: 14, margin: 10 }} /></div>)}
        </div>
          : err ? <Empty title="Something went wrong" text={err} />
          : !data?.items.length ? (
            <Empty icon="search" title="No items match" text="Try a different keyword or clear some filters.">
              <button className="btn btn-outline" onClick={() => { setParam("q", ""); setSearchBox(""); setParam("category", ""); setParam("sub", ""); setParam("price", ""); }}>Reset filters</button>
            </Empty>
          ) : grid}
      </div>

      {(data?.pages || 1) > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>‹</button>
          {Array.from({ length: Math.min(data!.pages, 7) }).map((_, i) => {
            let p = i + 1;
            if (data!.pages > 7 && page > 4) p = page - 4 + i;
            return <button key={p} className={p === page ? "on" : ""} onClick={() => setParam("page", String(p))}>{p}</button>;
          })}
          <button disabled={page >= data!.pages} onClick={() => setParam("page", String(page + 1))}>›</button>
        </div>
      )}
    </div>
  );
}

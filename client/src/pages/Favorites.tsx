import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../lib/api";
import type { Listing, Page } from "../lib/types";
import { ListingCard } from "../components/Cards";
import { Empty, PageLoader } from "../context/ToastContext";

export default function Favorites() {
  const [items, setItems] = useState<Listing[]>([]);
  const [load, setLoad] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    get<Page<Listing>>("/api/listings?favorites=1")
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
      .finally(() => setLoad(false));
  }, [tick]);

  if (load) return <PageLoader />;
  return (
    <div className="container" style={{ maxWidth: 1080 }}>
      <div className="sec-head"><h1 style={{ fontSize: 24 }}>Saved items </h1></div>
      {items.length === 0 ? (
        <Empty icon="heart" title="Nothing saved yet" text="Tap the heart on any item in the market to keep it here.">
          <Link to="/browse" className="btn btn-primary">Browse the market</Link>
        </Empty>
      ) : (
        <>
          <div className="grid-products wide">
            {items.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => setTick((t) => t + 1)}>Refresh</button>
        </>
      )}
    </div>
  );
}

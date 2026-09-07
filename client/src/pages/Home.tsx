import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, post } from "../lib/api";
import type { EventItem, Listing, Page } from "../lib/types";
import { ListingCard, EventCard } from "../components/Cards";
import { Icon } from "../lib/icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Category } from "../lib/types";
import { PageLoader } from "../context/ToastContext";
import { meta } from "../lib/meta";

const CAT_ROWS: { icon: string; label: string; color: string }[] = [
  { icon: "smartphone", label: "Phones & Tablets", color: "#0e9f6e" },
  { icon: "laptop", label: "Laptops", color: "#2563eb" },
  { icon: "tv", label: "Electronics", color: "#7c3aed" },
  { icon: "shirt", label: "Fashion", color: "#e11d48" },
  { icon: "book", label: "Textbooks", color: "#d97706" },
  { icon: "sofa", label: "Home & Furniture", color: "#059669" },
  { icon: "dumbbell", label: "Sports", color: "#ea580c" },
  { icon: "music", label: "Hobbies & Music", color: "#db2777" },
  { icon: "sparkles", label: "Beauty", color: "#c026d3" },
  { icon: "briefcase", label: "Services", color: "#0d9488" },
  { icon: "food", label: "Food & Groceries", color: "#16a34a" },
  { icon: "grid", label: "Everything Else", color: "#64748b" },
];

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fresh, setFresh] = useState<Listing[]>([]);
  const [deals, setDeals] = useState<Listing[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, b, e, m] = await Promise.all([
          get<Page<Listing>>("/api/listings?pageSize=10&sort=newest"),
          get<Page<Listing>>("/api/listings?pageSize=8&sort=popular"),
          get<{ items: EventItem[] }>("/api/events?mode=upcoming&pageSize=4"),
          meta(),
        ]);
        setFresh(a.items);
        setDeals(b.items);
        setEvents(e.items);
        setCats(m.categories.filter((c) => CAT_ROWS.some((r) => r.label === c.label)));
      } catch { /* nothing */ } finally {
        setLoad(false);
      }
    })();
  }, []);

  const toggleRsvp = async (ev: EventItem) => {
    if (!user) {
      toast("Sign in to RSVP for events", "info");
      return;
    }
    try {
      if (ev.myRsvp) {
        await fetch(`/api/events/${ev.id}/rsvp`, { method: "DELETE", credentials: "include" });
        toast("RSVP cancelled");
      } else {
        await post(`/api/events/${ev.id}/rsvp`);
        toast("You're going! ");
      }
      setEvents((arr) => arr.map((x) => (x.id === ev.id ? { ...x, myRsvp: !x.myRsvp, rsvpCount: x.rsvpCount + (x.myRsvp ? -1 : 1) } : x)));
    } catch {
      toast("Couldn't update RSVP", "err");
    }
  };

  if (load) return <PageLoader />;

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Your campus, one market.</h1>
          <p>
            Buy &amp; sell with verified students on your campus — phones, laptops, textbooks, fashion and more —
            then catch the latest campus events. <b>No strangers. No wahala.</b>
          </p>
          <div className="quick">
            <Link to="/sell"><Icon name="plus" size={16} /> Sell an item</Link>
            <Link to="/browse"><Icon name="store" size={16} /> Shop the market</Link>
            <Link to="/events"><Icon name="calendar" size={16} /> Campus events</Link>
            {user?.isOrg && <Link to="/dashboard?tab=events"><Icon name="star" size={16} /> Post an event</Link>}
          </div>
          <div className="hero-cats">
            <div className="grid">
              {cats.map((c) => (
                <Link key={c.code} to={`/browse?category=${c.code}`}>
                  <span className="ic" style={{ background: c.color }}><Icon name={c.icon} size={19} /></span>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="sec">
          <div className="sec-head">
            <h2> Fresh on the market</h2>
            <Link to="/browse">See all →</Link>
          </div>
          {fresh.length ? (
            <div className="grid-products wide">
              {fresh.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
              The market is warming up — be the first to post an item!
            </div>
          )}
        </section>

        <section className="sec">
          <div className="sec-head">
            <h2> Trending in your campus market</h2>
            <Link to="/browse?sort=popular">More →</Link>
          </div>
          <div className="grid-products">
            {deals.slice(0, 8).map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>

        <div className="promo-band">
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span className="big">₦0</span>
            <div>
              <h3>Zero fees to sell on campus — launch offer</h3>
              <p>List as many items as you want. Pay nothing until you sell. Meet at safe spots.</p>
            </div>
          </div>
          <Link to="/sell" className="btn" style={{ background: "#fff", color: "var(--brand-strong)" }}>Start selling</Link>
        </div>

        <section className="sec">
          <div className="sec-head">
            <h2> Happening on campus</h2>
            <Link to="/events">All events →</Link>
          </div>
          <div className="events-grid">
            {events.map((e) => <EventCard key={e.id} event={e} onToggle={toggleRsvp} />)}
          </div>
        </section>

        <section className="sec">
          <div className="sec-head"><h2>How OjaX works</h2></div>
          <div className="two-col">
            <div className="step-card">
              <span className="n">1</span>
              <div>
                <h4>Create a free account</h4>
                <p>Sign up with your school email. Tell us your university so buyers know you're a real student.</p>
              </div>
            </div>
            <div className="step-card">
              <span className="n">2</span>
              <div>
                <h4>Snap &amp; list in minutes</h4>
                <p>Add up to 8 photos, set your price and meetup spot. Your item goes live instantly.</p>
              </div>
            </div>
            <div className="step-card">
              <span className="n">3</span>
              <div>
                <h4>Chat, meet &amp; trade safely</h4>
                <p>Buyers message you on OjaX. Agree on a spot — we recommend busy campus locations.</p>
              </div>
            </div>
            <div className="step-card">
              <span className="n">4</span>
              <div>
                <h4>Or order online with delivery</h4>
                <p>Pay securely in the app and get items delivered across campus or nationwide.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

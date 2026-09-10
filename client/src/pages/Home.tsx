import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, post } from "../lib/api";
import type { EventItem, Listing, Page } from "../lib/types";
import { ListingCard, EventCard } from "../components/Cards";
import { Icon } from "../lib/icons";
import { useAuth } from "../context/AuthContext";
import { useToast, PageLoader } from "../context/ToastContext";
import type { Category } from "../lib/types";

const CAT_ROWS: { icon: string; label: string; color: string; caption: string }[] = [
  { icon: "smartphone", label: "Phones & Tablets", color: "#ed6a3a", caption: "Upgrade your everyday" },
  { icon: "laptop", label: "Laptops", color: "#3659d8", caption: "Work. Build. Create." },
  { icon: "book", label: "Textbooks", color: "#b17a24", caption: "Pass the semester" },
  { icon: "shirt", label: "Fashion", color: "#be4c70", caption: "Find your look" },
  { icon: "sofa", label: "Home & Furniture", color: "#398d70", caption: "Make it yours" },
  { icon: "music", label: "Hobbies & Music", color: "#7956c6", caption: "Make some noise" },
  { icon: "grid", label: "Everything Else", color: "#65717e", caption: "There is more" },
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
          get<{ categories: Category[] }>("/api/meta"),
        ]);
        setFresh(a.items); setDeals(b.items); setEvents(e.items);
        setCats(m.categories.filter((c) => CAT_ROWS.some((r) => r.label === c.label)));
      } catch { /* demo shell remains useful when API is offline */ } finally { setLoad(false); }
    })();
  }, []);

  const toggleRsvp = async (ev: EventItem) => {
    if (!user) { toast("Sign in to RSVP for events", "info"); return; }
    try {
      if (ev.myRsvp) await fetch(`/api/events/${ev.id}/rsvp`, { method: "DELETE", credentials: "include" });
      else await post(`/api/events/${ev.id}/rsvp`);
      setEvents((arr) => arr.map((x) => x.id === ev.id ? { ...x, myRsvp: !x.myRsvp, rsvpCount: x.rsvpCount + (x.myRsvp ? -1 : 1) } : x));
      toast(ev.myRsvp ? "RSVP cancelled" : "You're going!");
    } catch { toast("Couldn't update RSVP", "err"); }
  };

  if (load) return <PageLoader />;

  return (
    <div className="home-page">
      <section className="hero hero-premium">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot" /> THE CAMPUS EXCHANGE</div>
            <h1>Your campus.<br /><em>One market.</em></h1>
            <p>Buy, sell and plug into campus life with people you can trust. Made for Nigerian students, from first lecture to final year.</p>
            <div className="hero-actions">
              <Link to="/browse" className="btn btn-light btn-lg"><Icon name="search" size={17} /> Explore the market</Link>
              <Link to="/sell" className="btn btn-quiet btn-lg"><Icon name="plus" size={17} /> Sell something</Link>
            </div>
            <div className="hero-proof"><span className="avatar-stack"><i>T</i><i>C</i><i>O</i><i>+</i></span><span><b>Students are already here</b><small>Verified campus community</small></span><span className="proof-divider" /><span><Icon name="shield" size={15} /> No strangers. No wahala.</span></div>
          </div>
          <div className="hero-visual" aria-label="OjaX campus activity preview">
            <div className="hero-card hero-card-main"><div className="mini-label">LIVE ON CAMPUS <span>●</span></div><div className="hero-card-title">What are you<br /><strong>looking for?</strong></div><div className="hero-search"><Icon name="search" size={16} /><span>Try “MacBook”, “sneakers”…</span><b>⌘ K</b></div><div className="mini-rail"><div><span className="mini-icon peach"><Icon name="smartphone" size={17} /></span><b>Phones</b><small>126 listings</small></div><div><span className="mini-icon blue"><Icon name="book" size={17} /></span><b>Textbooks</b><small>84 listings</small></div><div><span className="mini-icon green"><Icon name="calendar" size={17} /></span><b>Events</b><small>this weekend</small></div></div></div>
            <div className="hero-card floating-card trust-float"><span className="float-icon"><Icon name="shield" size={17} /></span><span><b>Verified students</b><small>Trust travels fast here</small></span><Icon name="check" size={16} color="#2f9b72" /></div>
            <div className="hero-card floating-card meet-float"><span className="meet-pin"><Icon name="location" size={17} /></span><span><b>Safe meetup spots</b><small>Library gate · UNILAG</small></span></div>
          </div>
        </div>
        <div className="container hero-bottom"><span>Explore by what you need</span><span className="hero-line" /><span>01 / 04</span></div>
      </section>

      <div className="container">
        <section className="trust-strip"><div><span className="strip-icon"><Icon name="school" size={19} /></span><span><b>Built for campus life</b><small>Buy from people in your school</small></span></div><div><span className="strip-icon green"><Icon name="shield" size={19} /></span><span><b>Trust by default</b><small>Verified profiles & safer meetups</small></span></div><div><span className="strip-icon purple"><Icon name="calendar" size={19} /></span><span><b>More than a marketplace</b><small>Find your people and your plans</small></span></div></section>

        <section className="sec category-section"><div className="section-kicker">START HERE</div><div className="sec-head"><div><h2>Find your next thing.</h2><p className="section-sub">The good stuff moves quickly around here.</p></div><Link to="/browse">View all categories <Icon name="arrowR" size={15} /></Link></div><div className="category-grid">{CAT_ROWS.map((row) => { const c = cats.find((item) => item.label === row.label); return <Link key={row.label} to={c ? `/browse?category=${c.code}` : "/browse"} className="category-tile"><span className="category-icon" style={{ background: row.color }}><Icon name={row.icon} size={22} /></span><span><b>{row.label}</b><small>{row.caption}</small></span><Icon name="arrowR" size={15} /></Link>; })}</div></section>

        <section className="sec feature-section"><div className="section-kicker">FRESH FINDS</div><div className="sec-head"><div><h2>Good things, close by.</h2><p className="section-sub">New listings from students around your campus.</p></div><Link to="/browse?sort=newest">See the latest <Icon name="arrowR" size={15} /></Link></div>{fresh.length ? <div className="grid-products wide">{fresh.slice(0, 5).map((l) => <ListingCard key={l.id} listing={l} />)}<Link to="/browse" className="more-tile"><span><Icon name="arrowR" size={22} /></span><b>See all listings</b><small>Keep exploring</small></Link></div> : <div className="empty card"><div className="big">✦</div><h3>The market is warming up</h3><p>Be the first to post an item.</p><Link to="/sell" className="btn btn-primary">Start selling</Link></div>}</section>

        <section className="split-feature"><div className="split-copy"><div className="section-kicker">A BETTER WAY TO TRADE</div><h2>Trust is not a feature.<br /><em>It is the whole point.</em></h2><p>Every OjaX profile tells a story: the school, department, level and reputation behind the person you are about to meet.</p><Link to="/safety" className="text-link">How we keep campus safer <Icon name="arrowR" size={15} /></Link><div className="metric-row"><div><b>01</b><span>Verified identity</span></div><div><b>02</b><span>Public meetup points</span></div><div><b>03</b><span>Chat stays on OjaX</span></div></div></div><div className="trust-panel"><div className="trust-panel-top"><span className="chip chip-green"><Icon name="check" size={12} /> VERIFIED STUDENT</span><Icon name="dots" size={19} /></div><div className="profile-orbit"><div className="orbit-ring" /><div className="profile-initials">CA</div><span className="orbit-badge"><Icon name="shield" size={16} /></span></div><h3>Chiamaka A.</h3><p>Computer Science · 300L</p><div className="trust-score"><div><small>TRUST SCORE</small><b>4.9 <span>★</span></b></div><div className="score-bar"><i /></div></div><div className="trust-meta"><span><Icon name="package" size={15} /> 18 trades</span><span><Icon name="calendar" size={15} /> 7 events</span><span><Icon name="location" size={15} /> UNILAG</span></div></div></section>

        <section className="sec"><div className="section-kicker">CAMPUS PULSE</div><div className="sec-head"><div><h2>There is always something happening.</h2><p className="section-sub">From society meetups to late-night creative sessions.</p></div><Link to="/events">Explore events <Icon name="arrowR" size={15} /></Link></div><div className="events-grid">{events.map((e) => <EventCard key={e.id} event={e} onToggle={toggleRsvp} />)}</div></section>

        <section className="sec dark-section"><div><div className="section-kicker light">SELL WITH PURPOSE</div><h2>Turn the things you<br /><em>no longer need</em><br />into someone’s next win.</h2><p>List in minutes. Meet safely. Keep the value moving around campus.</p><Link to="/sell" className="btn btn-light btn-lg">Start selling <Icon name="arrowR" size={16} /></Link></div><div className="dark-stat"><span>₦0</span><b>fees to list</b><small>Launch offer for students</small><div className="stat-line" /><span>8</span><b>photos per listing</b><small>Show your item properly</small></div></section>

        <section className="sec"><div className="sec-head"><div><div className="section-kicker">TRENDING NOW</div><h2>What students are saving.</h2></div><Link to="/browse?sort=popular">See what’s popular <Icon name="arrowR" size={15} /></Link></div><div className="grid-products">{deals.slice(0, 8).map((l) => <ListingCard key={l.id} listing={l} />)}</div></section>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Icon, LogoMark } from "../lib/icons";
import { initials } from "../lib/format";

const CATS = [
  ["electronics", "Electronics", "tv"],
  ["phones", "Phones & Tablets", "smartphone"],
  ["computing", "Computing", "laptop"],
  ["fashion", "Fashion", "shirt"],
  ["textbooks", "Textbooks", "book"],
  ["home", "Home & Furniture", "sofa"],
  ["sports", "Sports", "dumbbell"],
  ["hobbies", "Hobbies & Music", "music"],
  ["beauty", "Beauty & Health", "sparkles"],
  ["services", "Services", "briefcase"],
  ["food", "Food & Groceries", "food"],
  ["other", "Everything Else", "grid"],
] as const;

function Avatar({ name, url, size = 36 }: { name: string; url?: string | null; size?: number }) {
  if (url) return <img src={url} alt={name} className="avatar" style={{ width: size, height: size }} />;
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}
export { Avatar };

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user) {
    return (
      <div className="accbtn-wrap" style={{ display: "flex", gap: 8 }}>
        <Link to="/login" className="btn btn-sm" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700 }}>
          <Icon name="user" size={16} /> Sign in
        </Link>
        <Link to="/register" className="btn btn-sm" style={{ background: "#fff", color: "var(--brand-strong)", fontWeight: 800 }}>
          Join free
        </Link>
      </div>
    );
  }
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="accbtn" onClick={() => setOpen((o) => !o)} aria-label="Account menu">
        <Avatar name={user.fullName} url={user.avatarUrl} size={36} />
        <span className="navtext">
          <span className="lbl">Hi,</span>
          <span className="val">{user.fullName.split(" ")[0].slice(0, 12)} ▾</span>
        </span>
      </button>
      {open && (
        <div className="card" style={{ position: "absolute", right: 0, top: 52, width: 250, padding: 8, zIndex: 200 }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)", marginBottom: 6 }}>
            <b>{user.fullName}</b>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{user.email}</div>
          </div>
          {[
            ["/dashboard", "list", "My dashboard"],
            ["/sell", "plus", "Sell an item"],
            ["/favorites", "heart", "Saved items"],
            ["/messages", "chat", "Messages"],
            ["/profile", "user", "Public profile"],
          ].map(([to, ic, label]) => (
            <Link
              key={to as string}
              to={to as string}
              onClick={() => setOpen(false)}
              style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 12px", borderRadius: 10, fontWeight: 600, fontSize: 13.5, color: "var(--ink-2)" }}
            >
              <Icon name={ic as string} size={17} /> {label}
            </Link>
          ))}
          <button
            onClick={() => { setOpen(false); logout().then(() => nav("/")); }}
            style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 12px", borderRadius: 10, fontWeight: 600, fontSize: 13.5, color: "var(--red)", background: "none", border: 0, width: "100%" }}
          >
            <Icon name="logout" size={17} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useAuth();
  const cart = useCart();

  useEffect(() => {
    if (user) cart.refresh().catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    nav(term ? `/browse?q=${encodeURIComponent(term)}` : "/browse");
  };

  return (
    <div>
      <div className="topbar">
        <div className="container">
          <div className="marquee">
            <span>🏆 Nigeria's #1 student marketplace</span>
            <span>✅ Trade safely inside your campus</span>
            <span>🚚 Nationwide delivery available</span>
            <span>📅 Discover campus events</span>
          </div>
          <div className="right">
            <Link to="/events">Campus events</Link>
            <Link to="/sell">Sell on OjaX</Link>
            <a href="#help" onClick={(e) => e.preventDefault()} title="Help centre coming soon">Help</a>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            <span className="mark"><LogoMark size={30} /></span>
            <span>
              OjaX<small>CAMPUS MARKET</small>
            </span>
          </Link>

          <form className="searchbar" onSubmit={submit} role="search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, laptops, textbooks…"
              aria-label="Search items"
            />
            <button type="submit"><Icon name="search" size={18} /> <span className="sr-only" style={{ fontSize: 13 }}>Search</span></button>
          </form>

          <button className="navicon" aria-label="Cart" onClick={() => nav(user ? "/checkout" : "/login")} style={{ border: 0 }}>
            <Icon name="cart" size={21} />
            {cart.count > 0 && <span className="count">{cart.count > 9 ? "9+" : cart.count}</span>}
          </button>

          <UserMenu />
        </div>
      </header>

      <nav className="catsnav" aria-label="Categories">
        <div className="container">
          <NavLink to="/browse" end className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon name="grid" size={15} /> All
          </NavLink>
          {CATS.map(([code, label, ic]) => (
            <NavLink key={code} to={`/browse?category=${code}`}>
              <Icon name={ic} size={15} /> {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main style={{ minHeight: "60vh" }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="grid">
            <div>
              <div className="brandline">
                <span className="mark" style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", color: "var(--brand-strong)", display: "grid", placeItems: "center" }}>
                  <LogoMark size={36} />
                </span>
                <b style={{ color: "#fff", fontSize: 19 }}>OjaX</b>
              </div>
              <p style={{ marginTop: 0 }}>
                OjaX is the trusted marketplace &amp; events hub built for Nigerian university students — buy, sell and stay
                plugged into campus life, safely.
              </p>
              <p>📍 Lagos, Nigeria · Made by students, for students</p>
            </div>
            <div>
              <h4>Shop</h4>
              <ul>
                <li><Link to="/browse">All items</Link></li>
                <li><Link to="/browse?category=electronics">Electronics</Link></li>
                <li><Link to="/browse?category=textbooks">Textbooks</Link></li>
                <li><Link to="/browse?category=fashion">Fashion</Link></li>
                <li><Link to="/sell">Sell your item</Link></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><Link to="/events">Campus events</Link></li>
                <li><Link to="/about">About OjaX</Link></li>
                <li><Link to="/safety">Safety &amp; trust</Link></li>
                <li><Link to="/help">Help centre</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4>Stay safe on OjaX</h4>
              <ul>
                <li>🛡️ Meet in public campus spots</li>
                <li>💬 Keep chats on OjaX</li>
                <li>💵 No advance payments off-platform</li>
                <li>📸 Inspect items before you pay</li>
              </ul>
            </div>
          </div>
          <div className="bar">
            <span>© {new Date().getFullYear()} OjaX Campus Market. All rights reserved.</span>
            <span style={{ display: "flex", gap: 18 }}>
              <Link to="/about">About</Link><Link to="/safety">Safety</Link><Link to="/help">Help</Link>
            </span>
          </div>
        </div>
      </footer>

      <nav className="mobilenav" aria-label="Mobile">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "on" : "")}><Icon name="store" size={21} />Home</NavLink>
        <NavLink to="/browse" end className={({ isActive }) => (isActive ? "on" : "")}><Icon name="grid" size={21} />Shop</NavLink>
        <NavLink to="/sell" className={({ isActive }) => (isActive ? "on" : "")}><Icon name="plus" size={21} />Sell</NavLink>
        <NavLink to="/events" className={({ isActive }) => (isActive ? "on" : "")}><Icon name="calendar" size={21} />Events</NavLink>
        <NavLink to="/messages" className={({ isActive }) => (isActive ? "on" : "")}><Icon name="chat" size={21} />Chat</NavLink>
      </nav>
    </div>
  );
}

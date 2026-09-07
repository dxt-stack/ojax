import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { del, get, post } from "../lib/api";
import type { EventItem } from "../lib/types";
import { EventCard } from "../components/Cards";
import { Empty, ErrBox, PageLoader, useToast } from "../context/ToastContext";
import { Icon } from "../lib/icons";
import { useAuth } from "../context/AuthContext";
import { fmtDateTime, naira } from "../lib/format";
import { Avatar } from "../components/Layout";

const CATS = ["All", "career", "academic", "hackathons", "socials", "sports-events", "arts", "community", "religious"];
const CAT_LABEL: Record<string, string> = { career: "Career & Networking", academic: "Academic & Seminars", hackathons: "Hackathons & Tech", socials: "Socials & Parties", "sports-events": "Sports & Games", arts: "Arts, Music & Culture", community: "Community & Volunteering", religious: "Religious & Fellowship" };

export default function Events() {
  const [mode, setMode] = useState<"upcoming" | "past">("upcoming");
  const [cat, setCat] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [load, setLoad] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const refresh = useCallback(() => {
    setLoad(true);
    const params = new URLSearchParams({ mode, pageSize: "48" });
    if (cat) params.set("category", cat);
    get<{ items: EventItem[] }>(`/api/events?${params}`)
      .then((d) => setEvents(d.items))
      .catch(() => setEvents([]))
      .finally(() => setLoad(false));
  }, [mode, cat]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (ev: EventItem) => {
    if (!user) return (window.location.href = "/login?next=/events");
    try {
      if (ev.myRsvp) {
        await del(`/api/events/${ev.id}/rsvp`);
        toast("RSVP cancelled");
      } else {
        await post(`/api/events/${ev.id}/rsvp`);
        toast("You're going! ");
      }
      refresh();
    } catch (e: any) { toast(e.message || "Try again", "err"); }
  };

  return (
    <div className="container">
      <div className="breadcrumb"><span>Home</span> <Icon name="arrowR" size={13} /> <b>Campus events</b></div>
      <div className="sec-head">
        <h1 style={{ fontSize: 24 }}> Campus events</h1>
        {user?.isOrg && <Link to="/dashboard?tab=events" className="btn btn-primary btn-sm">+ Post an event</Link>}
      </div>
      <div className="filter-bar">
        <div className="steps" style={{ margin: 0 }}>
          <button className={`step ${mode === "upcoming" ? "on" : ""}`} onClick={() => setMode("upcoming")}>Upcoming</button>
          <button className={`step ${mode === "past" ? "on" : ""}`} onClick={() => setMode("past")}>Past</button>
        </div>
        <select className="select" style={{ width: 230 }} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {CATS.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
        </select>
      </div>
      {load ? <PageLoader /> : events.length === 0 ? (
        <Empty icon="calendar" title={mode === "upcoming" ? "No upcoming events" : "No past events"} text="Student organisations publish their events here — check back soon." />
      ) : (
        <div className="events-grid">{events.map((e) => <EventCard key={e.id} event={e} onToggle={toggle} />)}</div>
      )}
    </div>
  );
}

export function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ev, setEv] = useState<EventItem | null>(null);
  const [load, setLoad] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const loadEv = useCallback(() => {
    get<{ event: EventItem }>(`/api/events/${id}`)
      .then((d) => setEv(d.event))
      .catch((e) => setErr(e.message))
      .finally(() => setLoad(false));
  }, [id]);

  useEffect(() => { loadEv(); }, [loadEv]);

  const rsvp = async () => {
    if (!user) return (window.location.href = `/login?next=/events/${id}`);
    setBusy(true);
    try {
      if (ev?.myRsvp) { await del(`/api/events/${id}/rsvp`); toast("RSVP cancelled"); }
      else { await post(`/api/events/${id}/rsvp`); toast("You're going! "); }
      loadEv();
    } catch (e: any) { toast(e.message, "err"); } finally { setBusy(false); }
  };

  if (load) return <PageLoader />;
  if (err || !ev) return <Empty icon="calendar" title="Event not found" text={err || "It may have been removed."} />;
  const start = new Date(ev.startsAt);
  const isPast = start.getTime() < Date.now();
  const cancelled = ev.status === "cancelled";

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div className="breadcrumb"><Link to="/events">Events</Link> <Icon name="arrowR" size={13} /> <b>{ev.title}</b></div>
      {cancelled && <ErrBox>This event was cancelled by the organisers.</ErrBox>}
      <div className="card" style={{ overflow: "hidden" }}>
        {ev.posterUrl ? <img src={ev.posterUrl} alt={ev.title} style={{ width: "100%", maxHeight: 340, objectFit: "cover" }} />
          : <div style={{ aspectRatio: "16/4", background: "linear-gradient(120deg,#ffd9c7,#ffe3cf 60%,#fff)", display: "grid", placeItems: "center" }}><Icon name="calendar" size={56} color="#f0b49a" /></div>}
        <div style={{ padding: "20px 22px 26px" }}>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 10 }}>
            <span className="chip chip-brand">{CAT_LABEL[ev.category] || ev.category}</span>
            {ev.priceKobo > 0 ? <span className="chip chip-amber">Ticket: {naira(ev.priceKobo)}</span> : <span className="chip chip-green">Free entry</span>}
            {ev.isOnline && <span className="chip chip-blue"> Online</span>}
          </div>
          <h1 style={{ fontSize: 26 }}>{ev.title}</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "10px 0 4px", fontWeight: 700 }}>
            <Icon name="calendar" size={17} color="var(--brand)" /> {fmtDateTime(ev.startsAt)}
            {ev.endsAt && <> – {new Date(ev.endsAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--ink-2)" }}>
            <Icon name="location" size={17} color="var(--brand)" /> {ev.venue}{ev.city ? `, ${ev.city}` : ""} {ev.universityCode ? `(${ev.universityCode})` : ""}
          </div>
          <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "18px 0" }} />
          <div style={{ whiteSpace: "pre-wrap", color: "var(--ink-2)", lineHeight: 1.7 }}>{ev.description || "No description yet."}</div>
          {ev.onlineUrl && <div style={{ marginTop: 12 }}><a className="btn btn-outline btn-sm" href={ev.onlineUrl} target="_blank" rel="noreferrer"><Icon name="eye" size={15} /> Join online</a></div>}
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 16, display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <Avatar name={ev.org.name} url={ev.org.avatarUrl} size={46} />
          <div>
            <b>Organised by {ev.org.name}</b>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{ev.rsvpCount} students going{ev.capacity ? ` · capacity ${ev.capacity}` : ""}</div>
          </div>
        </div>
        {!cancelled && (
          <button className={`btn btn-lg ${ev.myRsvp ? "btn-outline" : "btn-primary"}`} onClick={rsvp} disabled={busy || isPast}>
            {isPast ? "Event ended" : busy ? "…" : ev.myRsvp ? "Going  — tap to cancel" : ev.priceKobo > 0 ? `Get ticket · ${naira(ev.priceKobo)}` : "RSVP — I'm going"}
          </button>
        )}
      </div>
    </div>
  );
}

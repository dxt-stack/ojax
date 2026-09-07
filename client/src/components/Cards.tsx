import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { EventItem, Listing } from "../lib/types";
import { fmtDateTime, naira, nairaCompact, timeAgo } from "../lib/format";
import { Icon } from "../lib/icons";
import { post } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const FALLBACK_BG = "linear-gradient(160deg, #fff4ec, #ffe8da)";

export function FallbackImg({ title }: { title: string }) {
  return (
    <div className="ph-fallback" style={{ background: FALLBACK_BG }}>
      <Icon name="camera" size={34} color="#f0b49a" />
      <span style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#c98a6d", padding: "0 8px" }}>
        {title}
      </span>
    </div>
  );
}

export function Price({ kobo, size = 16.5 }: { kobo: number; size?: number }) {
  return <span style={{ fontWeight: 800, fontSize: size }}>{naira(kobo)}</span>;
}

export function ListingCard({ listing }: { listing: Listing }) {
  const nav = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [fav, setFav] = useState(!!listing.isFavorite);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return nav("/login?next=/browse");
    try {
      const d = await post<{ favorite: boolean }>(`/api/listings/${listing.id}/favorite`);
      setFav(d.favorite);
      toast(d.favorite ? "Saved to favourites " : "Removed from favourites");
    } catch {
      toast("Couldn't update favourite", "err");
    }
  };

  const sold = listing.status === "sold";
  return (
    <Link to={`/item/${listing.id}`} className={`pcard ${sold ? "sold" : ""}`}>
      <div className="ph">
        {listing.coverUrl ? <img src={listing.coverUrl} alt={listing.title} loading="lazy" /> : <FallbackImg title={listing.title} />}
        <div className="badges">
          {listing.negotiable && <span className="chip chip-brand" style={{ fontSize: 10.5 }}>NEGOTIABLE</span>}
          {listing.status === "paused" && <span className="chip chip-amber" style={{ fontSize: 10.5 }}>PAUSED</span>}
        </div>
        <button
          className={`fav ${fav ? "on" : ""}`}
          onClick={toggleFav}
          aria-label={fav ? "Remove from saved" : "Save item"}
        >
          <Icon name="heart" size={17} />
        </button>
        {sold && (
          <div className="sold-ribbon"><span>SOLD</span></div>
        )}
      </div>
      <div className="pb">
        <span className="title">{listing.title}</span>
        <Price kobo={listing.priceKobo} />
        <div className="meta">
          <span>{listing.seller?.fullName?.split(" ")[0] ?? "Campus seller"}</span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export function EventCard({ event, onToggle }: { event: EventItem; onToggle: (e: EventItem) => void }) {
  const start = new Date(event.startsAt);
  const isPast = start.getTime() < Date.now();
  return (
    <div className="ecard">
      {event.posterUrl ? (
        <img src={event.posterUrl} alt={event.title} className="poster" loading="lazy" />
      ) : (
        <div className="poster" style={{ background: "linear-gradient(120deg,#ffd9c7,#ffe3cf 60%,#fff)" }} />
      )}
      <div className="top">
        <div className="when">
          <div className="d">{start.getDate()}</div>
          <div className="m">{start.toLocaleString("en", { month: "short" }).toUpperCase()}</div>
          <div className="t">{start.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/events/${event.id}`}>
            <h3 style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.title}</h3>
          </Link>
          <div className="venue"><Icon name="location" size={13} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.venue}</span></div>
        </div>
      </div>
      <div className="body">
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.description || "No description yet."}
        </p>
        <div className="foot">
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
            {event.rsvpCount} going{event.capacity ? ` · ${Math.max(0, event.capacity - event.rsvpCount)} spots left` : ""}
          </span>
          <button
            className={`btn btn-sm ${event.myRsvp ? "btn-outline" : "btn-primary"}`}
            disabled={isPast}
            onClick={() => onToggle(event)}
          >
            {isPast ? "Ended" : event.myRsvp ? "Going " : event.priceKobo > 0 ? `RSVP · ${naira(event.priceKobo)}` : "RSVP free"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function rsvpBtn(event: EventItem): string {
  return fmtDateTime(event.startsAt);
}

export { nairaCompact };

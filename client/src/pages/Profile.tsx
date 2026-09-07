import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { get } from "../lib/api";
import type { Listing, Page, RatingSummary, Review, User } from "../lib/types";
import { naira, timeAgo } from "../lib/format";
import { Icon } from "../lib/icons";
import { Avatar } from "../components/Layout";
import { Empty, PageLoader } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { RatingLine, Stars } from "../components/Stars";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<{ activeListings: number; soldItems: number } | null>(null);
  const [rating, setRating] = useState<RatingSummary>({ avg: null, count: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [items, setItems] = useState<Listing[]>([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    setLoad(true);
    const profileId = id || user?.id;
    if (!profileId) { setLoad(false); return; }
    Promise.all([
      get<{ user: User; stats: { activeListings: number; soldItems: number }; rating: RatingSummary }>(`/api/users/${profileId}`),
      get<{ reviews: Review[] }>(`/api/reviews/seller/${profileId}`).catch(() => ({ reviews: [] })),
      get<Page<Listing>>(`/api/listings?sellerId=${profileId}&pageSize=24`).catch(() => null),
    ])
      .then(([a, b, c]) => {
        setProfile(a.user); setStats(a.stats); setRating(a.rating || { avg: null, count: 0 });
        setReviews(b.reviews); setItems(c?.items || []);
      })
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [id, user]);

  if (load) return <PageLoader />;
  if (!profile) return <Empty icon="user" title="Profile not found" />;

  return (
    <div className="container" style={{ maxWidth: 1080 }}>
      <div className="card" style={{ padding: 26, marginTop: 8 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar name={profile.fullName} url={profile.avatarUrl} size={88} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: 24 }}>{profile.fullName}
              {profile.verified && <span title="Verified student" style={{ color: "var(--green)", marginLeft: 6 }}></span>}
            </h1>
            <div style={{ color: "var(--ink-2)", fontSize: 14 }}>
              {profile.isOrg && profile.orgName ? <><b>{profile.orgName}</b><br /></> : null}
              {profile.universityCode && <> {profile.universityCode}{profile.department ? ` · ${profile.department}` : ""}{profile.level ? ` · ${profile.level}` : ""}<br /></>}
              Joined {timeAgo(profile.joinedAt)} · {stats?.soldItems ?? 0} sold
            </div>
            <div style={{ marginTop: 6 }}>
              <RatingLine avg={rating.avg} count={rating.count} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 26, textAlign: "center" }}>
            <div><div style={{ fontSize: 26, fontWeight: 800 }}>{stats?.activeListings ?? 0}</div><div style={{ fontSize: 12, color: "var(--ink-3)" }}>Active items</div></div>
            <div><div style={{ fontSize: 26, fontWeight: 800 }}>{stats?.soldItems ?? 0}</div><div style={{ fontSize: 12, color: "var(--ink-3)" }}>Sold</div></div>
          </div>
          {user?.id === profile.id && <Link to="/settings" className="btn btn-outline btn-sm">Edit profile</Link>}
        </div>
        {profile.bio && <p style={{ margin: "14px 0 0", color: "var(--ink-2)" }}>{profile.bio}</p>}
        {profile.meetupSpot && (
          <div style={{ marginTop: 10, fontSize: 13, display: "flex", gap: 7, alignItems: "center", color: "var(--ink-2)" }}>
            <Icon name="location" size={15} color="var(--brand)" /> Usually meets at: <b>{profile.meetupSpot}</b>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start", marginTop: 18 }} className="profile-cols">
        <section className="card" style={{ padding: 20 }}>
          <div className="sec-head" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 18 }}>{profile.isOrg ? "What this organisation posts" : "Items for sale"}</h2>
          </div>
          {items.length === 0 ? (
            <Empty icon="store" title="Nothing on the market yet" text="Check back soon." />
          ) : (
            <div className="grid-products wide">{items.map((l) => <LinkCard l={l} key={l.id} />)}</div>
          )}
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="sec-head" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 18 }}>Reviews &amp; ratings</h2>
          </div>
          {reviews.length === 0 ? (
            <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: 0 }}>
              No reviews yet — every review here comes from a real confirmed delivery, so the first few take time. That's by design.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 5 }}>
                    <Avatar name={r.buyer.fullName} url={r.buyer.avatarUrl} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 13.5 }}>{r.buyer.fullName}</b>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        bought: {r.itemTitle}
                      </div>
                    </div>
                    <Stars value={r.rating} size={13} />
                  </div>
                  {r.comment && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--ink-2)" }}>{r.comment}</p>}
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{timeAgo(r.createdAt)} · verified purchase</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <style>{`@media (max-width:980px){.profile-cols{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

function LinkCard({ l }: { l: Listing }) {
  return (
    <Link to={`/item/${l.id}`} className="pcard">
      <div className="ph">
        {l.coverUrl ? <img src={l.coverUrl} alt={l.title} loading="lazy" /> : <span className="ph-fallback"><Icon name="camera" size={26} color="#d0d5dd" /></span>}
        {l.status !== "active" && <div className="sold-ribbon"><span>{l.status === "sold" ? "SOLD" : l.status.toUpperCase()}</span></div>}
      </div>
      <div className="pb">
        <span className="title">{l.title}</span>
        <span style={{ fontWeight: 800, fontSize: 16 }}>{naira(l.priceKobo)}</span>
      </div>
    </Link>
  );
}

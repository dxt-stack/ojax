import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, post } from "../lib/api";
import { Icon } from "../lib/icons";
import { timeAgo } from "../lib/format";
import { PageLoader, Empty } from "../context/ToastContext";

export default function Notifications() {
  const [data, setData] = useState<{ unread: number; items: any[] } | null>(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    get<{ unread: number; items: any[] }>("/api/notifications").then(setData).finally(() => setLoad(false));
  }, []);

  const markAll = async () => {
    await post("/api/notifications/read", {}).catch(() => {});
    setData(d => d ? { ...d, unread: 0, items: d.items.map(i => ({ ...i, read: true })) } : d);
  };

  if (load) return <PageLoader />;

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="breadcrumb"><Link to="/">Home</Link> <Icon name="arrowR" size={13} /> <b>Notifications</b></div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
          <div>
            <h2 style={{ fontSize: 18 }}>Notifications {data?.unread ? <span className="chip chip-brand" style={{ marginLeft: 8 }}>{data.unread} new</span> : null}</h2>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>Orders, messages, events & system updates</div>
          </div>
          {data?.unread ? <button className="btn btn-outline btn-sm" onClick={markAll}>Mark all read</button> : null}
        </div>

        {!data?.items.length ? (
          <Empty icon="bell" title="No notifications" text="You're all caught up!" />
        ) : (
          <div style={{ display: "grid", gap: 1, background: "var(--line)" }}>
            {data.items.map((n: any) => (
              <div key={n.id} style={{ display: "flex", gap: 14, padding: "16px 20px", background: n.read ? "#fff" : "#fff8f4", alignItems: "flex-start" }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: n.type === "order" ? "#ecfdf3" : n.type === "message" ? "#fff0e8" : "#eff8ff", color: n.type === "order" ? "#079455" : n.type === "message" ? "#e95b2b" : "#175cd3", flexShrink: 0 }}>
                  <Icon name={n.type === "order" ? "package" : n.type === "message" ? "chat" : "calendar"} size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <b style={{ fontSize: 14 }}>{n.title}</b>
                    {!n.read && <span style={{ width: 7, height: 7, background: "var(--brand)", borderRadius: "50%" }} />}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{n.body}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6 }}>{timeAgo(n.createdAt)}</div>
                </div>
                <Link to={n.type === "order" ? "/dashboard?tab=orders" : n.type === "message" ? "/messages" : "/events"} className="btn btn-ghost btn-sm">
                  <Icon name="arrowR" size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

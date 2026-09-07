import { Icon } from "../lib/icons";

/** Interactive or static star rating (1–5). */
export function Stars({ value, onChange, size = 17 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const set = onChange ?? (() => {});
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => set(i)}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          style={{ background: "none", border: 0, padding: 0, color: i <= Math.round(value) ? "#f5a623" : "#d0d5dd", cursor: onChange ? "pointer" : "default" }}
        >
          <Icon name="star" size={size} />
        </button>
      ))}
    </span>
  );
}

/** One-line rating display: ★ 4.8 (12) */
export function RatingLine({ avg, count }: { avg: number | null; count: number }) {
  if (!count || avg === null) return <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>No ratings yet</span>;
  return (
    <span style={{ fontSize: 13, color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 5 }}>
      <Icon name="star" size={14} color="#f5a623" />
      <b style={{ color: "var(--ink)" }}>{avg.toFixed(1)}</b>
      <span>({count})</span>
    </span>
  );
}

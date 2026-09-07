// Formatting helpers (money is kobo everywhere from the API)

export function naira(kobo: number): string {
  const n = kobo / 100;
  const whole = n % 1 === 0;
  const v = n.toLocaleString("en-NG", { maximumFractionDigits: whole ? 0 : 2, minimumFractionDigits: 0 });
  return `₦${v}`;
}

export function nairaCompact(kobo: number): string {
  const n = kobo / 100;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return naira(kobo);
}

export function nairaPlain(kobo: number): string {
  return (kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function dateParts(iso: string) {
  const d = new Date(iso);
  return { day: d.getDate(), month: MONTHS[d.getMonth()], time: d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) };
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}, ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("")
    .toUpperCase();
}

export function priceInputToKobo(value: string): number | null {
  const clean = value.replace(/[₦,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(parseFloat(clean) * 100);
}

/** Money is always transported as an integer count of kobo (₦1 = 100k). */

export function koboToNaira(kobo: number): number {
  return Math.round(kobo) / 100;
}

export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira)) throw new Error("nairaToKobo: not a number");
  return Math.round(naira * 100);
}

/** Format kobo as a ₦ string, e.g. 250000 -> "₦2,500". */
export function fmtKobo(kobo: number, opts: { compact?: boolean } = {}): string {
  const naira = koboToNaira(kobo);
  if (opts.compact && naira >= 1_000_000) {
    const m = naira / 1_000_000;
    return `₦${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (opts.compact && naira >= 1_000) {
    const t = naira / 1_000;
    return `₦${t % 1 === 0 ? t.toFixed(0) : t.toFixed(1)}k`;
  }
  return `₦${naira.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: naira % 1 === 0 ? 0 : 2,
  })}`;
}

export function assertSafePriceKobo(kobo: number) {
  if (!Number.isSafeInteger(kobo)) throw new Error("price out of range");
  if (kobo < 0) throw new Error("negative price");
  if (kobo > 5_000_000_000) throw new Error("price too large");
}

import { describe, expect, it } from "vitest";
import { fmtKobo, koboToNaira, nairaToKobo } from "./money.js";

describe("money helpers", () => {
  it("converts naira <-> kobo exactly", () => {
    expect(nairaToKobo(2500)).toBe(250_000);
    expect(nairaToKobo(1.5)).toBe(150);
    expect(koboToNaira(250_000)).toBe(2500);
  });

  it("formats naira strings with thousands separators", () => {
    expect(fmtKobo(250_000)).toBe("₦2,500");
    expect(fmtKobo(500_000_000)).toBe("₦5,000,000");
    expect(fmtKobo(450)).toBe("₦4.5");
    expect(fmtKobo(475)).toBe("₦4.75");
    expect(fmtKobo(400)).toBe("₦4");
    expect(fmtKobo(0)).toBe("₦0");
  });

  it("supports compact million/thousand notation", () => {
    expect(fmtKobo(200_000_000, { compact: true })).toBe("₦2M");
    expect(fmtKobo(250_000_000, { compact: true })).toBe("₦2.5M");
    expect(fmtKobo(250_000, { compact: true })).toBe("₦2.5k");
    expect(fmtKobo(450, { compact: true })).toBe("₦4.5");
  });
});

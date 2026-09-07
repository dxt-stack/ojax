import { describe, expect, it } from "vitest";
import { CATEGORIES, CONDITIONS, categoryByCode, conditionLabel, UNIVERSITIES } from "./catalog.js";

describe("catalog", () => {
  it("has stable category codes with subsections", () => {
    const codes = CATEGORIES.map((c) => c.code);
    expect(codes).toContain("phones");
    expect(codes).toContain("textbooks");
    expect(codes).toContain("fashion");
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of CATEGORIES) {
      expect(c.label.length).toBeGreaterThan(2);
      expect(c.icon.length).toBeGreaterThan(0);
    }
  });

  it("looks categories up by code", () => {
    expect(categoryByCode("computing")?.label).toBe("Computing");
    expect(categoryByCode("nope")).toBeUndefined();
  });

  it("maps condition codes to labels", () => {
    expect(conditionLabel("like-new")).toBe("Like new");
    expect(conditionLabel("unknown-code")).toBe("unknown-code");
    expect(CONDITIONS.length).toBeGreaterThanOrEqual(6);
  });

  it("covers the major Nigerian universities", () => {
    expect(UNIVERSITIES.length).toBeGreaterThan(15);
    expect(UNIVERSITIES.map((u) => u.code)).toContain("UNILAG");
  });
});

import { describe, expect, it } from "vitest";
import { citySuggestions, featuredCities, normalizeCity } from "@/data/places";

describe("artist city", () => {
  it("keeps launch cities as they were stored before", () => {
    for (const c of featuredCities) expect(normalizeCity(c)).toBe(c);
    expect(normalizeCity("  tegucigalpa ")).toBe("Tegucigalpa");
  });

  it("matches known cities regardless of accents and capitals", () => {
    expect(normalizeCity("bogota, colombia")).toBe("Bogotá, Colombia");
    expect(normalizeCity("Madrid, spain")).toBe("Madrid, Spain");
    expect(normalizeCity("SAO PAULO, BRAZIL")).toBe("São Paulo, Brazil");
    expect(normalizeCity("roatan")).toBe("Roatán");
  });

  it("never guesses a country for a bare name outside Honduras", () => {
    expect(normalizeCity("Granada")).toBe("Granada");
    expect(normalizeCity("valencia")).toBe("valencia");
  });

  it("accepts any other city as typed, tidied", () => {
    expect(normalizeCity("  Ushuaia,   Argentina ")).toBe("Ushuaia, Argentina");
    expect(normalizeCity("Santa Lucía")).toBe("Santa Lucía");
    expect(normalizeCity("   ")).toBe("");
    expect(normalizeCity("x".repeat(200))).toHaveLength(80);
  });

  it("has no duplicate suggestions", () => {
    expect(new Set(citySuggestions.map((c) => c.toLowerCase())).size).toBe(citySuggestions.length);
  });
});

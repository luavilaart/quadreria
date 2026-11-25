import { describe, expect, it } from "vitest";
import { mapsEmbedUrl, mapsSearchUrl, placeQuery } from "@/lib/maps";
import { faqJsonLd, pagesCopy } from "@/i18n/pages";

type Tree = Record<string, unknown>;
const shape = (v: unknown): unknown =>
  typeof v === "function" ? "fn" : Array.isArray(v) ? v.length : v && typeof v === "object"
    ? Object.fromEntries(Object.entries(v as Tree).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, shape(x)])) : typeof v;
const strings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : typeof v === "function" ? [String((v as (...a: unknown[]) => unknown)("X", 1))]
    : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v as Tree).flatMap(strings) : [];

describe("maps", () => {
  it("joins venue, address and city, skipping blanks, repeats and Online", () => {
    expect(placeQuery(["Casa Taller", " Col. Palmira ", "Tegucigalpa"])).toBe("Casa Taller, Col. Palmira, Tegucigalpa");
    expect(placeQuery([null, "Galería Sur", "galería sur", "Tegucigalpa"])).toBe("Galería Sur, Tegucigalpa");
    expect(placeQuery(["", undefined, "Online"])).toBe("");
  });
  it("builds Google Maps links that need no API key", () => {
    expect(mapsSearchUrl("Casa Taller, Tegucigalpa")).toBe("https://www.google.com/maps/search/?api=1&query=Casa%20Taller%2C%20Tegucigalpa");
    expect(mapsEmbedUrl("Galería Sur")).toContain("output=embed");
  });
});

describe("page copy", () => {
  it("Spanish matches English key for key", () => {
    expect(shape(pagesCopy.es)).toEqual(shape(pagesCopy.en));
  });
  it("Spanish uses vos, not tú", () => {
    const tu = /(?<!\p{L})(tú|tienes|puedes|quieres|eres|Elige|Agrega|Escribe|Empieza|Abre|Mira|Busca|Toca|Usa|Pasa)(?!\p{L})/u;
    expect(strings(pagesCopy.es).filter((s) => tu.test(s))).toEqual([]);
  });
  it("writes FAQ structured data for search and AI answers", () => {
    const data = JSON.parse(faqJsonLd(pagesCopy.en.home.faq));
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(pagesCopy.en.home.faq.length);
    expect(data.mainEntity[0].acceptedAnswer.text).toBe(pagesCopy.en.home.faq[0]![1]);
  });
});
